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
from app.auth import get_password_hash, verify_password

# Collections
CONVERSATIONS_COLLECTION = "conversations"
MESSAGES_COLLECTION = "messages"
USERS_COLLECTION = "users"

# Fallback file paths for local storage when MongoDB isn't available
DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
CONVERSATIONS_FILE = os.path.join(DATA_DIR, "conversations.json")
MESSAGES_FILE = os.path.join(DATA_DIR, "messages.json")
USERS_FILE = os.path.join(DATA_DIR, "users.json")

# Ensure data directory exists
os.makedirs(DATA_DIR, exist_ok=True)

# Initialize empty data files if they don't exist
for file_path in [CONVERSATIONS_FILE, MESSAGES_FILE, USERS_FILE]:
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
    
    # User-related methods
    @classmethod
    async def create_user(cls, name: str, email: str, password: str) -> str:
        """Create a new user and return its ID"""
        # Hash the password
        hashed_password = get_password_hash(password)
        
        if cls.use_mongodb:
            db = await cls.get_db()
            
            # Check if user with this email already exists
            existing_user = await db[USERS_COLLECTION].find_one({"email": email})
            if existing_user:
                return None
            
            result = await db[USERS_COLLECTION].insert_one({
                "name": name,
                "email": email,
                "password": hashed_password,
                "created_at": datetime.utcnow()
            })
            return str(result.inserted_id)
        else:
            # Local file fallback
            with open(USERS_FILE, 'r') as f:
                users = json.load(f)
            
            # Check if user with this email already exists
            if any(user["email"] == email for user in users):
                return None
            
            # Generate a simple ID
            new_id = str(len(users) + 1)
            new_user = {
                "_id": new_id,
                "name": name,
                "email": email,
                "password": hashed_password,
                "created_at": datetime.utcnow().isoformat()
            }
            
            users.append(new_user)
            
            with open(USERS_FILE, 'w') as f:
                json.dump(users, f, indent=2)
            
            return new_id
    
    @classmethod
    async def get_user_by_email(cls, email: str) -> Optional[Dict[str, Any]]:
        """Get a user by email"""
        if cls.use_mongodb:
            db = await cls.get_db()
            user = await db[USERS_COLLECTION].find_one({"email": email})
            if user:
                user["id"] = str(user["_id"])
                user["user_id"] = str(user["_id"])
                del user["_id"]
            return user
        else:
            # Local file fallback
            with open(USERS_FILE, 'r') as f:
                users = json.load(f)
            
            for user in users:
                if user["email"] == email:
                    user_copy = user.copy()
                    user_copy["id"] = user_copy["_id"]
                    user_copy["user_id"] = user_copy["_id"]
                    del user_copy["_id"]
                    return user_copy
            
            return None
    
    @classmethod
    async def get_user_by_id(cls, user_id: str) -> Optional[Dict[str, Any]]:
        """Get a user by ID"""
        if cls.use_mongodb:
            db = await cls.get_db()
            try:
                user = await db[USERS_COLLECTION].find_one({"_id": ObjectId(user_id)})
                if user:
                    user["_id"] = str(user["_id"])
                    user["id"] = user["_id"]
                    user["user_id"] = user["_id"]
                return user
            except:
                return None
        else:
            # Local file fallback
            with open(USERS_FILE, 'r') as f:
                users = json.load(f)
            
            for user in users:
                if user["_id"] == user_id:
                    user_copy = user.copy()
                    user_copy["id"] = user_copy["_id"]
                    del user_copy["_id"]
                    return user_copy
            
            return None
    
    @classmethod
    async def authenticate_user(cls, email: str, password: str) -> Optional[Dict[str, Any]]:
        """Authenticate a user by email and password"""
        user = await cls.get_user_by_email(email)
        
        if not user:
            return None
        
        if not verify_password(password, user["password"]):
            return None
        
        # Don't return the password
        del user["password"]
        return user
    
    @classmethod
    async def create_conversation(cls, title: str, user_id: Optional[str] = None) -> str:
        """Create a new conversation and return its ID"""
        if cls.use_mongodb:
            db = await cls.get_db()
            conversation_data = {
                "title": title,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            
            # Add user_id if provided
            if user_id:
                conversation_data["user_id"] = user_id
                
            result = await db[CONVERSATIONS_COLLECTION].insert_one(conversation_data)
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
            
            # Add user_id if provided
            if user_id:
                new_conversation["user_id"] = user_id
                
            conversations.append(new_conversation)
            
            with open(CONVERSATIONS_FILE, 'w') as f:
                json.dump(conversations, f, indent=2)
            
            return new_id
    
    @classmethod
    async def get_conversations(cls, limit: int = 20, skip: int = 0, user_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get list of conversations, optionally filtered by user_id"""
        if cls.use_mongodb:
            db = await cls.get_db()
            
            # Create filter for user_id if provided
            filter_query = {}
            if user_id:
                filter_query["user_id"] = user_id
                
            cursor = db[CONVERSATIONS_COLLECTION].find(filter_query).sort(
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
                all_conversations = json.load(f)
            
            # Filter by user_id if provided
            if user_id:
                filtered_conversations = [c for c in all_conversations if c.get("user_id") == user_id]
            else:
                filtered_conversations = all_conversations
                
            # Sort by updated_at in descending order
            filtered_conversations.sort(key=lambda x: x["updated_at"], reverse=True)
            
            # Apply skip and limit
            paginated = filtered_conversations[skip:skip + limit]
            
            return paginated
    
    @classmethod
    async def get_conversation(cls, conversation_id: str, user_id: Optional[str] = None):
        """Get a conversation by ID with optional user filtering"""
        if cls.use_mongodb:
            db = await cls.get_db()
            try:
                # Build query with optional user_id filter
                query = {"_id": ObjectId(conversation_id)}
                if user_id:
                    query["user_id"] = user_id
                    
                conversation = await db[CONVERSATIONS_COLLECTION].find_one(query)
                if conversation:
                    conversation["_id"] = str(conversation["_id"])
                return conversation
            except:
                return None
        else:
            # Local file fallback
            with open(CONVERSATIONS_FILE, 'r') as f:
                conversations = json.load(f)
            
            for conversation in conversations:
                if conversation["_id"] == conversation_id:
                    # If user_id is provided, verify ownership
                    if user_id and conversation.get("user_id") != user_id:
                        return None
                    return conversation
            
            return None
    
    @classmethod
    async def update_conversation_title(cls, conversation_id: str, title: str) -> bool:
        """Update conversation title"""
        if cls.use_mongodb:
            db = await cls.get_db()
            try:
                result = await db[CONVERSATIONS_COLLECTION].update_one(
                    {"_id": ObjectId(conversation_id)},
                    {
                        "$set": {
                            "title": title,
                            "updated_at": datetime.utcnow()
                        }
                    }
                )
                return result.modified_count > 0
            except:
                return False
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
            try:
                # Delete the conversation
                result = await db[CONVERSATIONS_COLLECTION].delete_one({"_id": ObjectId(conversation_id)})
                
                # Delete associated messages
                await db[MESSAGES_COLLECTION].delete_many({"conversation_id": conversation_id})
                
                return result.deleted_count > 0
            except:
                return False
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
