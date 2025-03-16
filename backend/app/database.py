"""
MongoDB database integration for chat application.
Handles conversation storage and retrieval.
"""
from datetime import datetime
from typing import List, Optional, Dict, Any
import json
import os
import logging
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import DESCENDING
from bson import ObjectId

from app.config import MONGO_URI, MONGO_DB_NAME

# Collections
CONVERSATIONS_COLLECTION = "conversations"
MESSAGES_COLLECTION = "messages"

# Fallback file paths for local storage when MongoDB isn't available
DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
CONVERSATIONS_FILE = os.path.join(DATA_DIR, "conversations.json")
MESSAGES_FILE = os.path.join(DATA_DIR, "messages.json")

# Ensure data directory exists
os.makedirs(DATA_DIR, exist_ok=True)

# Initialize empty data files if they don't exist
for file_path in [CONVERSATIONS_FILE, MESSAGES_FILE]:
    if not os.path.exists(file_path):
        with open(file_path, 'w') as f:
            json.dump([], f)

class Database:
    """Database class for MongoDB operations with fallback to local JSON files"""
    client: AsyncIOMotorClient = None
    use_mongodb: bool = True
    
    @classmethod
    async def connect_to_mongo(cls, mongo_uri: str = MONGO_URI):
        """Connect to MongoDB or set up local fallback"""
        try:
            cls.client = AsyncIOMotorClient(mongo_uri, serverSelectionTimeoutMS=5000)
            # Test the connection
            await cls.client.admin.command('ping')
            cls.use_mongodb = True
            logging.info("Connected to MongoDB successfully")
        except Exception as e:
            logging.warning(f"Failed to connect to MongoDB: {e}. Using local JSON storage instead.")
            cls.use_mongodb = False
        
    @classmethod
    async def close_mongo_connection(cls):
        """Close MongoDB connection"""
        if cls.client and cls.use_mongodb:
            cls.client.close()
    
    @classmethod
    async def get_db(cls):
        """Get database instance"""
        if cls.use_mongodb:
            return cls.client[MONGO_DB_NAME]
        return None
    
    @classmethod
    async def create_conversation(cls, title: str) -> str:
        """Create a new conversation and return its ID"""
        if cls.use_mongodb:
            db = await cls.get_db()
            result = await db[CONVERSATIONS_COLLECTION].insert_one({
                "title": title,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            })
            return str(result.inserted_id)
        else:
            # Local file fallback
            with open(CONVERSATIONS_FILE, 'r') as f:
                conversations = json.load(f)
            
            # Generate a simple ID
            new_id = str(len(conversations) + 1)
            new_conversation = {
                "_id": new_id,
                "title": title,
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat()
            }
            
            conversations.append(new_conversation)
            
            with open(CONVERSATIONS_FILE, 'w') as f:
                json.dump(conversations, f, indent=2)
            
            return new_id
    
    @classmethod
    async def get_conversations(cls, limit: int = 20, skip: int = 0) -> List[Dict[str, Any]]:
        """Get list of conversations"""
        if cls.use_mongodb:
            db = await cls.get_db()
            cursor = db[CONVERSATIONS_COLLECTION].find().sort(
                "updated_at", DESCENDING
            ).skip(skip).limit(limit)
            
            conversations = []
            async for document in cursor:
                document["_id"] = str(document["_id"])
                conversations.append(document)
            
            return conversations
        else:
            # Local file fallback
            with open(CONVERSATIONS_FILE, 'r') as f:
                conversations = json.load(f)
            
            # Sort by updated_at in descending order
            conversations.sort(key=lambda x: x["updated_at"], reverse=True)
            
            return conversations[skip:skip+limit]
    
    @classmethod
    async def get_conversation(cls, conversation_id: str) -> Optional[Dict[str, Any]]:
        """Get a conversation by ID"""
        if cls.use_mongodb:
            db = await cls.get_db()
            conversation = await db[CONVERSATIONS_COLLECTION].find_one({"_id": ObjectId(conversation_id)})
            
            if conversation:
                conversation["_id"] = str(conversation["_id"])
                return conversation
            return None
        else:
            # Local file fallback
            with open(CONVERSATIONS_FILE, 'r') as f:
                conversations = json.load(f)
            
            for conversation in conversations:
                if conversation["_id"] == conversation_id:
                    return conversation
            
            return None
    
    @classmethod
    async def update_conversation_title(cls, conversation_id: str, title: str) -> bool:
        """Update conversation title"""
        if cls.use_mongodb:
            db = await cls.get_db()
            result = await db[CONVERSATIONS_COLLECTION].update_one(
                {"_id": ObjectId(conversation_id)},
                {"$set": {"title": title, "updated_at": datetime.utcnow()}}
            )
            return result.modified_count > 0
        else:
            # Local file fallback
            with open(CONVERSATIONS_FILE, 'r') as f:
                conversations = json.load(f)
            
            for conversation in conversations:
                if conversation["_id"] == conversation_id:
                    conversation["title"] = title
                    conversation["updated_at"] = datetime.utcnow().isoformat()
                    
                    with open(CONVERSATIONS_FILE, 'w') as f:
                        json.dump(conversations, f, indent=2)
                    
                    return True
            
            return False
    
    @classmethod
    async def delete_conversation(cls, conversation_id: str) -> bool:
        """Delete a conversation and its messages"""
        if cls.use_mongodb:
            db = await cls.get_db()
            
            # Delete the conversation
            result = await db[CONVERSATIONS_COLLECTION].delete_one({"_id": ObjectId(conversation_id)})
            
            # Delete all messages in the conversation
            await db[MESSAGES_COLLECTION].delete_many({"conversation_id": conversation_id})
            
            return result.deleted_count > 0
        else:
            # Local file fallback
            with open(CONVERSATIONS_FILE, 'r') as f:
                conversations = json.load(f)
            
            initial_count = len(conversations)
            conversations = [c for c in conversations if c["_id"] != conversation_id]
            
            with open(CONVERSATIONS_FILE, 'w') as f:
                json.dump(conversations, f, indent=2)
            
            # Delete associated messages
            with open(MESSAGES_FILE, 'r') as f:
                messages = json.load(f)
            
            messages = [m for m in messages if m["conversation_id"] != conversation_id]
            
            with open(MESSAGES_FILE, 'w') as f:
                json.dump(messages, f, indent=2)
            
            return len(conversations) < initial_count
    
    @classmethod
    async def add_message(cls, conversation_id: str, text: str, sender: str) -> str:
        """Add a message to a conversation"""
        if cls.use_mongodb:
            db = await cls.get_db()
            
            # Update conversation's updated_at timestamp
            await db[CONVERSATIONS_COLLECTION].update_one(
                {"_id": ObjectId(conversation_id)},
                {"$set": {"updated_at": datetime.utcnow()}}
            )
            
            # Insert the message
            result = await db[MESSAGES_COLLECTION].insert_one({
                "conversation_id": conversation_id,
                "text": text,
                "sender": sender,
                "created_at": datetime.utcnow()
            })
            
            return str(result.inserted_id)
        else:
            # Local file fallback
            # Update conversation's updated_at timestamp
            with open(CONVERSATIONS_FILE, 'r') as f:
                conversations = json.load(f)
            
            for conversation in conversations:
                if conversation["_id"] == conversation_id:
                    conversation["updated_at"] = datetime.utcnow().isoformat()
                    
                    with open(CONVERSATIONS_FILE, 'w') as f:
                        json.dump(conversations, f, indent=2)
                    
                    break
            
            # Add the message
            with open(MESSAGES_FILE, 'r') as f:
                messages = json.load(f)
            
            new_id = str(len(messages) + 1)
            new_message = {
                "_id": new_id,
                "conversation_id": conversation_id,
                "text": text,
                "sender": sender,
                "created_at": datetime.utcnow().isoformat()
            }
            
            messages.append(new_message)
            
            with open(MESSAGES_FILE, 'w') as f:
                json.dump(messages, f, indent=2)
            
            return new_id
    
    @classmethod
    async def get_messages(cls, conversation_id: str) -> List[Dict[str, Any]]:
        """Get all messages in a conversation"""
        if cls.use_mongodb:
            db = await cls.get_db()
            cursor = db[MESSAGES_COLLECTION].find(
                {"conversation_id": conversation_id}
            ).sort("created_at", 1)  # Ascending order by creation time
            
            messages = []
            async for document in cursor:
                document["_id"] = str(document["_id"])
                messages.append(document)
            
            return messages
        else:
            # Local file fallback
            with open(MESSAGES_FILE, 'r') as f:
                all_messages = json.load(f)
            
            # Filter messages for this conversation
            conversation_messages = [m for m in all_messages if m["conversation_id"] == conversation_id]
            
            # Sort by created_at
            conversation_messages.sort(key=lambda x: x["created_at"])
            
            return conversation_messages
