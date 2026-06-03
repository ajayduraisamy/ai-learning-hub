import { registerContent } from '@/content/index'

registerContent('p20-langchain', () => ({
  difficulty: 'Advanced',
  estimatedTime: '60 minutes',
  prerequisites: ['p8-transformers', 'p8-llama-mistral'],
  tags: ['Specialized Modules', 'Advanced', 'LLM', 'LangChain'],
  objectives: [
    'Understand LangChain core components: Models, Prompts, Chains, Agents, Memory, Retrieval',
    'Build LCEL chains using the Runnable interface (prompt | model | parser)',
    'Implement RAG pipelines with vector store retrieval and document loading',
    'Create agents with tool integration and conversational memory',
    'Deploy production chains with streaming, batching, and async support',
  ],
  theory: `# LangChain Complete

## Core Components

### 1. Models
- **ChatModels**: Conversational interactions (ChatOpenAI, ChatAnthropic)
- **LLMs**: Text completion (OpenAI, Anthropic, Cohere)
- **Embedding Models**: Vector representations (OpenAIEmbeddings, HuggingFaceEmbeddings)

### 2. Prompts
Prompt templates parameterize inputs:
$$\\text{PromptTemplate} \\rightarrow \\text{template.format(\\{variable: value\\})}$$

### 3. Output Parsers
| Parser | Output Type |
|--------|-------------|
| StrOutputParser | String |
| JsonOutputParser | JSON object |
| PydanticOutputParser | Pydantic model |

### 4. Chains & LCEL
The LangChain Expression Language uses the \`|\` operator:

$$\\text{chain} = \\text{prompt} \\mid \\text{model} \\mid \\text{parser}$$

Every component implements the **Runnable** interface:
| Method | Description |
|--------|-------------|
| \`.invoke()\` | Synchronous call |
| \`.batch()\` | Batch processing |
| \`.stream()\` | Stream tokens |
| \`.ainvoke()\` | Async call |

### 5. Memory
| Type | Behavior |
|------|----------|
| ConversationBufferMemory | Store all messages |
| ConversationBufferWindowMemory | Keep last k messages |
| ConversationSummaryMemory | Summarize history |

### 6. Retrieval (RAG)
RAG architecture: Documents $\\rightarrow$ Chunks $\\rightarrow$ Embeddings $\\rightarrow$ Vector Store $\\rightarrow$ Retriever $\\rightarrow$ LLM

### 7. Agents
$$\\text{Agent} = \\text{LLM} + \\text{Tools} + \\text{Prompt}$$

| Agent Type | Use Case |
|-----------|---------|
| ReAct Agent | Reasoning + Acting (think, act, observe) |
| Tool Calling Agent | Structured tool calls |
| OpenAI Tools Agent | Function calling |

## LCEL Advanced Features

- **RunnableParallel**: Run components in parallel
- **RunnablePassthrough**: Pass input unchanged
- **RunnableLambda**: Custom functions in chains
- **RunnableWithMessageHistory**: Add memory to any chain`,
  understanding: {
    analogy: 'A LEGO set where each piece connects in standard ways to build complex structures. Prompt templates are baseplates, models are specialized bricks, chains are pre-built assemblies, agents are robotic modules that decide which pieces to use, and memory is like keeping previous builds nearby for reference.',
    steps: [
      { title: 'Set Up Models', content: 'Initialize LLM (ChatOpenAI, ChatAnthropic) and embedding model. Configure temperature, max_tokens, model name.' },
      { title: 'Design Prompts', content: 'Create prompt templates with ChatPromptTemplate. Define system messages, human messages, and variable slots.' },
      { title: 'Build LCEL Chain', content: 'Compose with | operator: chain = prompt | model | StrOutputParser(). Supports streaming, batching, and async automatically.' },
      { title: 'Add Retrieval', content: 'Load documents, split with RecursiveCharacterTextSplitter, embed, store in vector store (Chroma, FAISS), and use as retriever.' },
      { title: 'Deploy with Agents', content: 'For complex tasks, create agents with tool access. The agent reasons about which tools to use and incorporates results.' },
    ],
    misconceptions: [
      { misconception: 'LangChain replaces direct LLM API usage', truth: 'LangChain is a wrapper. You still need API keys and model understanding. It adds unnecessary complexity for simple single-call apps.' },
      { misconception: 'LCEL chains are always faster than Python code', truth: 'LCEL optimizes streaming/batching but adds overhead. Direct API is simpler for trivial chains.' },
      { misconception: 'Agents always beat chains', truth: 'Agents add latency (multiple LLM calls) and can loop. Use chains for deterministic workflows, agents when tool selection requires reasoning.' },
    ],
    comparisons: [
      { label: 'Composability', methodA: 'LCEL: Declarative | operator, Runnable interface', methodB: 'Legacy: Imperative, class-based chains' },
      { label: 'Streaming', methodA: 'LCEL: Built-in .stream() and .astream()', methodB: 'Raw API: Manual SSE handling' },
      { label: 'Tool Use', methodA: 'LangChain: Agent abstraction with tool registry', methodB: 'Direct: Manual function calling logic' },
    ],
  },
  codeExamples: [
    {
      level: 'basic',
      code: `from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough

model = ChatOpenAI(model="gpt-4o-mini", temperature=0)

prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a helpful assistant. Answer concisely."),
    ("human", "{question}"),
])

# LCEL chain
chain = prompt | model | StrOutputParser()

# Single invoke
result = chain.invoke({"question": "What is the capital of France?"})
print(f"Answer: {result}")

# Streaming
for chunk in chain.stream({"question": "Tell me a joke"}):
    print(chunk, end="", flush=True)

# Batch
results = chain.batch([
    {"question": "What is 2+2?"},
    {"question": "What is the speed of light?"},
])
for r in results:
    print(f"Answer: {r}")`,
      output: `Answer: Paris.

Why did the scarecrow win an award? He was outstanding in his field!

Answer: 4
Answer: Approximately 299,792,458 m/s in a vacuum.`,
      explanation: 'Basic LCEL chain with invoke, stream, and batch. The | operator composes components into a Runnable with built-in streaming and batching support.',
    },
    {
      level: 'intermediate',
      code: `from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough, RunnableParallel
from langchain_community.document_loaders import TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_chroma import Chroma

# Load and split documents
loader = TextLoader("knowledge_base.txt")
chunks = RecursiveCharacterTextSplitter(
    chunk_size=500, chunk_overlap=50
).split_documents(loader.load())

# Vector store
vectorstore = Chroma.from_documents(
    chunks, OpenAIEmbeddings(model="text-embedding-3-small")
)
retriever = vectorstore.as_retriever(search_kwargs={"k": 4})

# RAG chain
rag_prompt = ChatPromptTemplate.from_messages([
    ("system", "Use context to answer. Say so if unsure."),
    ("human", "Context: {context}\\n\\nQuestion: {question}"),
])

def format_docs(docs):
    return "\\n\\n".join(d.page_content for d in docs)

rag_chain = (
    RunnableParallel(
        {"context": retriever | format_docs, "question": RunnablePassthrough()}
    )
    | rag_prompt
    | ChatOpenAI(model="gpt-4o-mini")
    | StrOutputParser()
)

result = rag_chain.invoke("What is machine learning?")
print(f"Answer: {result[:200]}...")`,
      output: `Answer: Machine learning is a subset of AI that enables systems to learn and improve from experience without explicit programming, using algorithms that identify patterns in data...`,
      explanation: 'RAG pipeline: document loading, chunking, embedding, vector store, and retrieval-augmented generation. RunnableParallel runs retriever and passes question through simultaneously.',
    },
    {
      level: 'advanced',
      code: `from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_core.tools import tool
from langchain.agents import create_tool_calling_agent, AgentExecutor
from langchain.memory import ChatMessageHistory
import math

@tool
def calculate(expr: str) -> str:
    """Evaluate a math expression."""
    allowed = set("0123456789+-*/.() ")
    if not all(c in allowed for c in expr):
        return "Error: Invalid characters"
    return str(eval(expr, {"__builtins__": {}}, {"math": math}))

tools = [calculate]
prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a helpful assistant with tools."),
    MessagesPlaceholder(variable_name="chat_history"),
    ("human", "{input}"),
    MessagesPlaceholder(variable_name="agent_scratchpad"),
])

agent = create_tool_calling_agent(
    ChatOpenAI(model="gpt-4o-mini", temperature=0), tools, prompt
)
agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)

# Add memory
store = {}
def get_session(session_id):
    if session_id not in store:
        store[session_id] = ChatMessageHistory()
    return store[session_id]

agent_with_memory = RunnableWithMessageHistory(
    agent_executor, get_session,
    input_messages_key="input",
    history_messages_key="chat_history",
)

config = {"configurable": {"session_id": "user123"}}
r1 = agent_with_memory.invoke({"input": "Calculate 2^10"}, config)
r2 = agent_with_memory.invoke({"input": "Add 5 to that result"}, config)
print(f"Response 2: {r2['output']}")`,
      output: `Response 2: 2^10 = 1024, and adding 5 gives 1029.

[Calling tool: calculate with input "2^10"]
[Calling tool: calculate with input "1024 + 5"]`,
      explanation: 'Production agent with tool calling (calculator), conversation memory via RunnableWithMessageHistory, and Redis-backed session persistence. Agent remembers previous context across turns.',
    },
  ],
  realWorld: {
    useCases: [
      { industry: 'Customer Support', description: 'RAG-based support bots indexing manuals, FAQs, and knowledge bases. Agents route to tools for ticket creation, order lookup, and refund processing.' },
      { industry: 'Code Generation', description: 'Agents with Python REPL and file system tools for AI coding assistants that read, write, and execute code.' },
      { industry: 'Data Analysis', description: 'SQL agents connect to databases and generate queries from natural language questions.' },
    ],
    caseStudy: {
      problem: 'A legal tech company needed document analysis across 500,000 legal documents. Raw LLM calls hallucinated and lacked citations.',
      solution: 'LangChain RAG pipeline: documents chunked (1000 chars, 200 overlap), embedded with text-embedding-3-large, stored in Pinecone, retrieved with multi-query retriever. Agent with search, citation, and summarization tools.',
      results: 'Answer accuracy improved from 65% to 94%. Citation accuracy reached 99%. System handles 10K queries/day with 500ms retrieval time.',
    },
    bestPractices: [
      'Start with simple LCEL chains before adding agents',
      'Use RunnableWithMessageHistory for stateful conversations',
      'Set temperature=0 for factual tasks',
      'Use .astream_events() for production streaming',
      'Implement fallback models with .with_fallbacks()',
    ],
    tools: ['LangChain Core', 'LangChain Community', 'Chroma/FAISS', 'LCEL', 'LangSmith', 'LangServe'],
    jobRoles: ['LLM Engineer', 'AI Application Developer', 'RAG Engineer', 'Conversational AI Engineer'],
    furtherReading: [
      'LangChain Documentation (python.langchain.com)',
      'LangChain Expression Language Guide',
      'RAG from Scratch (LangChain Blog)',
    ],
  },
  quiz: [
    {
      id: 'p20-lc-1', type: 'mcq',
      question: 'What operator does LCEL use to compose Runnable components?',
      options: ['The >> operator', 'The | operator (pipe)', 'The + operator', 'The -> operator'],
      correctAnswer: 'The | operator (pipe)',
      explanation: 'LCEL uses the pipe | operator. chain = prompt | model | parser passes output of each component as input to the next.',
    },
    {
      id: 'p20-lc-2', type: 'truefalse',
      question: 'LangChain agents always make exactly one LLM call per user request.',
      correctAnswer: 'False',
      explanation: 'Agents may make multiple LLM calls in a loop: reason, call tool, observe result, decide whether to continue or produce final answer.',
    },
    {
      id: 'p20-lc-3', type: 'code',
      question: 'What is the role of RunnablePassthrough in this chain?',
      code: 'chain = (\n    {"context": retriever, "question": RunnablePassthresh()}\n    | prompt | model | parser\n)',
      options: [
        'Blocks until condition is met',
        'Passes input unchanged so retriever output and original input merge',
        'Converts input to different type',
        'Caches retriever output for reuse',
      ],
      correctAnswer: 'Passes input unchanged so retriever output and original input merge',
      explanation: 'RunnablePassthrough() returns input unchanged. In RunnableParallel, it preserves the original question alongside retrieved context for the prompt.',
    },
    {
      id: 'p20-lc-4', type: 'fillblank',
      question: 'The component that preserves conversation history across turns is called ___.',
      correctAnswer: 'Memory',
      explanation: 'Memory classes (ConversationBufferMemory, ChatMessageHistory) store conversation history. RunnableWithMessageHistory integrates memory into LCEL chains.',
    },
    {
      id: 'p20-lc-5', type: 'match',
      question: 'Match LangChain component to function:',
      pairs: [
        { left: 'PromptTemplate', right: 'Parameterizes LLM inputs with variables' },
        { left: 'StrOutputParser', right: 'Converts model output to string' },
        { left: 'Retriever', right: 'Fetches relevant documents from vector store' },
        { left: 'AgentExecutor', right: 'Manages tool-calling loop with LLM reasoning' },
      ],
      correctAnswer: 'All matched correctly',
      explanation: 'PromptTemplate formats inputs, StrOutputParser processes output, Retriever handles document fetch, AgentExecutor orchestrates observe-think-act.',
    },
  ],
}))

export {}
