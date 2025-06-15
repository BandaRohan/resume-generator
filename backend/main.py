from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from typing import List, Optional
import logging

from app.agent import ResumeAgent
from app.config import HOST, PORT, ALLOW_ORIGINS
from app.database import Database
from app.routes import router as auth_router
from app.auth import get_current_user

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(title="Resume Generator API")

# Include authentication router
app.include_router(auth_router)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOW_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize the resume agent
resume_agent = ResumeAgent()

# Database connection events
@app.on_event("startup")
async def startup_db_client():
    await Database.connect_to_mongo()

@app.on_event("shutdown")
async def shutdown_db_client():
    await Database.close_mongo_connection()

# Request models
class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None

class ConversationCreate(BaseModel):
    title: str = "New Conversation"

class ConversationUpdate(BaseModel):
    title: str

# Response models
class ChatResponse(BaseModel):
    response: str
    conversation_id: str

class ConversationResponse(BaseModel):
    id: str
    title: str

# Chat endpoint
@app.post("/chat/", response_model=ChatResponse)
async def chat(request: ChatRequest, current_user: dict = Depends(get_current_user)):
    try:
        # Create a new conversation if none exists
        conversation_id = request.conversation_id
        if not conversation_id:
            conversation_id = await Database.create_conversation("Resume Conversation", current_user.get("id"))
        
        # Process the message with the resume agent, passing the conversation_id
        response = resume_agent.process_message(request.message, conversation_id)
        
        # Save the user message
        await Database.add_message(conversation_id, request.message, "user")
        
        # Save the bot response
        await Database.add_message(conversation_id, response, "bot")
        
        return {"response": response, "conversation_id": conversation_id}
    except Exception as e:
        logger.error(f"Error processing chat request: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Conversation endpoints
@app.post("/conversations/", response_model=ConversationResponse)
async def create_conversation(request: ConversationCreate, current_user: dict = Depends(get_current_user)):
    try:
        conversation_id = await Database.create_conversation(request.title, current_user.get("id"))
        return {"id": conversation_id, "title": request.title}
    except Exception as e:
        logger.error(f"Error creating conversation: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/conversations/{conversation_id}")
async def delete_conversation(conversation_id: str, current_user: dict = Depends(get_current_user)):
    try:
        # Check if the conversation belongs to the user
        conversation = await Database.get_conversation(conversation_id, current_user.get("id"))
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")
        
        # Delete the conversation
        success = await Database.delete_conversation(conversation_id)
        if not success:
            raise HTTPException(status_code=500, detail="Failed to delete conversation")
        
        return {"success": True}
    except Exception as e:
        logger.error(f"Error deleting conversation: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/conversations/")
async def get_conversations(skip: int = 0, limit: int = 20, current_user: dict = Depends(get_current_user)):
    try:
        conversations = await Database.get_conversations(limit, skip, current_user.get("id"))
        return conversations
    except Exception as e:
        logger.error(f"Error getting conversations: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/conversations/{conversation_id}/messages")
async def get_conversation_messages(conversation_id: str, current_user: dict = Depends(get_current_user)):
    try:
        # Check if the conversation belongs to the user
        conversation = await Database.get_conversation(conversation_id, current_user.get("id"))
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")
        
        # Get messages for the conversation
        messages = await Database.get_messages(conversation_id)
        return {"messages": messages}
    except Exception as e:
        logger.error(f"Error getting conversation messages: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/conversations/{conversation_id}")
async def get_conversation(conversation_id: str):
    try:
        conversation = await Database.get_conversation(conversation_id)
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")
        return conversation
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting conversation: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/conversations/{conversation_id}", response_model=ConversationResponse)
async def update_conversation(conversation_id: str, request: ConversationUpdate):
    try:
        success = await Database.update_conversation_title(conversation_id, request.title)
        if not success:
            raise HTTPException(status_code=404, detail="Conversation not found")
        return {"id": conversation_id, "title": request.title}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating conversation: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/conversations/{conversation_id}")
async def delete_conversation(conversation_id: str):
    try:
        # Clear the conversation memory in the agent
        resume_agent.clear_memory(conversation_id)
        
        # Delete the conversation from the database
        success = await Database.delete_conversation(conversation_id)
        if not success:
            raise HTTPException(status_code=404, detail="Conversation not found")
        return {"message": "Conversation deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting conversation: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/conversations/{conversation_id}/messages")
async def get_messages(conversation_id: str):
    try:
        messages = await Database.get_messages(conversation_id)
        return messages
    except Exception as e:
        logger.error(f"Error getting messages: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Error handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "An unexpected error occurred. Please try again."},
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=HOST, port=PORT)
