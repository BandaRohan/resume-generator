import asyncio
from app.database import Database

async def check_mongo():
    await Database.connect_to_mongo()
    print("MongoDB connection status:", Database.use_mongodb)
    
    if Database.use_mongodb:
        print("✅ Application is using MongoDB!")
        db = await Database.get_db()
        collections = await db.list_collection_names()
        print(f"Collections in database: {collections}")
    else:
        print("❌ Application is using local JSON files.")

if __name__ == "__main__":
    asyncio.run(check_mongo())
