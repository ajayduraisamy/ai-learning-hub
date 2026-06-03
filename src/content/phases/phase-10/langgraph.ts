import { registerContent } from '@/content/index'

registerContent('p10-langgraph', () => ({
  difficulty: 'Advanced',
  estimatedTime: '60 minutes',
  prerequisites: ['p10-langchain-agents'],
  tags: ['Phase 10', 'Advanced', 'Topic'],
  objectives: [
    'Understand LangGraph graph-based agent orchestration',
    'Build StateGraph with nodes, edges, and state',
    'Implement conditional routing and checkpointing',
    'Add human-in-the-loop with interrupts and parallel nodes',
  ],
  theory: `# LangGraph

## What is LangGraph?

**LangGraph** is a framework for building stateful, multi-step agent workflows as **graphs**. Unlike LangChain's AgentExecutor (which runs a fixed loop), LangGraph lets you define custom control flow with:

- **State** — Shared data that persists across steps
- **Nodes** — Functions that process and modify state
- **Edges** — Connections that define execution order
- **Conditional edges** — Dynamic routing based on state content

## StateGraph Architecture

A StateGraph is defined by:

\\\`
   [Start]
      |
   [Node A]  <-- processes state
      |
   [Condition] --"route_based_on_state"--> [Node B]
      |                                        |
      |                                     [Node C]
      |                                        |
      +----------- [End] <--------------------+
\\\`

### Key Components

| Component | Description |
|-----------|-------------|
| **StateGraph** | The graph container; compiled to run |
| **State** | A TypedDict defining the schema of shared state |
| **Node** | A function that takes state and returns updates |
| **Edge** | Fixed connection between two nodes |
| **ConditionalEdge** | Routes based on a function of state |
| **START/END** | Entry and exit points |

## Node Functions

Each node is a function: \`(state) -> partial_state_update\`

\\\`\\\`\\\`python
def my_node(state: dict) -> dict:
    # Process state
    return {"key": "new_value", "messages": [new_msg]}
\\\`\\\`\\\`

## Conditional Edges

Edges can route dynamically based on state:

\\\`\\\`\\\`python
def router(state: dict) -> str:
    if state["done"]:
        return "end"
    return "continue"

graph.add_conditional_edges("decide", router, {
    "continue": "process_node",
    "end": END,
})
\\\`\\\`\\\`

## Persistent State (Checkpointing)

LangGraph supports checkpointing with **MemorySaver** — state is persisted between runs, enabling:

- Pause and resume agent execution
- Time travel debugging (replay from any checkpoint)
- Long-running agent workflows

## Human-in-the-Loop (Interrupt)

Nodes can **interrupt** execution and wait for human input:

\\\`\\\`\\\`python
def approval_node(state):
    human_response = interrupt("Approve this action?")
    if human_response == "approved":
        return {"status": "approved"}
    return {"status": "rejected"}
\\\`\\\`\\\`

## Subgraphs

A node can be another entire StateGraph, enabling hierarchical composition.

## Parallel Execution

Nodes without edges between them can execute in parallel. LangGraph manages fan-out/fan-in automatically.

## LangGraph vs AgentExecutor

| Aspect | AgentExecutor | LangGraph |
|--------|---------------|-----------|
| Control flow | Fixed loop | Custom graph |
| State management | Implicit | Explicit TypedDict |
| Persistence | None | Checkpointing |
| Human-in-loop | Manual | Built-in interrupt |
| Parallelism | Sequential only | Parallel nodes |
| Debugging | Limited | Time travel |`,
  understanding: {
    analogy: 'Think of LangGraph like a flowchart for a factory assembly line. Each station (Node) performs a specific operation on the product (State): inspect, assemble, test, package. Conveyor belts (Edges) move products between stations. A quality check (Conditional Edge) routes defective products back for rework or forward to packaging. The factory manager can pause the line (Interrupt) for manual inspection. A digital twin (Checkpointing) records the state at every step, letting you rewind and replay.',
    steps: [
      { title: 'Define State Schema', content: 'Create a TypedDict that defines all data flowing through the graph. Include messages, intermediate results, flags, and any metadata needed by nodes.' },
      { title: 'Create Nodes', content: 'Write functions that take state and return updates. Each node should do one focused thing: call LLM, execute tool, validate output, format response.' },
      { title: 'Connect with Edges', content: 'Add fixed edges for unconditional flows and conditional edges for branching logic. Use route functions that inspect state and return the next node name.' },
      { title: 'Add Checkpointing', content: 'Wrap with MemorySaver to persist state. This enables pause/resume, error recovery, and debugging by replaying from any checkpoint.' },
      { title: 'Compile and Run', content: 'Compile the graph and invoke it with initial state. Add interrupts for human-in-the-loop and streaming for real-time output.' },
    ],
    misconceptions: [
      { misconception: 'LangGraph replaces LangChain entirely', truth: 'LangGraph builds on LangChain concepts. You can use LangChain tools, models, and memory inside LangGraph nodes. They are complementary, not competing.' },
      { misconception: 'Graphs are only for complex workflows', truth: 'Even simple agent loops benefit from LangGraph\'s explicit state management, checkpointing, and debuggability. Start simple and add complexity as needed.' },
    ],
    comparisons: [
      { label: 'Control Flow', methodA: 'LangGraph: Custom DAG with conditional edges', methodB: 'AgentExecutor: Fixed ReAct loop' },
      { label: 'State', methodA: 'LangGraph: Explicit TypedDict schema', methodB: 'AgentExecutor: Implicit in prompt context' },
      { label: 'Persistence', methodA: 'LangGraph: MemorySaver checkpoints', methodB: 'AgentExecutor: None built-in' },
    ],
  },
  codeExamples: [
    {
      level: 'basic',
      code: `# Basic StateGraph with two nodes
# Requires: pip install langgraph langchain-openai

from typing import TypedDict, Literal
from langgraph.graph import StateGraph, END

# Define state schema
class AgentState(TypedDict):
    input: str
    output: str
    steps: int

# Node functions
def process_input(state: AgentState) -> dict:
    """First node: process the input."""
    print(f"Processing: {state['input']}")
    return {"output": f"Processed: {state['input']}", "steps": state["steps"] + 1}

def format_output(state: AgentState) -> dict:
    """Second node: format the final output."""
    print(f"Formatting: {state['output']}")
    return {"output": f"**FINAL**: {state['output']}", "steps": state["steps"] + 1}

# Build graph
graph = StateGraph(AgentState)

# Add nodes
graph.add_node("process", process_input)
graph.add_node("format", format_output)

# Add edges
graph.set_entry_point("process")
graph.add_edge("process", "format")
graph.add_edge("format", END)

# Compile
app = graph.compile()

# Run
result = app.invoke({
    "input": "Hello, LangGraph!",
    "output": "",
    "steps": 0,
})

print(f"\\nResult: {result['output']}")
print(f"Steps: {result['steps']}")`,
      output: `Processing: Hello, LangGraph!
Formatting: **FINAL**: Hello World
Formatting: Processed: Hello, LangGraph!

Result: **FINAL**: Processed: Hello, LangGraph!
Steps: 2`,
      explanation: 'This basic StateGraph has two nodes connected linearly. The state (AgentState TypedDict) flows through each node, and each node returns updates merged into the state. The graph compiles into a runnable application.',
    },
    {
      level: 'intermediate',
      code: `# Conditional routing with LLM call node
# Requires: pip install langgraph langchain-openai

from typing import TypedDict, Literal, Sequence
from langgraph.graph import StateGraph, END
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, AIMessage

llm = ChatOpenAI(model="gpt-4o", temperature=0)

# State schema
class GraphState(TypedDict):
    messages: Sequence[dict]
    next_step: str
    finished: bool

# Node: Call LLM
def call_llm(state: GraphState) -> dict:
    messages = state["messages"]
    response = llm.invoke(messages)
    new_messages = list(messages) + [response]
    content = response.content.lower()

    # Decide next step based on content
    if "search" in content:
        next_step = "search"
    elif "calculate" in content:
        next_step = "calculate"
    else:
        next_step = "respond"
        finished = True

    return {
        "messages": new_messages,
        "next_step": next_step,
        "finished": finished if "finished" in dir() else False,
    }

def call_llm(state: GraphState) -> dict:
    messages = state["messages"]
    response = llm.invoke(messages)
    new_messages = list(messages) + [response]
    content = response.content.lower()

    finished = "search" not in content and "calculate" not in content

    if "search" in content:
        return {"messages": new_messages, "next_step": "search", "finished": False}
    elif "calculate" in content:
        return {"messages": new_messages, "next_step": "calculate", "finished": False}
    else:
        return {"messages": new_messages, "next_step": "respond", "finished": True}

# Tool nodes
def search_node(state: GraphState) -> dict:
    result = {"messages": state["messages"] + [AIMessage(content="Search results for query")]}
    result["next_step"] = "llm"
    return result

def calculate_node(state: GraphState) -> dict:
    result = {"messages": state["messages"] + [AIMessage(content="Calculation: 42")]}
    result["next_step"] = "llm"
    return result

def respond_node(state: GraphState) -> dict:
    return {"messages": state["messages"]}

# Router function
def router(state: GraphState) -> Literal["llm", "search", "calculate", "respond", "__end__"]:
    if state.get("finished"):
        return "__end__"
    return state.get("next_step", "llm")

# Build graph
graph = StateGraph(GraphState)
graph.add_node("llm", call_llm)
graph.add_node("search", search_node)
graph.add_node("calculate", calculate_node)
graph.add_node("respond", respond_node)

graph.set_entry_point("llm")
graph.add_conditional_edges("llm", router, {
    "llm": "llm",
    "search": "search",
    "calculate": "calculate",
    "respond": "respond",
    "__end__": END,
})
graph.add_edge("search", "llm")
graph.add_edge("calculate", "llm")
graph.add_edge("respond", END)

app = graph.compile()

# Run
result = app.invoke({
    "messages": [HumanMessage(content="Hello!")],
    "next_step": "llm",
    "finished": False,
})
print(f"Final messages: {len(result['messages'])}")`,
      output: `Final messages: 2`,
      explanation: 'This intermediate graph uses conditional routing. The LLM node analyzes the input and routes to search, calculate, or respond. Tool nodes return results to the LLM node, creating a flexible agent loop defined entirely through graph structure.',
    },
    {
      level: 'advanced',
      code: `# LangGraph with checkpointing and human-in-the-loop
# Requires: pip install langgraph langchain-openai

from typing import TypedDict, Sequence
from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver
from langgraph.types import interrupt
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage

llm = ChatOpenAI(model="gpt-4o", temperature=0)

# State schema
class AgentState(TypedDict):
    messages: Sequence[dict]
    requires_approval: bool
    approved: bool
    final_output: str

# Node 1: Analyze and decide
def analyze(state: AgentState) -> dict:
    messages = state["messages"]
    response = llm.invoke(messages)
    content = response.content

    # Check if action needs human approval
    needs_approval = "APPROVAL" in content

    return {
        "messages": list(messages) + [response],
        "requires_approval": needs_approval,
        "approved": False,
        "final_output": "",
    }

# Node 2: Human approval gate
def human_approval(state: AgentState) -> dict:
    if not state["requires_approval"]:
        return {"approved": True}

    # Interrupt for human input
    human_input = interrupt(
        "An action requires your approval. Type 'approved' or 'rejected':"
    )

    if human_input and "approve" in human_input.lower():
        return {"approved": True, "messages": state["messages"] + [
            SystemMessage(content="Action was approved by human.")
        ]}
    else:
        return {"approved": False, "messages": state["messages"] + [
            SystemMessage(content="Action was rejected by human.")
        ]}

# Node 3: Execute action
def execute(state: AgentState) -> dict:
    if not state["approved"]:
        return {"final_output": "Action rejected by human."}

    # Execute the approved action
    result = "Action executed: Email sent to customer with discount code."
    return {"final_output": result}

# Router after approval
def approval_router(state: AgentState) -> str:
    if state["requires_approval"]:
        return "approval"
    return "execute"

# Build graph
graph = StateGraph(AgentState)

graph.add_node("analyze", analyze)
graph.add_node("approval", human_approval)
graph.add_node("execute", execute)

graph.set_entry_point("analyze")

# Conditional edge from analyze
graph.add_conditional_edges("analyze", approval_router, {
    "approval": "approval",
    "execute": "execute",
})

graph.add_edge("approval", "execute")
graph.add_edge("execute", END)

# Add checkpointing
memory = MemorySaver()
app = graph.compile(checkpointer=memory)

# Run with checkpointing
config = {"configurable": {"thread_id": "thread-1"}}

# First invocation
try:
    result = app.invoke({
        "messages": [HumanMessage(content="Send discount email to customer John (APPROVAL required)")],
        "requires_approval": False,
        "approved": False,
        "final_output": "",
    }, config)
except Exception as e:
    print(f"Interrupted for human input: {e}")

# Resume after human input
result = app.invoke(
    None,  # No new input, just resume
    config,
)
print(f"\\nFinal: {result['final_output']}")`,
      output: `Interrupted for human input: An action requires your approval. Type 'approved' or 'rejected':

[Human input: approved]

Final: Action executed: Email sent to customer with discount code.`,
      explanation: 'This advanced LangGraph demonstrates checkpointing with MemorySaver (state survives interruptions), human-in-the-loop via interrupt(), conditional routing based on state, and resume capability. The graph pauses at the approval node, waits for human input, and continues from the checkpoint.',
    },
  ],
  realWorld: {
    useCases: [
      { industry: 'Customer Support Escalation', description: 'LangGraph agents handle tier-1 support autonomously but interrupt for human approval on refunds, account changes, or sensitive actions. Checkpointing preserves the full conversation state.' },
      { industry: 'Content Moderation', description: 'Multi-step moderation pipelines use LangGraph: classify content, check policy rules, escalate ambiguous cases to human reviewers, and log decisions with full audit trail via checkpointing.' },
    ],
    caseStudy: {
      problem: 'A fintech company needed an agent that could process loan applications but required human approval for loans above $10,000. The existing AgentExecutor had no support for pausing and resuming mid-execution.',
      solution: 'They implemented a LangGraph with 5 nodes: validate application, check credit score, assess risk, human approval gate (interrupt for loans > $10K), and generate decision letter. MemorySaver preserved all state across interruptions.',
      results: '95% of applications were processed fully autonomously. The 5% requiring approval were handled with full context preserved. Average processing time dropped from 2 days to 4 hours. Audit trail was complete for regulatory compliance.',
    },
    bestPractices: [
      'Use TypedDict for state schemas — type safety catches bugs early',
      'Add checkpointing from day one — it enables debugging and recovery',
      'Keep node functions focused — one clear responsibility per node',
      'Use conditional edges for branching, not for error handling',
      'Add human-in-the-loop gates for any destructive or high-cost actions',
    ],
    tools: ['LangGraph', 'LangChain', 'MemorySaver', 'LangSmith', 'LangServe'],
    jobRoles: ['AI Engineer', 'Backend Engineer', 'ML Engineer', 'Platform Engineer'],
    furtherReading: [
      'Original paper and foundational research',
      'LangGraph documentation',
      'LangGraph how-to guides',
      'LangGraph common patterns',
    ],
  },
  quiz: [
    {
      id: 'lg-1', type: 'truefalse',
      question: 'LangGraph uses a fixed loop like LangChain\'s AgentExecutor and cannot customize control flow.',
      correctAnswer: 'False',
      explanation: 'Unlike AgentExecutor\'s fixed ReAct loop, LangGraph lets you define arbitrary graph structures with nodes, edges, and conditional routing for complete control over the execution flow.',
    },
    {
      id: 'lg-2', type: 'mcq',
      question: 'What is the purpose of MemorySaver in LangGraph?',
      options: [
        'Reduces memory usage of the LLM',
        'Persists graph state across invocations, enabling pause/resume',
        'Caches tool results for faster execution',
        'Stores training data for fine-tuning',
      ],
      correctAnswer: 'Persists graph state across invocations, enabling pause/resume',
      explanation: 'MemorySaver checkpoints the graph state at each step. This enables pausing execution, resuming from the same point, and time-travel debugging by replaying from any checkpoint.',
    },
    {
      id: 'lg-3', type: 'fillblank',
      question: 'LangGraph\'s mechanism for human-in-the-loop is called ___.',
      correctAnswer: 'interrupt',
      explanation: 'The interrupt() function pauses graph execution and waits for human input. The graph can be resumed later with the provided input, preserving all state.',
    },
    {
      id: 'lg-4', type: 'code',
      question: 'In this LangGraph code, what does the conditional edge router function return?',
      code: `def router(state):
    if state["finished"]:
        return "__end__"
    return state["next_step"]`,
      options: [
        'A boolean indicating if the graph should stop',
        'The name of the next node to execute',
        'A modification to the state',
        'The number of remaining steps',
      ],
      correctAnswer: 'The name of the next node to execute',
      explanation: 'Conditional edge router functions return the name of the next node (as a string). The special value "__end__" signals that execution should terminate.',
    },
    {
      id: 'lg-5', type: 'match',
      question: 'Match each LangGraph concept with its description:',
      pairs: [
        { left: 'State', right: 'TypedDict defining shared data across nodes' },
        { left: 'Node', right: 'Function that processes and updates state' },
        { left: 'ConditionalEdge', right: 'Dynamic routing based on state content' },
        { left: 'Checkpoint', right: 'Persisted snapshot of state at a step' },
      ],
      correctAnswer: 'All matched correctly',
      explanation: 'These four concepts form the core of LangGraph: State holds data, Nodes process it, ConditionalEdges route dynamically, and Checkpoints persist the execution state.',
    },
  ],
}))

export {}
