from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.tools import Tool
from langchain.memory import ConversationBufferMemory
from langchain.agents import AgentExecutor, create_openai_functions_agent

from app.config import OPENAI_API_KEY, MODEL_NAME, TEMPERATURE
from app.prompts import RESUME_PROMPT

def generate_resume(query: str) -> str:
    """Generate a professional resume in markdown format based on the provided details."""
    return f"```\n{query}\n```"  # Placeholder for actual resume generation logic

class ResumeAgent:
    def __init__(self):
        self.llm = ChatOpenAI(model=MODEL_NAME, temperature=TEMPERATURE, api_key=OPENAI_API_KEY)
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
