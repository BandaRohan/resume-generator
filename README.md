# Resume Generator Chat Application

A full-stack web chat application with a React frontend and FastAPI backend that generates professional resumes based on user inputs.

## Project Structure

```
chat-application/
├── backend/
│   ├── app/
│   ├── main.py       # FastAPI backend with LangChain integration
│   ├── .env          # Environment variables for API keys
│   └── requirements.txt
└── frontend/
    ├── public/
    │   ├── index.html
    │   └── manifest.json
    ├── src/
    │   ├── components/
    │   │   └── ChatApp.js  # The chat UI component with markdown support
    │   ├── App.js
    │   ├── index.css    # With Tailwind imports
    │   └── index.js
    ├── package.json     # With React, Axios, ReactMarkdown, and Tailwind
    ├── postcss.config.js
    └── tailwind.config.js
```

## Backend Setup

1. Navigate to the backend directory:
   ```
   cd chat-application/backend
   ```

2. Create a virtual environment:
   ```
   python -m venv venv
   ```

3. Activate the virtual environment:
   - On Windows:
     ```
     venv\Scripts\activate
     ```
   - On macOS/Linux:
     ```
     source venv/bin/activate
     ```

4. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

5. Set up your OpenAI API key:
   - Edit the `.env` file and add your OpenAI API key:
     ```
     OPENAI_API_KEY=your_openai_api_key_here
     ```

6. Run the FastAPI server:
   ```
   python main.py
   ```

   The API will be available at http://127.0.0.1:8000

## Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd chat-application/frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

   The application will be available at http://localhost:3000

## Features

- Interactive chat interface for resume generation
- LangChain integration with OpenAI models
- Markdown rendering of resume output
- Clean, responsive UI using Tailwind CSS
- Loading indicators for API requests
- Error handling for failed requests

## API Endpoints

- `POST /chat/`
  - Request body: `{ "message": "Your information for the resume" }`
  - Response: `{ "response": "Formatted resume in markdown" }`

## How to Use

1. Start both the backend and frontend servers
2. Enter your personal information when prompted by the chat system
3. The AI will guide you through the resume creation process
4. The generated resume will be displayed in the chat with proper formatting
