import { registerContent } from '@/content/index'

registerContent('p10-langchain-agents', () => ({
  difficulty: 'Advanced',
  estimatedTime: '60 minutes',
  prerequisites: ['p10-agent-fundamentals', 'p10-tool-use'],
  tags: ['Phase 10', 'Advanced', 'Topic'],
  objectives: [
    'Understand LangChain Agent architecture: Agent, Tool, ToolKit, AgentExecutor',
    'Implement different agent types: zero-shot-react, conversational, openai-functions',
    'Build custom tools and integrate memory with agents',
    'Create agentic RAG pipelines with retrieval tools',
  ],
  theory: `# LangChain Agents

## LangChain Agent Architecture

LangChain provides a modular framework for building agents with four core components:

### Agent
The Agent class determines what action to take next. It takes the LLM output and parses it into an AgentAction or AgentFinish.

- **zero-shot-react-description** — ReAct agent for single-turn tasks
- **conversational-react-description** — ReAct with conversation memory
- **react-docstore** — ReAct with document store interaction
- **structured-chat-zero-shot** — Structured output format agent
- **openai-functions** — Uses OpenAI function calling natively
- **OPENAI_MULTI_FUNCTIONS** — Multi-function calling agent

### Tool
A wrapper around a function with:
- **name** — Unique identifier
- **description** — Tells the agent when to use it
- **func** — The callable
- **return_direct** — If True, returns output directly (no re-prompt)

### ToolKit
A collection of related tools grouped together. Examples:
- **SQLDatabaseToolkit** — Query databases
- **GmailToolkit** — Read/send emails
- **GitHubToolkit** — Repository operations
- **JsonToolkit** — Work with JSON

### AgentExecutor
The runtime that runs the agent loop:
1. Call agent with input + intermediate steps
2. Get AgentAction or AgentFinish
3. If AgentAction, execute tool and append to steps
4. Repeat until AgentFinish or max iterations

## Agent Types Comparison

| Agent Type | Format | Memory | Best For |
|------------|--------|--------|----------|
| zero-shot-react | Text | No | Single queries |
| conversational-react | Text | Yes | Chat |
| react-docstore | Text | No | Document Q&A |
| structured-chat | JSON | Yes | Complex multi-tool |
| openai-functions | JSON | Config | Function calling API |

## Memory Integration

Agents can use memory classes:
- **ConversationBufferMemory** — Full history
- **ConversationSummaryMemory** — Summarized history
- **VectorStoreRetrieverMemory** — Semantic retrieval

## Agentic RAG

Standard RAG: retrieve documents, then answer.
Agentic RAG: the agent decides when and what to retrieve, can ask follow-up questions, and combine multiple sources.

## Streaming and Callbacks

LangChain supports streaming agent responses and callback handlers for:
- Agent start/finish
- Tool start/finish
- Text generation
- Error handling

## Tracing with LangSmith

LangSmith provides observability for agent runs: token usage, latency, tool call sequences, and error rates.`,
  understanding: {
    analogy: 'Think of LangChain Agents like a smart routing system at a large organization. You (the user) submit a request at the front desk (Agent). The front desk analyzes your request and routes it to the right department (Tool): accounting for billing, IT for technical issues, HR for personnel matters. Each department has specialists who know their domain. The front desk keeps notes on your case (Memory) and can route to multiple departments if needed. LangSmith is like security cameras recording every interaction for later review.',
    steps: [
      { title: 'Define Tools', content: 'Create tools wrapping your functions. Each tool needs a clear name and description so the agent knows when to use it. LangChain provides built-in toolkits for common integrations.' },
      { title: 'Create Agent', content: 'Choose an agent type based on your use case. zero-shot-react for simple tasks, conversational for chat, openai-functions for structured output.' },
      { title: 'Initialize AgentExecutor', content: 'The executor runs the agent loop: call agent, execute tool, repeat. Configure max_iterations, early_stopping_method, and handle_parsing_errors.' },
      { title: 'Add Memory (Optional)', content: 'Attach memory for conversational context. BufferMemory for full history, SummaryMemory for long conversations.' },
      { title: 'Execute and Stream', content: 'Run the agent with your input. Use streaming for real-time output and callbacks for monitoring. Trace runs with LangSmith for debugging.' },
    ],
    misconceptions: [
      { misconception: 'LangChain agents automatically know which tools to use', truth: 'The agent relies entirely on your tool descriptions to choose correctly. Vague or misleading descriptions cause wrong tool selection.' },
      { misconception: 'AgentExecutor handles all errors automatically', truth: 'You must configure handle_parsing_errors and max_retries. Without these, malformed LLM output can crash the agent loop.' },
    ],
    comparisons: [
      { label: 'Architecture', methodA: 'LangChain Agent: Agent + Tool + Executor', methodB: 'CrewAI: Role-based agents + Tasks + Crew' },
      { label: 'Focus', methodA: 'LangChain Agent: Flexible tool orchestration', methodB: 'LangGraph: Graph-based state machines' },
      { label: 'API Style', methodA: 'LangChain Agent: High-level, declarative', methodB: 'AutoGen: Low-level, conversation-driven' },
    ],
  },
  codeExamples: [
    {
      level: 'basic',
      code: `# Basic LangChain agent with tools
# Requires: pip install langchain langchain-openai

from langchain_openai import ChatOpenAI
from langchain.agents import create_react_agent, AgentExecutor
from langchain.tools import Tool
from langchain.prompts import PromptTemplate

# Create LLM
llm = ChatOpenAI(model="gpt-4o", temperature=0)

# Define tools
def search_web(query: str) -> str:
    """Search the web for information."""
    return f"Search results for '{query}': Found relevant information."

def calculate(expression: str) -> str:
    """Evaluate a mathematical expression."""
    return str(eval(expression))

tools = [
    Tool(
        name="search",
        func=search_web,
        description="Useful for finding information on the web. Input should be a search query.",
    ),
    Tool(
        name="calculator",
        func=calculate,
        description="Useful for arithmetic calculations. Input should be a math expression.",
    ),
]

# Create ReAct agent
prompt = PromptTemplate.from_template(
    "You are a helpful agent. Use tools to answer questions.\\n\\n"
    "Question: {input}\\n\\n"
    "Available tools: {tools}\\n\\n"
    "Tool names: {tool_names}\\n\\n"
    "Agent Scratchpad: {agent_scratchpad}"
)

agent = create_react_agent(llm, tools, prompt)
agent_executor = AgentExecutor(
    agent=agent,
    tools=tools,
    verbose=True,
    max_iterations=5,
    handle_parsing_errors=True,
)

# Run
result = agent_executor.invoke({
    "input": "What is 25 * 4? Also search for AI news."
})
print(f"Final: {result['output']}")`,
      output: `> Entering new AgentExecutor chain...
Thought: I need to calculate 25 * 4 and search for AI news.
Action: calculator
Action Input: "25 * 4"
Observation: 100
Thought: Now I'll search for AI news.
Action: search
Action Input: "AI news"
Observation: Search results for 'AI news': Found relevant information.
Thought: I have both results.
Final Answer: 25 * 4 = 100. AI news: Found relevant information.

> Finished chain.
Final: 25 * 4 = 100. AI news: Found relevant information.`,
      explanation: 'This basic LangChain agent uses create_react_agent with two tools (calculator and search). The AgentExecutor runs the ReAct loop automatically, handling tool selection and execution.',
    },
    {
      level: 'intermediate',
      code: `# LangChain agent with memory and streaming
# Requires: pip install langchain langchain-openai

from langchain_openai import ChatOpenAI
from langchain.agents import create_conversational_react_agent, AgentExecutor
from langchain.memory import ConversationBufferMemory
from langchain.tools import Tool
from langchain.prompts import PromptTemplate
from typing import Iterator

class WeatherTool:
    """Custom tool class with metadata."""

    def __init__(self):
        self.cache = {}

    def get_weather(self, location: str) -> str:
        if location in self.cache:
            return f"Cached: {self.cache[location]}"
        result = f"Weather in {location}: 22\\u00b0C, partly cloudy"
        self.cache[location] = result
        return result

weather = WeatherTool()

tools = [
    Tool(
        name="get_weather",
        func=weather.get_weather,
        description="Get weather for a location. Input: city name.",
        return_direct=False,
    ),
    Tool(
        name="get_time",
        func=lambda tz: f"Current time in {tz}: 14:30 UTC",
        description="Get current time for a timezone. Input: IANA timezone.",
    ),
]

# Memory for conversation
memory = ConversationBufferMemory(
    memory_key="chat_history",
    return_messages=True,
)

# Conversational agent
llm = ChatOpenAI(model="gpt-4o", temperature=0, streaming=True)
prompt = PromptTemplate.from_template(
    "You are a helpful assistant with memory.\\n\\n"
    "Chat History:\\n{chat_history}\\n\\n"
    "Question: {input}\\n\\n"
    "Tools: {tools}\\nTool Names: {tool_names}\\nScratchpad: {agent_scratchpad}"
)

agent = create_conversational_react_agent(llm, tools, prompt)
agent_executor = AgentExecutor(
    agent=agent,
    tools=tools,
    memory=memory,
    verbose=True,
    max_iterations=3,
)

# Multi-turn conversation
response1 = agent_executor.invoke({"input": "What is the weather in London?"})
print(f"Response 1: {response1['output']}")

response2 = agent_executor.invoke({"input": "And what about Tokyo?"})
print(f"Response 2: {response2['output']}")

response3 = agent_executor.invoke({"input": "What cities did I ask about?"})
print(f"Response 3: {response3['output']}")`,
      output: `Response 1: The weather in London is 22°C, partly cloudy.

Response 2: The weather in Tokyo is 22°C, partly cloudy.

Response 3: You asked about London and Tokyo. Let me check the weather again...
[Agent uses cache for London -> cached result]
[Agent uses cache for Tokyo -> cached result]
The weather in both cities is 22°C, partly cloudy.`,
      explanation: 'This intermediate agent uses conversational memory to maintain context across turns. It remembers past questions and uses caching to avoid redundant tool calls. Streaming provides real-time output.',
    },
    {
      level: 'advanced',
      code: `# Agentic RAG with custom tools and callbacks
# Requires: pip install langchain langchain-openai langchain-community chromadb

from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain.agents import create_openai_functions_agent, AgentExecutor
from langchain.tools import Tool, StructuredTool
from langchain_community.vectorstores import Chroma
from langchain_community.document_loaders import TextLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.callbacks.base import BaseCallbackHandler
from pydantic import BaseModel, Field
from typing import List, Optional

# --- Callback Handler ---
class AgentCallback(BaseCallbackHandler):
    def on_agent_action(self, action, **kwargs):
        print(f"\\n[Agent Action] {action.tool}: {action.tool_input}")

    def on_tool_end(self, output, **kwargs):
        print(f"[Tool Result] {str(output)[:80]}...")

    def on_agent_finish(self, finish, **kwargs):
        print(f"\\n[Agent Finish] Final answer ready")

# --- Vector Store Setup ---
def setup_vectorstore():
    texts = [
        "LangChain is a framework for building LLM applications.",
        "Agents use tools to interact with the external world.",
        "RAG combines retrieval with generation for accurate answers.",
        "Agentic RAG lets agents decide when to retrieve documents.",
    ]
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=100, chunk_overlap=20)
    docs = text_splitter.create_documents(texts)
    embeddings = OpenAIEmbeddings()
    return Chroma.from_documents(docs, embeddings)

vectorstore = setup_vectorstore()
retriever = vectorstore.as_retriever(search_kwargs={"k": 2})

# --- Custom Tools ---
def retrieve_documents(query: str) -> str:
    """Retrieve relevant documents for a query."""
    docs = retriever.invoke(query)
    return "\\n".join([d.page_content for d in docs])

class SearchInput(BaseModel):
    query: str = Field(description="The search query")

search_tool = StructuredTool.from_function(
    func=retrieve_documents,
    name="retrieve",
    description="Search the knowledge base for information.",
    args_schema=SearchInput,
)

def calculate(expression: str) -> str:
    """Evaluate math expressions."""
    return str(eval(expression))

class CalcInput(BaseModel):
    expression: str = Field(description="Math expression")

calc_tool = StructuredTool.from_function(
    func=calculate,
    name="calculator",
    description="Evaluate mathematical expressions.",
    args_schema=CalcInput,
)

# --- Agent with RAG ---
llm = ChatOpenAI(model="gpt-4o", temperature=0)
tools = [search_tool, calc_tool]

agent = create_openai_functions_agent(llm, tools)
agent_executor = AgentExecutor(
    agent=agent,
    tools=tools,
    verbose=True,
    max_iterations=5,
    callbacks=[AgentCallback()],
    return_intermediate_steps=True,
)

# Run agentic RAG query
result = agent_executor.invoke({
    "input": "What is RAG and how does it relate to agents? Also calculate 2^8."
})

print(f"\\n=== FINAL ANSWER ===\\n{result['output']}")
print(f"\\nIntermediate steps: {len(result.get('intermediate_steps', []))}")`,
      output: `[Agent Action] retrieve: What is RAG and how does it relate to agents?
[Tool Result] RAG combines retrieval with generation for accurate answers.
Agentic RAG lets agents decide when to retrieve documents....

[Agent Action] calculator: 2^8
[Tool Result] 256

[Agent Finish] Final answer ready

=== FINAL ANSWER ===
RAG (Retrieval-Augmented Generation) combines document retrieval with text generation. In agentic RAG, the agent decides when to retrieve documents rather than always retrieving. 2^8 = 256.

Intermediate steps: 2`,
      explanation: 'This advanced agentic RAG implementation uses an OpenAI functions agent with a custom callback handler for monitoring. The agent decides when to search the knowledge base and when to calculate, demonstrating context-aware tool use.',
    },
  ],
  realWorld: {
    useCases: [
      { industry: 'Customer Support', description: 'LangChain agents power support bots that search knowledge bases, check order status, process refunds, and escalate to humans — all within a single agent loop with memory.' },
      { industry: 'Data Analysis', description: 'Analysts use LangChain agents with SQL, Pandas, and visualization tools to explore data, answer questions, and generate reports through natural language.' },
    ],
    caseStudy: {
      problem: 'A SaaS company\'s internal knowledge base was underutilized. Employees spent 30 minutes average searching for information across wikis, docs, and Slack history.',
      solution: 'A LangChain conversational agent with 5 tools: vector search (RAG), Slack history search, Jira lookup, code repository search, and a calculator. Memory maintained context across follow-up questions.',
      results: 'Average search time dropped from 30 to 2 minutes. Agent handled 85% of queries without human escalation. LangSmith tracing identified the most-used tools for further optimization.',
    },
    bestPractices: [
      'Use StructuredTool with Pydantic args_schema for type-safe tool definitions',
      'Set max_iterations to 5-10 and handle_parsing_errors to True for robustness',
      'Use return_intermediate_steps=True for debugging agent decision chains',
      'Attach callbacks for production monitoring of agent behavior',
      'Choose agent type based on your output format needs (text vs JSON)',
    ],
    tools: ['LangChain', 'LangSmith', 'Chroma / Pinecone', 'OpenAI / Anthropic', 'Tavily Search'],
    jobRoles: ['AI Engineer', 'LLM Engineer', 'Backend Engineer', 'DevOps Engineer'],
    furtherReading: [
      'Original paper and foundational research',
      'LangChain agent documentation',
      'LangSmith tracing documentation',
      'Agentic RAG patterns guide',
    ],
  },
  quiz: [
    {
      id: 'la-1', type: 'truefalse',
      question: 'LangChain\'s AgentExecutor runs the agent loop: call agent, execute tool, repeat until final answer or max iterations.',
      correctAnswer: 'True',
      explanation: 'AgentExecutor is the runtime that orchestrates the agent loop. It calls the agent, executes returned tool actions, appends observations, and repeats until AgentFinish or max_iterations.',
    },
    {
      id: 'la-2', type: 'mcq',
      question: 'Which LangChain agent type is best for multi-turn conversations with memory?',
      options: [
        'zero-shot-react-description',
        'conversational-react-description',
        'react-docstore',
        'openai-functions',
      ],
      correctAnswer: 'conversational-react-description',
      explanation: 'conversational-react-description is designed for chat scenarios with memory. It includes chat history in the prompt so the agent maintains context across turns.',
    },
    {
      id: 'la-3', type: 'fillblank',
      question: 'LangChain\'s observability platform for tracing agent runs is called ___.',
      correctAnswer: 'LangSmith',
      explanation: 'LangSmith provides tracing, monitoring, and evaluation for LLM applications, showing token usage, latency, tool call sequences, and error rates for agent runs.',
    },
    {
      id: 'la-4', type: 'code',
      question: 'What does the return_direct=True flag on a LangChain Tool do?',
      code: `Tool(
    name="get_answer",
    func=get_answer,
    description="Returns direct answer",
    return_direct=True,
)`,
      options: [
        'Makes the tool run faster',
        'Returns the tool output directly as the final answer without re-prompting the LLM',
        'Prevents the tool from being called',
        'Sends the output to a different agent',
      ],
      correctAnswer: 'Returns the tool output directly as the final answer without re-prompting the LLM',
      explanation: 'When return_direct=True, the tool output is returned as the final answer without sending it back to the LLM for additional processing. Useful for tools that already produce the complete answer.',
    },
    {
      id: 'la-5', type: 'match',
      question: 'Match each LangChain component with its role:',
      pairs: [
        { left: 'Agent', right: 'Decides which action to take next' },
        { left: 'Tool', right: 'Wraps a function the agent can call' },
        { left: 'ToolKit', right: 'Collection of related tools' },
        { left: 'AgentExecutor', right: 'Runtime loop orchestrating execution' },
      ],
      correctAnswer: 'All matched correctly',
      explanation: 'These four components form the core LangChain agent architecture: Agent decides, Tool enables, ToolKit groups, AgentExecutor orchestrates.',
    },
  ],
}))

export {}
