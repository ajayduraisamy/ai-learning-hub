import { registerContent } from '@/content/index'

registerContent('p21-ai-research-agent', () => ({
  difficulty: 'Advanced',
  estimatedTime: '120 minutes',
  prerequisites: ['p10-react', 'p10-tool-use', 'p10-langchain-agents'],
  tags: ['End-to-End Projects', 'Advanced', 'Project'],
  objectives: [
    'Understand multi-tool agent architecture and the ReAct loop',
    'Implement a research agent with web search, arxiv, and Wikipedia tools',
    'Add conversation memory for multi-turn research sessions',
    'Build a Streamlit UI with streaming output',
    'Implement citation management and source tracking',
  ],
  theory: `# AI Research Agent

## Agent Architecture

An AI research agent is a system that can plan, execute, and synthesize research across multiple tools to answer complex questions. Unlike a simple RAG system, the agent can decide which tools to use and in what order.

### Components

1. **Agent Core**: LLM that reasons about which actions to take (OpenAI, Claude, Llama)
2. **Tool Registry**: Collection of functions the agent can call
3. **Memory**: Conversation history and intermediate reasoning steps
4. **Orchestrator**: Manages the ReAct loop — Think, Act, Observe

### Available Tools

| Tool | Purpose | Input | Output |
|------|---------|-------|--------|
| Web Search | Current events, general knowledge | Query string | URL + snippet |
| ArXiv | Academic papers | Search query | Paper metadata + abstract |
| Wikipedia | Encyclopedia knowledge | Article title | Summary text |
| Calculator | Numeric computations | Math expression | Computed result |

## ReAct Loop in Detail

The ReAct (Reasoning + Acting) loop alternates between thinking and acting:

\\\`\\\`\\\`
Thought: I need to find the latest research on transformers.
Action: search_arxiv
Action Input: "transformer architecture 2024"
Observation: Found 15 papers. Most cited: "Efficient Transformers: A Survey"
Thought: Let me get more details on this paper.
Action: read_arxiv_paper
Action Input: "2401.12345"
Observation: Paper proposes a linear attention mechanism...
Thought: I can now synthesize the answer.
Final Answer: The latest transformer research focuses on...
\\\`\\\`\\\`

## Memory Management

### Short-term Memory
- Stores the current conversation turns
- Includes tool call results (observations)
- Reset between sessions

### Long-term Memory
- Stores user preferences and recurring research topics
- Can be persisted to a database
- Enables personalized research assistance

### Conversation Buffer Window
- Keeps last N exchanges for context
- Prevents context window overflow
- Summarizes oldest exchanges when buffer is full

## Streaming Output

Streaming shows the agent's reasoning in real-time, building user trust:
1. **Thought stream**: "I'm thinking about what tools to use..."
2. **Action stream**: "Searching arxiv for relevant papers..."
3. **Observation stream**: "Found 5 papers, reading the most relevant..."
4. **Final answer stream**: Token-by-token generation of the synthesis

## Citation Management

The agent automatically tracks sources:
- Every tool call result includes the source URL/identifier
- Citations are accumulated in a dedicated data structure
- The final answer includes a references section
- Citations follow a consistent format (Author, Year, Title, URL)`,

  understanding: {
    analogy: 'An AI research agent is like a graduate research assistant. You give them a question, and they don\'t just answer from memory. They go to the library (web search), check academic journals (arxiv), read encyclopedias (Wikipedia), and do calculations (calculator). As they work, they report back their findings, and you can steer them in new directions. The ReAct loop is their internal monologue: "I need X, where can I find it? I\'ll search here. Oh, I found Y, that\'s useful. Now let me synthesize an answer."',
    steps: [
      { title: 'Define Tools', content: 'Implement each tool as a function with a clear name, description, input schema, and return type. The LLM uses the description to decide which tool to call.' },
      { title: 'Set Up Agent Core', content: 'Configure the LLM with a system prompt explaining available tools and the ReAct format. Temperature of 0 for deterministic tool selection, higher for creative synthesis.' },
      { title: 'Implement ReAct Loop', content: 'The orchestrator loops: get LLM response (thought + action), parse action, execute tool, feed observation back to LLM. Stop when the LLM outputs a final answer.' },
      { title: 'Add Memory', content: 'Wrap the agent with conversation memory. Store chat history, tool results, and intermediate reasoning steps. Use buffer window to manage context length.' },
      { title: 'Build UI', content: 'Create a Streamlit interface with a chat component, streaming output, source panel, and the ability to view the agent\'s full reasoning trace.' },
      { title: 'Handle Errors', content: 'Tool failures (timeout, API error) are caught and fed back as observations. The agent can retry, ask for clarification, or fall back to other tools.' },
    ],
    misconceptions: [
      { misconception: 'Agents always choose the optimal sequence of tools', truth: 'Agents use heuristics learned from training data. They may choose suboptimal tool orders or miss relevant tools. The ReAct pattern allows recovery but does not guarantee optimality.' },
      { misconception: 'More tools always make an agent more capable', truth: 'Each additional tool increases the action space and can confuse the agent. Tools should be high-quality, well-described, and carefully scoped. Too many low-quality tools degrade performance.' },
      { misconception: 'Agents can handle any ambiguity without clarification', truth: 'Agents often guess ambiguous intent rather than asking clarifying questions. Explicit instructions to ask for clarification when uncertain improve reliability significantly.' },
    ],
    comparisons: [
      { label: 'Control Flow', methodA: 'ReAct Agent — Dynamic, self-directed', methodB: 'RAG Pipeline — Fixed, deterministic' },
      { label: 'Tool Usage', methodA: 'Agent — Decides which tool to use and when', methodB: 'RAG — Fixed retriever, no tool selection' },
      { label: 'Transparency', methodA: 'Agent — Full reasoning trace visible', methodB: 'RAG — Retrieval is opaque to user' },
      { label: 'Error Recovery', methodA: 'Agent — Can retry or fall back', methodB: 'RAG — Fails if retrieval fails' },
    ],
  },
  codeExamples: [
    {
      level: 'basic',
      code: `# Setup: Define research tools
import requests
import json
from typing import Optional, List, Dict

def search_web(query: str, num_results: int = 3) -> List[Dict]:
    """Search the web for current information."""
    url = "https://api.duckduckgo.com"
    params = {"q": query, "format": "json", "no_html": 1}
    response = requests.get(url, params=params, timeout=10)
    data = response.json()
    results = []
    if "AbstractText" in data and data["AbstractText"]:
        results.append({
            "title": data.get("Heading", ""),
            "snippet": data["AbstractText"],
            "source": data.get("AbstractURL", ""),
        })
    return results

def search_arxiv(query: str, max_results: int = 3) -> List[Dict]:
    """Search academic papers on arxiv."""
    url = "http://export.arxiv.org/api/query"
    params = {"search_query": f"all:{query}", "max_results": max_results}
    response = requests.get(url, params=params, timeout=15)
    import feedparser
    feed = feedparser.parse(response.text)
    papers = []
    for entry in feed.entries[:max_results]:
        papers.append({
            "title": entry.title,
            "authors": [a.name for a in entry.authors],
            "summary": entry.summary[:300],
            "link": entry.link,
            "published": entry.published,
        })
    return papers

# Test the tools
print("=== Web Search ===")
results = search_web("latest AI research 2024")
for r in results:
    print(f"  - {r['title']}: {r['snippet'][:80]}...")

print("\\n=== ArXiv Search ===")
papers = search_arxiv("transformer attention mechanism")
for p in papers:
    print(f"  - {p['title']} ({p['published']})")`,
      output: `=== Web Search ===
  - Artificial Intelligence News: Latest breakthroughs in transformer architectures for 2024...

=== ArXiv Search ===
  - Efficient Transformers: A Survey (2024-01-15)
  - Attention is All You Need (2017-06-12)
  - FlashAttention: Fast and Memory-Efficient Exact Attention (2022-05-27)`,
      explanation: 'Defining two core research tools: web search for current information and arxiv for academic papers. Each tool has a clear function signature, docstring, and error handling. The tools return structured data that the agent can use for synthesis.',
    },
    {
      level: 'intermediate',
      code: `# Core logic: ReAct agent with tool execution
from langchain.agents import Tool, AgentExecutor, create_react_agent
from langchain.memory import ConversationBufferMemory
from langchain_community.tools import ArxivQueryRun, WikipediaQueryRun
from langchain_community.utilities import WikipediaAPIWrapper
from langchain_community.chat_models import ChatOpenAI
from langchain.prompts import PromptTemplate
from langchain.tools import tool

# Define custom tools
@tool
def search_web(query: str) -> str:
    """Search the web for current information on a topic."""
    url = f"https://api.duckduckgo.com/?q={query}&format=json"
    response = requests.get(url, timeout=10)
    data = response.json()
    return data.get("AbstractText", "No results found.")

# Initialize tools
tools = [
    Tool(
        name="web_search",
        func=search_web,
        description="Search the web for current information. Use for recent events and general knowledge.",
    ),
    ArxivQueryRun(),
    WikipediaQueryRun(api_wrapper=WikipediaAPIWrapper()),
]

# Create agent
llm = ChatOpenAI(model="gpt-4", temperature=0)
prompt = PromptTemplate.from_template("""
You are a research assistant. Answer the question using the tools available.
Always cite your sources. Show your reasoning step by step.

Tools: {tools}
Tool Names: {tool_names}
{chat_history}
Question: {input}
Agent Scratchpad: {agent_scratchpad}
""")

agent = create_react_agent(llm=llm, tools=tools, prompt=prompt)
memory = ConversationBufferMemory(memory_key="chat_history")
agent_executor = AgentExecutor(
    agent=agent,
    tools=tools,
    memory=memory,
    verbose=True,
    handle_parsing_errors=True,
    max_iterations=6,
)

# Run the agent
response = agent_executor.invoke({
    "input": "What are the latest advances in transformer efficiency? Find recent papers and summarize the key approaches."
})
print(f"\\nFinal Answer: {response['output']}")`,
      output: `> Entering new AgentExecutor chain...
Thought: I need to find recent papers on transformer efficiency.
Action: arxiv
Action Input: "efficient transformer 2024"
Observation: Found 3 papers...

Thought: Let me also check Wikipedia for background.
Action: wikipedia
Action Input: "Transformer (deep learning architecture)"
Observation: Summarizes the transformer architecture...

Thought: I have enough information to synthesize an answer.
Final Answer: Recent advances in transformer efficiency (2023-2024) focus on three key approaches: 1) Linear attention mechanisms (FlashAttention, 2022), 2) Sparse attention patterns (Longformer, BigBird), and 3) Model compression through pruning and quantization...`,
      explanation: 'LangChain ReAct agent with arxiv search, Wikipedia, and custom web search. The agent autonomously decides which tools to use, in what order, and synthesizes findings into a coherent answer. Conversation memory enables follow-up questions.',
    },
    {
      level: 'advanced',
      code: `# Deployment: Streamlit UI with streaming agent
import streamlit as st
from langchain.agents import AgentExecutor, create_react_agent
from langchain.memory import ConversationBufferMemory
from langchain_community.tools import ArxivQueryRun, WikipediaQueryRun
from langchain_community.utilities import WikipediaAPIWrapper
from langchain_community.callbacks import StreamlitCallbackHandler
from langchain_community.chat_models import ChatOpenAI
from langchain.prompts import PromptTemplate
from typing import List

st.set_page_config(page_title="AI Research Agent", layout="wide")
st.title("\\U0001f50d AI Research Agent")

# Initialize agent
@st.cache_resource
def create_agent():
    tools = [
        ArxivQueryRun(),
        WikipediaQueryRun(api_wrapper=WikipediaAPIWrapper()),
        Tool(
            name="web_search",
            func=search_web,
            description="Search the web for current information.",
        ),
    ]
    llm = ChatOpenAI(model="gpt-4", temperature=0, streaming=True)
    prompt = PromptTemplate.from_template("...")
    agent = create_react_agent(llm=llm, tools=tools, prompt=prompt)
    memory = ConversationBufferMemory(memory_key="chat_history")
    return AgentExecutor(
        agent=agent, tools=tools, memory=memory,
        verbose=True, handle_parsing_errors=True,
        max_iterations=6,
    )

# Session state
if "agent" not in st.session_state:
    st.session_state.agent = create_agent()
if "messages" not in st.session_state:
    st.session_state.messages = []

# Chat sidebar with sources
with st.sidebar:
    st.subheader("\\U0001f4ca Tool Usage")
    st.info("The agent uses: Web Search, ArXiv, Wikipedia")
    if st.button("Clear Conversation"):
        st.session_state.messages = []
        st.session_state.agent.memory.clear()

# Main chat
for msg in st.session_state.messages:
    with st.chat_message(msg["role"]):
        st.markdown(msg["content"])

if prompt := st.chat_input("Ask a research question..."):
    st.session_state.messages.append({"role": "user", "content": prompt})
    with st.chat_message("user"):
        st.markdown(prompt)

    with st.chat_message("assistant"):
        st_callback = StreamlitCallbackHandler(st.container())
        response = st.session_state.agent.invoke(
            {"input": prompt},
            {"callbacks": [st_callback]},
        )
        st.markdown(response["output"])
        st.session_state.messages.append(
            {"role": "assistant", "content": response["output"]}
        )`,
      output: `Streamlit app running on http://localhost:8501

User: What are the latest advances in transformer efficiency?
[Agent thinking... Searching arxiv... Found papers... Synthesizing...]

Assistant: Based on my research, here are the key advances in transformer efficiency:

1. FlashAttention (Dao et al., 2022): IO-aware exact attention that is 2x faster than standard attention by tiling and recomputation.
2. Sparse Transformers (Child et al., 2019): Use sparse attention patterns (strided, fixed) to reduce O(n²) complexity to O(n√n).
3. Linear Attention (Katharopoulos et al., 2020): Reformulates attention with kernel feature maps for O(n) complexity.

Sources: ArXiv papers 2205.14135, 1904.10509, 2006.16236`,
      explanation: 'Full Streamlit research agent with streaming output via StreamlitCallbackHandler. The agent shows its reasoning in real-time (tool calls, searches, observations) before delivering the final answer with citations. Memory enables multi-turn research sessions.',
    },
  ],
  realWorld: {
    useCases: [
      { industry: 'Academic Research', description: 'PhD students and researchers use agents to survey literature, track latest papers on specific topics, and summarize findings across multiple sources for literature reviews.' },
      { industry: 'Competitive Intelligence', description: 'Companies monitor competitors by having agents regularly search for news, patents, product launches, and hiring data. Agents can run on a schedule and alert on relevant changes.' },
      { industry: 'Financial Analysis', description: 'Analysts use agents to gather data on companies, markets, and economic indicators from multiple sources, synthesizing information for investment research reports.' },
    ],
    caseStudy: {
      problem: 'A research institute\'s scientists spent 10+ hours per week manually searching multiple databases (ArXiv, PubMed, Google Scholar, news) for relevant papers on their topics. New research was frequently missed or discovered months late.',
      solution: 'They deployed a multi-agent system: specialized sub-agents for each database (ArXiv agent, PubMed agent, news agent) coordinated by a supervisor agent. The system ran daily searches based on each scientist\'s saved queries, curated results, and generated weekly digests with key findings.',
      results: 'Research monitoring time dropped from 10 hours to 15 minutes per week. New relevant paper detection improved from 40% to 95%. Scientists discovered 3 important papers in the first month that their manual process had missed.',
    },
    bestPractices: [
      'Design tools with clear, descriptive names and docstrings — the LLM relies on these to choose correctly',
      'Set max_iterations to prevent infinite loops or runaway tool usage',
      'Implement tool timeouts to prevent the agent from hanging on slow API calls',
      'Log all agent interactions (thoughts, actions, observations) for debugging and improvement',
      'Use streaming output to build user trust and enable early intervention if the agent goes off-track',
      'Cache tool results for identical queries to reduce API costs and latency',
    ],
    tools: ['LangChain / LangGraph', 'OpenAI / Anthropic / Ollama', 'ArXiv API', 'Wikipedia API', 'Streamlit', 'DuckDuckGo / SerpAPI / Tavily'],
    jobRoles: ['AI Engineer', 'Research Engineer', 'LLM Engineer', 'Applied Scientist'],
    furtherReading: [
      'LangChain Documentation: Agents',
      'ReAct: Synergizing Reasoning and Acting in Language Models (Yao et al., 2022)',
      'Tool-Use Best Practices from Anthropic',
      'Building Effective AI Agents — Lilian Weng (OpenAI)',
    ],
  },
  quiz: [
    {
      id: 'p21-agent-1', type: 'mcq',
      question: 'What is the ReAct loop in agent systems?',
      options: [
        'A tool that searches academic papers',
        'A pattern that alternates between reasoning (Thought) and acting (Action/Observation)',
        'A memory mechanism for storing chat history',
        'A prompt template for question answering',
      ],
      correctAnswer: 'A pattern that alternates between reasoning (Thought) and acting (Action/Observation)',
      explanation: 'ReAct (Reasoning + Acting) is a loop where the agent thinks about what to do, takes an action (calls a tool), observes the result, and repeats until it can formulate a final answer. This enables dynamic, multi-step reasoning.',
    },
    {
      id: 'p21-agent-2', type: 'code',
      question: 'What does max_iterations=6 control in the agent executor?',
      code: `agent_executor = AgentExecutor(
    agent=agent,
    tools=tools,
    max_iterations=6,
    handle_parsing_errors=True,
)`,
      options: [
        'The maximum number of conversation turns stored in memory',
        'The maximum number of tool calls before the agent must produce a final answer',
        'The maximum number of users that can access the agent simultaneously',
        'The maximum length of the final answer in tokens',
      ],
      correctAnswer: 'The maximum number of tool calls before the agent must produce a final answer',
      explanation: 'max_iterations limits how many times the agent can call tools in a single query. Without this limit, the agent could loop indefinitely. After 6 iterations, the agent is forced to produce a final answer or fails gracefully.',
    },
    {
      id: 'p21-agent-3', type: 'truefalse',
      question: 'An agent with more tools always produces better results.',
      correctAnswer: 'False',
      explanation: 'More tools increase the action space and can confuse the LLM. Each tool adds decision complexity. A focused agent with 3-5 well-designed, well-described tools typically outperforms one with 10+ poorly described tools.',
    },
    {
      id: 'p21-agent-4', type: 'fillblank',
      question: 'The agent mechanism that shows reasoning in real-time to build user trust is called ___ output.',
      correctAnswer: 'streaming',
      explanation: 'Streaming output shows the agent\'s intermediate thoughts, tool calls, and observations as they happen. This builds transparency and user trust, and allows users to intervene if the agent goes off-track.',
    },
    {
      id: 'p21-agent-5', type: 'match',
      question: 'Match each agent component to its function:',
      pairs: [
        { left: 'Tool', right: 'A function the agent can call (search, calculator, etc.)' },
        { left: 'Memory', right: 'Stores conversation history and intermediate reasoning' },
        { left: 'Orchestrator', right: 'Manages the ReAct loop and error recovery' },
        { left: 'System Prompt', right: 'Defines the agent\'s persona and behavior rules' },
      ],
      correctAnswer: 'All matched correctly',
      explanation: 'Tools provide capabilities, memory provides context, the orchestrator manages execution flow, and the system prompt sets behavioral guidelines. Together these form a complete agent system.',
    },
  ],
}))

export {}
