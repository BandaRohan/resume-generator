from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from app.agent import ResumeAgent
from app.config import HOST, PORT, ALLOW_ORIGINS

# Initialize FastAPI app
app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOW_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Model to handle chat input
class ChatInput(BaseModel):
    message: str

# Create an instance of ResumeAgent
resume_agent = ResumeAgent()

@app.post("/chat/")
async def chat(input_data: ChatInput):
    """Chat endpoint to interact with the resume generator agent."""
    try:
        response = resume_agent.process_message(input_data.message)
        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=HOST, port=PORT, reload=True)
