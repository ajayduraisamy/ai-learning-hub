import { registerContent } from '@/content/index'

registerContent('p10-multi-agent', () => ({
  difficulty: 'Advanced',
  estimatedTime: '60 minutes',
  prerequisites: ['p10-agent-fundamentals', 'p10-tool-use'],
  tags: ['Phase 10', 'Advanced', 'Topic'],
  objectives: [
    'Understand multi-agent architectures: hierarchical, flat, circular',
    'Build CrewAI crews with agents, tasks, and processes',
    'Implement AutoGen two-agent and group chat patterns',
    'Design communication protocols and shared memory across agents',
  ],
  theory: `# Multi-Agent Systems (CrewAI, AutoGen)

## Why Multi-Agent?

Single agents have limitations: limited context windows, single perspective, and no specialization. Multi-agent systems address these by:

- **Specialization** — Each agent has a focused role (researcher, writer, reviewer)
- **Parallelism** — Agents work simultaneously on different tasks
- **Debate** — Agents critique each other's outputs for higher quality
- **Resilience** — One agent can catch another's mistakes

## Multi-Agent Architectures

### Hierarchical
A manager agent delegates tasks to worker agents and synthesizes results. Workers report back to the manager.

\\\`
Manager
  |-- Researcher Agent
  |-- Writer Agent
  |-- Reviewer Agent
\\\`

### Flat
All agents communicate peer-to-peer. Each agent knows its role and collaborates directly with others.

\\\`
Researcher <--> Writer <--> Reviewer
\\\`

### Circular
Agents pass work in a fixed sequence. Each agent adds to or transforms the output before passing to the next.

\\\`
Researcher -> Writer -> Reviewer -> (back to Researcher if needed)
\\\`

## Agent Roles and Responsibilities

Each agent should have:
- **Clear role** — e.g., "Senior Python Engineer"
- **Specific goal** — e.g., "Write production-ready code"
- **Defined tools** — e.g., code interpreter, file system access
- **Context window** — How much history it can see
- **Handoff criteria** — When to delegate or ask for help

## Communication Protocols

- **Direct messaging** — Agent A sends message to Agent B
- **Broadcast** — One agent messages all others
- **Group chat** — All agents see all messages (AutoGen GroupChat)
- **Shared blackboard** — Agents read/write to a shared state

## CrewAI

CrewAI is a framework for orchestrating role-based AI agents.

### Key Concepts

| Component | Description |
|-----------|-------------|
| **Agent** | Role-based entity with goal, backstory, tools |
| **Task** | A unit of work assigned to an agent |
| **Crew** | Orchestrator that runs agents and tasks |
| **Process** | Execution flow: sequential or hierarchical |
| **Tool** | External capability an agent can use |

### Process Types

- **Sequential** — Tasks execute one after another
- **Hierarchical** — Manager delegates to workers

## AutoGen

AutoGen (Microsoft) is a framework for building multi-agent conversations.

### Key Concepts

| Component | Description |
|-----------|-------------|
| **ConversableAgent** | Base agent class with send/receive |
| **AssistantAgent** | LLM-powered agent |
| **UserProxyAgent** | Human or code-execution proxy |
| **GroupChat** | Multi-agent chat room |
| **GroupChatManager** | Orchestrates group chat turns |

### Patterns

- **Two-agent chat** — Assistant + UserProxy for code generation
- **Group chat** — Multiple agents discuss and solve problems
- **Debate** — Agents take opposing positions to refine output`,
  understanding: {
    analogy: 'A multi-agent system is like a team of specialists collaborating on a project. You have a researcher who gathers information, a writer who drafts content, an editor who reviews, and a project manager who coordinates. Each specialist has their own tools (databases, style guides, checklists) and communicates through meetings and shared documents. The project manager assigns tasks, sets deadlines, and resolves conflicts.',
    steps: [
      { title: 'Define Agent Roles', content: 'Create specialized agents with clear identities, goals, and tool access. Each role should be narrow enough for expertise but broad enough for meaningful work.' },
      { title: 'Design the Workflow', content: 'Choose an architecture (hierarchical, flat, circular) and define how agents discover, communicate, and hand off work to each other.' },
      { title: 'Create Tasks', content: 'Break the overall goal into discrete tasks. Each task specifies which agent handles it, what tools they need, and what success looks like.' },
      { title: 'Orchestrate Execution', content: 'Run the crew or group chat. Agents execute their tasks, share results, and may iterate based on feedback from other agents.' },
      { title: 'Synthesize Results', content: 'Collect outputs from all agents. A manager agent or the orchestrator combines individual results into a cohesive final output.' },
    ],
    misconceptions: [
      { misconception: 'More agents always produces better results', truth: 'Each agent adds overhead (token costs, latency, coordination complexity). Two to five specialized agents often outperform a swarm of generic agents.' },
      { misconception: 'Multi-agent is just calling multiple LLMs separately', truth: 'Agents communicate, debate, and build on each other\'s work. They share context, delegate tasks, and coordinate — this is fundamentally different from independent LLM calls.' },
    ],
    comparisons: [
      { label: 'Philosophy', methodA: 'CrewAI: Role-based, task-driven, structured', methodB: 'AutoGen: Conversation-driven, flexible, emergent' },
      { label: 'Coordination', methodA: 'CrewAI: Sequential or hierarchical processes', methodB: 'AutoGen: Group chat with turn management' },
      { label: 'Use Case', methodA: 'CrewAI: Defined workflows, predictable output', methodB: 'AutoGen: Exploratory discussions, dynamic problem-solving' },
    ],
  },
  codeExamples: [
    {
      level: 'basic',
      code: `# CrewAI basic setup (conceptual)
# Requires: pip install crewai
from crewai import Agent, Task, Crew, Process

# Define agents with roles
researcher = Agent(
    role="Research Analyst",
    goal="Find comprehensive information on the given topic",
    backstory="Expert researcher with access to search tools",
    verbose=True,
    allow_delegation=False,
)

writer = Agent(
    role="Content Writer",
    goal="Create engaging content from research findings",
    backstory="Professional writer who crafts clear, compelling content",
    verbose=True,
    allow_delegation=False,
)

# Define tasks
research_task = Task(
    description="Research the latest trends in AI agents for 2026",
    expected_output="A detailed research report with key findings",
    agent=researcher,
)

writing_task = Task(
    description="Write a blog post based on the research findings",
    expected_output="A 500-word blog post ready for publication",
    agent=writer,
)

# Create crew with sequential process
crew = Crew(
    agents=[researcher, writer],
    tasks=[research_task, writing_task],
    process=Process.sequential,
    verbose=True,
)

# Execute
result = crew.kickoff()
print(result)`,
      output: `[Research Analyst]: Starting research on AI agents 2026...
[Research Analyst]: Found 15 key trends...
[Research Analyst]: Research report complete.

[Content Writer]: Starting blog post from research...
[Content Writer]: Blog post drafted and formatted.
[Content Writer]: Output: "The Future of AI Agents: Top 10 Trends for 2026"`,
      explanation: 'This minimal CrewAI setup shows two agents (researcher, writer) connected by a sequential process. The researcher\'s output feeds into the writer\'s task, demonstrating the role-based, task-driven pattern.',
    },
    {
      level: 'intermediate',
      code: `# AutoGen two-agent chat and group chat
# Requires: pip install pyautogen

import autogen

# Configure LLM
llm_config = {
    "config_list": [{"model": "gpt-4o", "api_key": "your-key"}],
    "temperature": 0.7,
}

# Create agents
assistant = autogen.AssistantAgent(
    name="Assistant",
    llm_config=llm_config,
    system_message="You are a helpful AI assistant.",
)

user_proxy = autogen.UserProxyAgent(
    name="User",
    human_input_mode="NEVER",
    max_consecutive_auto_reply=10,
    code_execution_config={
        "work_dir": "coding",
        "use_docker": False,
    },
)

# Two-agent chat
user_proxy.initiate_chat(
    assistant,
    message="Write a Python script to analyze a CSV file",
)

# --- Group Chat ---
def create_group_chat():
    researcher = autogen.AssistantAgent(
        name="Researcher",
        llm_config=llm_config,
        system_message="You are a research specialist. Find accurate information.",
    )

    analyst = autogen.AssistantAgent(
        name="Analyst",
        llm_config=llm_config,
        system_message="You analyze data and extract insights.",
    )

    writer = autogen.AssistantAgent(
        name="Writer",
        llm_config=llm_config,
        system_message="You write clear, professional reports.",
    )

    groupchat = autogen.GroupChat(
        agents=[user_proxy, researcher, analyst, writer],
        messages=[],
        max_round=10,
    )

    manager = autogen.GroupChatManager(
        groupchat=groupchat,
        llm_config=llm_config,
    )

    return user_proxy, manager

user, manager = create_group_chat()
user.initiate_chat(
    manager,
    message="Research the top 3 AI frameworks of 2026 and write a report.",
)`,
      output: `User (to manager):
Research the top 3 AI frameworks of 2026 and write a report.

Researcher (to groupchat):
I'll research the top AI frameworks of 2026.

Analyst (to groupchat):
Based on the research, here are my findings...

Writer (to groupchat):
I've compiled the final report based on the analysis.`,
      explanation: 'This intermediate example shows two AutoGen patterns: a two-agent chat (Assistant + UserProxy) and a group chat with specialized agents (Researcher, Analyst, Writer) coordinated by a GroupChatManager.',
    },
    {
      level: 'advanced',
      code: `# CrewAI hierarchical process with debate pattern
# Requires: pip install crewai

from crewai import Agent, Task, Crew, Process
from typing import List

class DebateCrew:
    """Multi-agent debate system using CrewAI hierarchical process."""

    def __init__(self, topic: str):
        self.topic = topic
        self._setup_agents()
        self._setup_tasks()

    def _setup_agents(self):
        """Create specialized agents for debate."""
        self.proponent = Agent(
            role="Proponent",
            goal=f"Argue in favor of: {self.topic}",
            backstory="You are a persuasive advocate who builds strong arguments",
            verbose=True,
        )

        self.opponent = Agent(
            role="Opponent",
            goal=f"Argue against: {self.topic}",
            backstory="You are a critical thinker who identifies flaws",
            verbose=True,
        )

        self.judge = Agent(
            role="Judge",
            goal="Evaluate arguments from both sides and reach a balanced conclusion",
            backstory="You are an impartial expert who weighs evidence carefully",
            verbose=True,
            allow_delegation=False,
        )

    def _setup_tasks(self):
        """Define the debate workflow tasks."""
        self.pro_argument = Task(
            description=f"Build a compelling case FOR: {self.topic}\\n"
                        "Include evidence, reasoning, and examples.",
            expected_output="Structured argument with 3 main points",
            agent=self.proponent,
        )

        self.con_argument = Task(
            description=f"Build a compelling case AGAINST: {self.topic}\\n"
                        "Address counterpoints and provide evidence.",
            expected_output="Structured counter-argument with 3 main points",
            agent=self.opponent,
        )

        self.verdict = Task(
            description="Review both arguments and provide a balanced verdict.\\n"
                        "Evaluate: evidence quality, reasoning strength, logical consistency.",
            expected_output="Final verdict with reasoning",
            agent=self.judge,
        )

    def run(self) -> str:
        """Execute the debate crew."""
        crew = Crew(
            agents=[self.proponent, self.opponent, self.judge],
            tasks=[self.pro_argument, self.con_argument, self.verdict],
            process=Process.hierarchical,
            manager_agent=Agent(
                role="Debate Moderator",
                goal="Ensure fair and structured debate",
                backstory="Experienced moderator who manages turn-taking",
            ),
            verbose=True,
        )
        return crew.kickoff()

# Run debate
# debate = DebateCrew("AI agents will replace most software engineers by 2030")
# result = debate.run()
# print(result)

# --- Shared Memory Pattern ---
class SharedMemory:
    """Simple shared memory for multi-agent systems."""

    def __init__(self):
        self._store = {}
        self._history = []

    def write(self, key: str, value: str, agent: str):
        """Write to shared memory with audit trail."""
        self._store[key] = value
        self._history.append({
            "agent": agent,
            "action": "write",
            "key": key,
            "timestamp": __import__('time').time(),
        })

    def read(self, key: str) -> str:
        """Read from shared memory."""
        return self._store.get(key, "")

    def get_history(self) -> List[dict]:
        return self._history.copy()

memory = SharedMemory()
memory.write("research_findings", "AI agents are growing 3x YoY", "Researcher")
memory.write("draft_report", "Draft v1: Market analysis complete", "Writer")
print(f"Research: {memory.read('research_findings')}")
print(f"History: {len(memory.get_history())} operations")`,
      output: `Debate Moderator: Starting hierarchical debate process...

Proponent: Building case FOR the topic...
Proponent: 1. AI improves efficiency 2. Cost reduction 3. Handles complex tasks

Opponent: Building case AGAINST the topic...
Opponent: 1. Lacks human judgment 2. Security risks 3. Job displacement concerns

Judge: Evaluating both arguments...
Judge: Balanced verdict with recommendations.

Research: AI agents are growing 3x YoY
History: 2 operations`,
      explanation: 'This advanced example demonstrates a hierarchical multi-agent debate system with CrewAI. A moderator manages the flow, proponent/opponent present arguments, and a judge delivers a verdict. The SharedMemory class provides auditable state sharing between agents.',
    },
  ],
  realWorld: {
    useCases: [
      { industry: 'Content Production', description: 'Media companies use multi-agent pipelines: researcher gathers facts, writer drafts, editor polishes, fact-checker verifies, publisher formats and distributes.' },
      { industry: 'Software Development', description: 'Multi-agent coding systems: architect designs, coder implements, reviewer checks quality, tester runs tests, DevOps deploys — all coordinated through a shared project board.' },
    ],
    caseStudy: {
      problem: 'A large enterprise needed to generate 500+ product descriptions monthly across 12 categories. Quality was inconsistent and the manual process was slow.',
      solution: 'A 4-agent CrewAI pipeline: Research Agent gathered product specs, Writer Agent drafted descriptions, Reviewer Agent checked for brand compliance, Translator Agent localized for 5 languages.',
      results: 'Production time dropped from 20 days to 6 hours. Consistency improved from 60% to 98%. The hierarchical process caught 95% of brand guideline violations automatically.',
    },
    bestPractices: [
      'Define agent roles narrowly — a specialist beats a generalist every time',
      'Use hierarchical processes when output quality is critical (manager reviews work)',
      'Limit group chat to 3-5 agents to avoid coordination overhead',
      'Implement shared memory for long-running multi-agent workflows',
      'Log all inter-agent communication for debugging and improvement',
    ],
    tools: ['CrewAI', 'AutoGen (pyautogen)', 'LangGraph', 'Semantic Kernel', 'Camel'],
    jobRoles: ['AI Architect', 'ML Engineer', 'Systems Engineer', 'Prompt Engineer'],
    furtherReading: [
      'Original paper and foundational research',
      'CrewAI documentation and tutorials',
      'AutoGen documentation and examples',
      'Microsoft Research: AutoGen papers',
    ],
  },
  quiz: [
    {
      id: 'ma-1', type: 'truefalse',
      question: 'In a multi-agent system, all agents should have identical roles and capabilities.',
      correctAnswer: 'False',
      explanation: 'The key benefit of multi-agent systems is specialization — each agent has a unique role, expertise, and toolset. Identical agents would duplicate effort without adding value.',
    },
    {
      id: 'ma-2', type: 'mcq',
      question: 'What is the difference between CrewAI sequential and hierarchical processes?',
      options: [
        'Sequential uses fewer agents than hierarchical',
        'Sequential runs tasks one after another; hierarchical uses a manager to delegate',
        'Hierarchical is only for text tasks; sequential is for code',
        'There is no difference — they are the same',
      ],
      correctAnswer: 'Sequential runs tasks one after another; hierarchical uses a manager to delegate',
      explanation: 'Sequential processes execute tasks in order. Hierarchical processes have a manager agent that delegates to workers, reviews results, and makes decisions.',
    },
    {
      id: 'ma-3', type: 'fillblank',
      question: 'AutoGen\'s component that orchestrates a multi-agent conversation is called ___.',
      correctAnswer: 'GroupChatManager',
      explanation: 'GroupChatManager manages turn-taking, message routing, and termination conditions in an AutoGen GroupChat of multiple agents.',
    },
    {
      id: 'ma-4', type: 'code',
      question: 'In this CrewAI code, what does Process.sequential do?',
      code: `crew = Crew(
    agents=[researcher, writer],
    tasks=[research_task, writing_task],
    process=Process.sequential,
)`,
      options: [
        'Runs all agents simultaneously',
        'Runs research_task first, then writing_task',
        'Lets agents decide the execution order',
        'Creates a debate between agents',
      ],
      correctAnswer: 'Runs research_task first, then writing_task',
      explanation: 'Process.sequential executes tasks one after another in the order they are defined. The researcher completes their work before the writer begins.',
    },
    {
      id: 'ma-5', type: 'match',
      question: 'Match each multi-agent architecture with its structure:',
      pairs: [
        { left: 'Hierarchical', right: 'Manager delegates to worker agents' },
        { left: 'Flat', right: 'All agents communicate peer-to-peer' },
        { left: 'Circular', right: 'Agents pass work in fixed sequence' },
        { left: 'Group Chat', right: 'All agents see all messages in a shared room' },
      ],
      correctAnswer: 'All matched correctly',
      explanation: 'Different architectures suit different needs: hierarchical for control, flat for collaboration, circular for pipelines, group chat for discussion.',
    },
  ],
}))

export {}
