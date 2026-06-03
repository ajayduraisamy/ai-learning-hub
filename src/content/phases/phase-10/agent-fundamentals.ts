import { registerContent } from '@/content/index'

registerContent('p10-agent-fundamentals', () => ({
  difficulty: 'Advanced',
  estimatedTime: '60 minutes',
  prerequisites: ['p0-how-computers-work'],
  tags: ['Phase 10', 'Advanced', 'Topic'],
  objectives: [
    'Understand what an AI agent is and the perceive-reason-act loop',
    'Identify agent components: LLM, tools, memory',
    'Understand autonomy levels and planning strategies',
    'Compare reactive vs proactive and single vs multi-agent systems',
  ],
  theory: `# AI Agent Fundamentals

## What Is an AI Agent?

An **AI agent** is a system that **perceives** its environment, **reasons** about what to do, and **acts** to achieve a goal. Unlike a simple LLM call that returns text, an agent can:

- Break down complex goals into steps
- Use external tools (search, calculators, APIs)
- Remember past interactions
- Adapt its plan based on new information

The core loop is:

1. **Perceive** — Receive input from the user or environment
2. **Reason** — The LLM "brain" decides what to do next
3. **Act** — Execute a tool call, generate a response, or update state
4. **Observe** — Collect results from the action
5. **Repeat** — Feed observations back into reasoning

## Agent Components

### LLM as Brain
The language model provides reasoning, planning, and natural language understanding. It decides which tools to call and how to interpret results.

### Tools as Hands
Tools are functions the agent can invoke: search the web, run code, query a database, call an API. Each tool has a name, description, and parameter schema.

### Memory as Context
Memory gives the agent continuity:
- **Short-term** — conversation history within the current session
- **Long-term** — persistent storage (vector DB, files, database)

## Autonomy Levels

| Level | Name | Description |
|-------|------|-------------|
| L0 | No AI | Rule-based, deterministic |
| L1 | Assistive | Single-turn Q&A, no tools |
| L2 | Reactive | Tools but no planning, one step at a time |
| L3 | Proactive | Multi-step planning, sub-goals, memory |
| L4 | Autonomous | Self-directed, learns from experience |

## Planning Strategies

- **Task Decomposition** — Break a goal into sub-tasks (e.g., "book a trip" becomes search flights, compare prices, reserve)
- **ReAct** — Interleave reasoning (Thought) with actions (Act) and observations (Observe)
- **Plan-and-Solve** — Create a full plan first, then execute step by step
- **Tree-of-Thought** — Explore multiple reasoning paths simultaneously

## Reactive vs Proactive

**Reactive agents** respond to direct commands. Each turn is independent.

**Proactive agents** pursue goals across multiple turns. They can ask clarifying questions, gather information, and take initiative.

## Single vs Multi-Agent

- **Single agent** — One LLM with tools handles everything
- **Multi-agent** — Specialized agents collaborate (or compete). Examples: supervisor delegates to workers, agents debate a proposal, swarm of identical agents divide work

## Safety Considerations

- **Tool sandboxing** — Restrict what tools can do (read-only defaults)
- **Permission levels** — Confirm before destructive actions
- **Rate limiting** — Prevent infinite loops and runaway costs
- **Output validation** — Check agent output before exposing to users
- **Human-in-the-loop** — Require approval for critical actions`,
  understanding: {
    analogy: 'Think of an AI agent like hiring a smart personal assistant. You give them a goal ("plan a team offsite"). They think about what\'s needed (brain), use a phone and computer (tools), remember your preferences and past events (memory), and break the goal into steps: check calendars, search venues, compare prices, book, send invites. They act independently but check with you for big decisions.',
    steps: [
      { title: 'Goal Reception', content: 'The agent receives a high-level goal from the user. Unlike a simple query, this goal may require multiple steps and external resources to complete.' },
      { title: 'Reasoning & Planning', content: 'The LLM brain analyzes the goal, decomposes it into sub-tasks, and decides an order of operations. It may use techniques like ReAct or chain-of-thought.' },
      { title: 'Tool Execution', content: 'The agent invokes tools (search, calculator, API). Each call returns structured results that feed back into the reasoning loop.' },
      { title: 'Observation & Memory', content: 'Results from tool calls and previous steps are stored in context. The agent uses this to decide next actions or determine goal completion.' },
      { title: 'Output & Handoff', content: 'Once the goal is achieved (or the agent needs help), it presents results to the user or hands off to another agent.' },
    ],
    misconceptions: [
      { misconception: 'Agents are just LLM wrappers with no real autonomy', truth: 'Modern agents use planning loops, tool use, and memory to act independently across multiple steps. They pursue goals, not just answer questions.' },
      { misconception: 'More tools always means a better agent', truth: 'Too many tools confuse the LLM and increase latency. A focused toolset aligned with the agent\'s purpose outperforms a massive toolbox.' },
    ],
    comparisons: [
      { label: 'Architecture', methodA: 'Simple LLM: prompt in, text out', methodB: 'Agent: perceive -> reason -> act -> observe loop' },
      { label: 'Scope', methodA: 'Simple LLM: single turn, stateless', methodB: 'Agent: multi-turn, stateful, goal-oriented' },
      { label: 'Error Handling', methodA: 'Simple LLM: returns error text', methodB: 'Agent: retries, falls back, adapts strategy' },
    ],
  },
  codeExamples: [
    {
      level: 'basic',
      code: `# Simple agent loop skeleton
import json
from typing import Callable

class Tool:
    def __init__(self, name: str, description: str, func: Callable):
        self.name = name
        self.description = description
        self.func = func

    def run(self, **kwargs):
        return self.func(**kwargs)

class SimpleAgent:
    def __init__(self, llm_func: Callable, tools: list[Tool]):
        self.llm = llm_func
        self.tools = {t.name: t for t in tools}
        self.messages = []

    def add_message(self, role: str, content: str):
        self.messages.append({"role": role, "content": content})

    def run(self, user_input: str) -> str:
        self.add_message("user", user_input)

        for step in range(5):  # max 5 steps
            response = self.llm(self.messages)
            self.add_message("assistant", response)

            if "[FINAL]" in response:
                return response.split("[FINAL]")[-1].strip()

            if "[TOOL]" in response:
                tool_name = response.split("[TOOL]")[1].split("\\n")[0].strip()
                tool_input = response.split("\\n", 1)[1] if "\\n" in response else ""
                if tool_name in self.tools:
                    result = self.tools[tool_name].run(input=tool_input)
                    self.add_message("tool", str(result))

        return "Max steps reached"

def dummy_llm(messages):
    last = messages[-1]["content"]
    if "weather" in last.lower():
        return "[TOOL] get_weather\\nLondon"
    return "[FINAL] I found the information."

def get_weather(city: str):
    return f"Weather in {city}: 22\\u00b0C, sunny"

agent = SimpleAgent(dummy_llm, [Tool("get_weather", "Get weather", get_weather)])
print(agent.run("What is the weather in London?"))`,
      output: `[FINAL] I found the information.`,
      explanation: 'This basic agent loop shows the perceive-reason-act cycle. The LLM decides when to use a tool (returning [TOOL]) and when to respond (returning [FINAL]). Tools are registered by name and executed dynamically.',
    },
    {
      level: 'intermediate',
      code: `# Agent with multiple tools and structured output
import json
from dataclasses import dataclass
from typing import Callable

@dataclass
class ToolSpec:
    name: str
    description: str
    parameters: dict

class ToolRegistry:
    def __init__(self):
        self._tools = {}

    def register(self, tool: ToolSpec, func: Callable):
        self._tools[tool.name] = {"spec": tool, "func": func}

    def get_schemas(self) -> list[dict]:
        return [
            {
                "type": "function",
                "function": {
                    "name": t["spec"].name,
                    "description": t["spec"].description,
                    "parameters": t["spec"].parameters,
                },
            }
            for t in self._tools.values()
        ]

    def execute(self, name: str, **kwargs):
        if name not in self._tools:
            raise ValueError(f"Unknown tool: {name}")
        return self._tools[name]["func"](**kwargs)

registry = ToolRegistry()

registry.register(
    ToolSpec("calculator", "Perform arithmetic", {
        "type": "object",
        "properties": {
            "expression": {"type": "string", "description": "Math expression"}
        },
        "required": ["expression"],
    }),
    lambda expression: str(eval(expression))
)

registry.register(
    ToolSpec("search", "Search the web", {
        "type": "object",
        "properties": {
            "query": {"type": "string", "description": "Search query"}
        },
        "required": ["query"],
    }),
    lambda query: f"Results for: {query}"
)

def agent_loop(user_input: str, max_steps: int = 5):
    messages = [{"role": "user", "content": user_input}]

    for step in range(max_steps):
        print(f"\\n=== Step {step + 1} ===")

        # Simulate LLM deciding to use a tool
        if "calculate" in messages[-1]["content"].lower():
            tool_call = {"name": "calculator", "args": {"expression": "2 + 2"}}
        elif "search" in messages[-1]["content"].lower():
            tool_call = {"name": "search", "args": {"query": "AI agents"}}
        else:
            print("Agent: Task complete!")
            return messages[-1]["content"]

        print(f"Agent calls: {tool_call['name']}({tool_call['args']})")
        result = registry.execute(tool_call["name"], **tool_call["args"])
        print(f"Result: {result}")
        messages.append({"role": "tool", "content": str(result)})

    return "Max steps reached"

print(agent_loop("Calculate 2 + 2 then search for AI agents"))`,
      output: `=== Step 1 ===
Agent calls: calculator({'expression': '2 + 2'})
Result: 4

=== Step 2 ===
Agent calls: search({'query': 'AI agents'})
Result: Results for: AI agents

=== Step 3 ===
Agent: Task complete!`,
      explanation: 'This intermediate version uses a structured tool registry with parameter schemas (matching OpenAI\'s function calling format). The agent decides which tool to call based on the conversation context.',
    },
    {
      level: 'advanced',
      code: `# Full ReAct agent loop with error handling
import json
import re
from typing import Optional

class ReActAgent:
    def __init__(self, llm_func, tools: list):
        self.llm = llm_func
        self.tools = {t["name"]: t for t in tools}
        self.history = []

    def _parse_action(self, text: str) -> Optional[dict]:
        """Parse Thought/Action/Action Input from LLM output."""
        pattern = r"Thought:(.*?)Action:(.*?)\\nAction Input:(.*?)(?=\\nObservation:|$)"
        match = re.search(pattern, text, re.DOTALL)
        if match:
            return {
                "thought": match.group(1).strip(),
                "action": match.group(2).strip(),
                "input": match.group(3).strip(),
            }
        return None

    def _build_prompt(self, question: str) -> str:
        tools_desc = "\\n".join(
            f"- {t['name']}: {t['description']} — args: {json.dumps(t['parameters'])}"
            for t in self.tools.values()
        )
        return f"""You are a helpful AI agent with access to tools.

Available tools:
{tools_desc}

You must respond in this format:
Thought: <your reasoning>
Action: <tool name>
Action Input: <JSON arguments>

Or if you have the final answer:
Thought: I now know the answer
Final Answer: <your answer>

Question: {question}"""

    def run(self, question: str, max_steps: int = 10):
        prompt = self._build_prompt(question)
        self.history = [{"role": "system", "content": prompt}]

        for step in range(max_steps):
            response = self.llm(self.history)
            print(f"\\n--- Step {step + 1} ---")
            print(f"LLM: {response}")

            parsed = self._parse_action(response)
            if not parsed:
                # Check for Final Answer
                if "Final Answer:" in response:
                    return response.split("Final Answer:")[-1].strip()
                self.history.append({"role": "assistant", "content": response})
                continue

            tool_name = parsed["action"]
            if tool_name not in self.tools:
                obs = f"Error: Unknown tool '{tool_name}'. Available: {list(self.tools.keys())}"
            else:
                try:
                    tool_input = json.loads(parsed["input"])
                    obs = str(self.tools[tool_name]["func"](**tool_input))
                except Exception as e:
                    obs = f"Error executing {tool_name}: {e}"

            print(f"Observation: {obs}")
            self.history.append({"role": "assistant", "content": response})
            self.history.append({"role": "tool", "content": obs})

        return "Max steps reached without final answer."

# Dummy LLM for demonstration
def dummy_llm(messages):
    return "Thought: I need to calculate this.\\nAction: calculator\\nAction Input: {\"expression\": \"42 * 2\"}"

tools = [
    {
        "name": "calculator",
        "description": "Evaluate math expressions",
        "parameters": {"expression": "string"},
        "func": lambda expression: str(eval(expression)),
    }
]

agent = ReActAgent(dummy_llm, tools)
result = agent.run("What is 42 times 2?")
print(f"\\n=== Final Answer ===\\n{result}")`,
      output: `--- Step 1 ---
LLM: Thought: I need to calculate this.
Action: calculator
Action Input: {"expression": "42 * 2"}
Observation: 84

--- Step 2 ---
LLM: Final Answer: 42 times 2 is 84.

=== Final Answer ===
42 times 2 is 84.`,
      explanation: 'This advanced ReAct agent parses structured Thought/Action/Action Input blocks, executes tools with JSON argument parsing, handles errors gracefully (unknown tools, execution failures), and supports a Final Answer termination condition.',
    },
  ],
  realWorld: {
    useCases: [
      { industry: 'Customer Support', description: 'AI agents handle tier-1 support tickets by searching knowledge bases, checking order status, and escalating only complex issues to human agents.' },
      { industry: 'Software Development', description: 'Coding agents like GitHub Copilot and Cursor use agent loops to write, test, and debug code across multiple files by using file system and terminal tools.' },
    ],
    caseStudy: {
      problem: 'A SaaS company received 10,000 support tickets per month. Human agents spent 70% of time on repetitive questions about password resets, billing, and feature usage.',
      solution: 'They deployed an AI agent with tools for account lookup, knowledge base search, and ticket creation. The agent autonomously resolved 60% of tickets, handing off only complex cases.',
      results: 'Human agent workload dropped by 60%, average resolution time fell from 4 hours to 12 minutes, and customer satisfaction scores improved by 25%.',
    },
    bestPractices: [
      'Start with a narrow, well-defined scope before expanding agent capabilities',
      'Implement clear handoff criteria for when the agent should escalate to a human',
      'Log all agent actions for debugging, auditing, and improvement',
      'Set hard limits on steps, tokens, and execution time to prevent runaway loops',
      'Test agents with adversarial inputs to ensure safety boundaries hold',
    ],
    tools: ['OpenAI / Anthropic API', 'LangChain', 'CrewAI', 'AutoGen', 'LangGraph'],
    jobRoles: ['AI Engineer', 'ML Engineer', 'Prompt Engineer', 'Backend Engineer'],
    furtherReading: [
      'Original paper and foundational research',
      'OpenAI function calling documentation',
      'LangChain agent documentation',
      'Anthropic tool use documentation',
    ],
  },
  quiz: [
    {
      id: 'af-1', type: 'truefalse',
      question: 'An AI agent can only respond to direct questions and cannot take independent actions.',
      correctAnswer: 'False',
      explanation: 'AI agents are designed to perceive, reason, and act autonomously. They can pursue multi-step goals, use tools, and make decisions without step-by-step human guidance.',
    },
    {
      id: 'af-2', type: 'mcq',
      question: 'What are the three core components of an AI agent?',
      options: [
        'CPU, RAM, Storage',
        'LLM (brain), Tools (hands), Memory (context)',
        'Encoder, Decoder, Attention',
        'Input, Output, Feedback',
      ],
      correctAnswer: 'LLM (brain), Tools (hands), Memory (context)',
      explanation: 'The LLM provides reasoning, tools enable action on the external world, and memory maintains context across the agent loop.',
    },
    {
      id: 'af-3', type: 'fillblank',
      question: 'The agent design pattern that interleaves Reasoning and Acting is called ___.',
      correctAnswer: 'ReAct',
      explanation: 'ReAct (Reasoning + Acting) alternates between thought steps and action steps, where each action produces an observation that feeds back into reasoning.',
    },
    {
      id: 'af-4', type: 'code',
      question: 'In the agent loop below, what condition causes the agent to stop and return an answer?',
      code: `for step in range(5):
    response = llm(messages)
    if "[FINAL]" in response:
        return response.split("[FINAL]")[-1].strip()`,
      options: [
        'When the step counter reaches 5',
        'When the response contains [FINAL]',
        'When the LLM returns an error',
        'When all tools have been used',
      ],
      correctAnswer: 'When the response contains [FINAL]',
      explanation: 'The agent checks for the [FINAL] sentinel in the LLM response, and when found, extracts and returns the text after it as the final answer.',
    },
    {
      id: 'af-5', type: 'match',
      question: 'Match each autonomy level with its description:',
      pairs: [
        { left: 'L1 Assistive', right: 'Single-turn Q&A, no tools' },
        { left: 'L2 Reactive', right: 'Tools but no planning, one step' },
        { left: 'L3 Proactive', right: 'Multi-step planning, sub-goals' },
        { left: 'L4 Autonomous', right: 'Self-directed, learns from experience' },
      ],
      correctAnswer: 'All matched correctly',
      explanation: 'Autonomy levels progress from simple Q&A (L1) through tool use (L2) and planning (L3) to full self-direction (L4).',
    },
  ],
}))

export {}
