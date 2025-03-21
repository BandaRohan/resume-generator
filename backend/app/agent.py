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
        # Store conversation memories by conversation_id
        self.conversation_memories = {}

    def get_or_create_memory(self, conversation_id: str):
        """Get an existing memory for a conversation or create a new one."""
        if conversation_id not in self.conversation_memories:
            # Create a new memory for this conversation
            self.conversation_memories[conversation_id] = ConversationBufferMemory(
                memory_key="chat_history",
                input_key="input",
                return_messages=True,
            )
        return self.conversation_memories[conversation_id]

    def process_message(self, user_input: str, conversation_id: str = None) -> str:
        """Process the user's message and return the agent's response."""
        # Use a default conversation_id if none provided
        if not conversation_id:
            conversation_id = "default"
            
        # Get or create memory for this conversation
        memory = self.get_or_create_memory(conversation_id)
        
        # Create an agent with this conversation's memory
        agent = create_openai_functions_agent(
            llm=self.llm, tools=self.tools, prompt=self.prompt
        )
        
        agent_executor = AgentExecutor(
            agent=agent, tools=self.tools, verbose=True, memory=memory
        )
        
        # Process the message using this conversation's agent
        response = agent_executor.invoke({"input": user_input})
        return response["output"]
        
    def clear_memory(self, conversation_id: str):
        """Clear the memory for a specific conversation."""
        if conversation_id in self.conversation_memories:
            del self.conversation_memories[conversation_id]
