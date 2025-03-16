import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# API Keys
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")

# Model settings
MODEL_NAME = os.environ.get("MODEL_NAME", "gpt-4o-mini")
TEMPERATURE = float(os.environ.get("TEMPERATURE", "0"))

# Server settings
HOST = os.environ.get("HOST", "127.0.0.1")
PORT = int(os.environ.get("PORT", "8000"))

# CORS settings
ALLOW_ORIGINS = os.environ.get("ALLOW_ORIGINS", "*").split(",")

# MongoDB settings
MONGO_URI = os.environ.get("MONGO_URI", "mongodb://localhost:27017")
MONGO_DB_NAME = os.environ.get("MONGO_DB_NAME", "resume_chat_app")