from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, EmailStr
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.tools import Tool
from langchain.memory import ConversationBufferMemory
from langchain.agents import AgentExecutor, create_openai_functions_agent
import os
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()
app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Model to handle chat input
class ChatInput(BaseModel):
    message: str

# Define the resume prompt
RESUME_PROMPT = """
Hello! I'm here to help you craft a professional, ATS-friendly resume. Please provide the following details one by one:  

1. **Full Name**  
2. **Contact Information** (Email, Phone Number, LinkedIn profile, Location)  
3. **Professional Title** (e.g., Software Engineer, Project Manager)
4. **Professional Summary** (brief overview of your experience and strengths)
5. **Work Experience** (For each position, include: Company name, Job title, Dates of employment, Location, Key responsibilities and achievements with measurable results)
6. **Educational Background** (Degree, Institution, Graduation year, GPA if notable)
7. **Skills** (Technical skills, Soft skills, Languages - focus on keywords relevant to your target job)
8. **Certifications & Licenses** (Name, Issuing organization, Date, optional)
9. **Projects & Achievements** (optional)
10. **Additional Sections** (optional: Volunteer work, Publications, Awards, etc.)

Once you've provided all the details, confirm if you'd like to proceed.  

### ATS-Friendly Resume Generation Instructions:  
- You are a highly skilled ATS-friendly resume generator.
- Create a **well-structured, professional resume** in **Markdown format** with a **clean, ATS-optimized layout**.
- Follow these ATS optimization best practices:
  - Use a clean, simple format with standard section headings
  - Include relevant keywords from the job description (if provided)
  - Use standard fonts and avoid graphics, tables, or columns
  - Spell out acronyms at least once
  - Use reverse chronological order for work experience
  - Quantify achievements with numbers and percentages when possible
  - Use active language and action verbs
  - Ensure proper spelling and grammar
- Exclude any sections that are not provided.
- Ensure the **Markdown content is enclosed within triple backticks (` ``` `) only.**
- If the user provides a job description, tailor the resume to highlight relevant skills and experience.

Now, generate the resume based on the details provided by the user.  
"""

# Define a simple function to generate resume
def generate_resume(query: str) -> str:
    """Generate a professional resume in markdown format based on the provided details."""
    return f"```\n{query}\n```"  # Placeholder for actual resume generation logic

class ResumeAgent:
    def __init__(self):
        self.llm = ChatOpenAI(model='gpt-4o-mini', temperature=0, api_key=os.environ["OPENAI_API_KEY"])
        self.memory = ConversationBufferMemory(
            memory_key="chat_history",
            input_key="input",
            return_messages=True,
        )
        self.tools = [
            Tool(
                name="generate_resume",
                func=generate_resume,
                description="Generate a professional resume in markdown format based on the provided details"
            )
        ]
        self.prompt = ChatPromptTemplate(
            [
                ("system", RESUME_PROMPT),
                MessagesPlaceholder("chat_history"),
                ("human", "{input}"),
                MessagesPlaceholder(variable_name="agent_scratchpad"),
            ]
        )
        self.agent = create_openai_functions_agent(
            llm=self.llm, tools=self.tools, prompt=self.prompt
        )
        self.agent_executor = AgentExecutor(
            agent=self.agent, tools=self.tools, verbose=True, memory=self.memory
        )
        self.chat_history = []

    def process_message(self, user_input: str) -> str:
        """Process the user's message and return the agent's response."""
        response = self.agent_executor.invoke({"input": user_input})
        return response["output"]

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
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
