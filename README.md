# Resume Generator Chat Application

A full-stack web chat application with a React frontend and FastAPI backend that generates professional, ATS-friendly resumes based on user inputs.

## Project Structure

```
chat-application/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── agent.py     # Resume generation agent implementation
│   │   ├── config.py    # Configuration settings and environment variables
│   │   └── prompts.py   # Prompt templates for the application
│   ├── main.py          # FastAPI backend with endpoints
│   ├── .env             # Environment variables for API keys
│   ├── .env.example     # Example environment variables template
│   └── requirements.txt
└── frontend/
    ├── public/
    │   ├── index.html
    │   └── manifest.json
    ├── src/
    │   ├── components/
    │   │   ├── chat/
    │   │   │   ├── MessageBubble.js
    │   │   │   ├── Canvas.js
    │   │   │   ├── ConfirmDialog.js
    │   │   │   ├── Header.js
    │   │   │   └── InputForm.js
    │   │   └── ChatApp.js  # The main chat UI component
    │   ├── utils/
    │   │   └── markdownUtils.js # Markdown processing utilities
    │   ├── styles/
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

5. Set up your environment variables:
   - Copy the example environment file:
     ```
     cp .env.example .env
     ```
   - Edit the `.env` file and add your OpenAI API key:
     ```
     OPENAI_API_KEY=your_openai_api_key_here
     ```

6. Run the FastAPI server:
   ```
   python main.py
   ```

   The API will be available at http://127.0.0.1:8000

## Backend Architecture

The backend follows a modular structure for better organization:

- **app/config.py**: Central configuration file that loads environment variables and provides them to the application
- **app/prompts.py**: Contains all prompt templates used by the application
- **app/agent.py**: Implements the ResumeAgent class that handles the resume generation logic
- **main.py**: Sets up the FastAPI application and defines API endpoints

This modular structure makes the codebase more maintainable and easier to extend with new features.

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
- LangChain integration with OpenAI models (GPT-4o-mini)
- Markdown rendering of resume output
- Canvas view for displaying the formatted resume
- PDF export functionality with html2pdf.js
- Copy to clipboard functionality
- Clean, responsive UI using Tailwind CSS
- Loading indicators for API requests
- Error handling for failed requests
- Confirmation dialogs for important actions (like resetting chat)

## API Endpoints

- `POST /chat/`
  - Request body: `{ "message": "Your information for the resume" }`
  - Response: `{ "response": "Formatted resume in markdown" }`

## How to Use

1. Start both the backend and frontend servers
2. Enter your personal information when prompted by the chat system
3. The AI will guide you through the resume creation process, asking for:
   - Full Name
   - Contact Information
   - Professional Title
   - Professional Summary
   - Work Experience
   - Educational Background
   - Skills
   - Certifications & Licenses
   - Projects & Achievements
   - Additional Sections
4. The generated resume will be displayed in the chat with proper formatting
5. You can view the resume in the canvas panel, copy it to clipboard, or download it as a PDF

## Technologies Used

### Frontend
- React.js
- Tailwind CSS
- Axios for API requests
- React Markdown for rendering markdown
- html2pdf.js for PDF generation
- Framer Motion for animations

### Backend
- FastAPI
- LangChain for AI integration
- OpenAI API (GPT-4o-mini model)
- Pydantic for data validation
- Uvicorn ASGI server
