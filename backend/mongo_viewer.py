import asyncio
import json
from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
import uvicorn
from app.database import Database
from app.config import MONGO_DB_NAME
import os

app = FastAPI()

# Create templates directory if it doesn't exist
os.makedirs("templates", exist_ok=True)

# Create templates
with open("templates/index.html", "w") as f:
    f.write("""
<!DOCTYPE html>
<html>
<head>
    <title>MongoDB Viewer</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        h1 {
            color: #333;
            border-bottom: 2px solid #ddd;
            padding-bottom: 10px;
        }
        .container {
            display: flex;
            gap: 20px;
        }
        .collections {
            width: 200px;
            background: white;
            padding: 15px;
            border-radius: 5px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        .data {
            flex-grow: 1;
            background: white;
            padding: 15px;
            border-radius: 5px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        .collection-item {
            padding: 8px;
            cursor: pointer;
            border-bottom: 1px solid #eee;
        }
        .collection-item:hover {
            background-color: #f0f0f0;
        }
        .active {
            background-color: #e0e0e0;
            font-weight: bold;
        }
        pre {
            background-color: #f8f8f8;
            padding: 10px;
            border-radius: 5px;
            overflow: auto;
            max-height: 500px;
        }
        .status {
            padding: 10px;
            margin-bottom: 20px;
            border-radius: 5px;
        }
        .connected {
            background-color: #d4edda;
            color: #155724;
        }
        .disconnected {
            background-color: #f8d7da;
            color: #721c24;
        }
    </style>
</head>
<body>
    <h1>MongoDB Viewer</h1>
    
    <div class="status {{ 'connected' if mongodb_status else 'disconnected' }}">
        <strong>Status:</strong> {{ "Connected to MongoDB" if mongodb_status else "Using local JSON files" }}
        <p>Database: {{ db_name }}</p>
    </div>
    
    <div class="container">
        <div class="collections">
            <h3>Collections</h3>
            {% for collection in collections %}
                <div class="collection-item" onclick="loadCollection('{{ collection }}')">
                    {{ collection }}
                </div>
            {% endfor %}
        </div>
        
        <div class="data">
            <h3>Data</h3>
            <div id="collection-data">
                <p>Select a collection to view data</p>
            </div>
        </div>
    </div>
    
    <script>
        function loadCollection(collection) {
            fetch(`/api/collection/${collection}`)
                .then(response => response.json())
                .then(data => {
                    document.getElementById('collection-data').innerHTML = 
                        `<h4>${collection}</h4>
                         <pre>${JSON.stringify(data, null, 2)}</pre>`;
                    
                    // Highlight active collection
                    document.querySelectorAll('.collection-item').forEach(item => {
                        item.classList.remove('active');
                        if(item.textContent.trim() === collection) {
                            item.classList.add('active');
                        }
                    });
                });
        }
    </script>
</body>
</html>
    """)

templates = Jinja2Templates(directory="templates")

@app.get("/", response_class=HTMLResponse)
async def read_root(request: Request):
    await Database.connect_to_mongo()
    mongodb_status = Database.use_mongodb
    
    collections = []
    if mongodb_status:
        db = await Database.get_db()
        collections = await db.list_collection_names()
    
    return templates.TemplateResponse("index.html", {
        "request": request, 
        "mongodb_status": mongodb_status,
        "collections": collections,
        "db_name": MONGO_DB_NAME
    })

@app.get("/api/collection/{collection_name}")
async def get_collection(collection_name: str):
    if not Database.use_mongodb:
        return {"error": "MongoDB not connected"}
    
    db = await Database.get_db()
    collection = db[collection_name]
    
    # Get all documents in the collection
    cursor = collection.find({})
    documents = await cursor.to_list(length=100)  # Limit to 100 documents
    
    # Convert ObjectId to string for JSON serialization
    for doc in documents:
        doc["_id"] = str(doc["_id"])
    
    return documents

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8082)
