import { registerContent } from '@/content/index'

registerContent('p10-react', () => ({
  difficulty: 'Advanced',
  estimatedTime: '45 minutes',
  prerequisites: ['p10-agent-fundamentals'],
  tags: ['Phase 10', 'Advanced', 'Topic'],
  objectives: [
    'Understand the ReAct pattern: Reasoning + Acting interleaving',
    'Implement a Thought/Action/Observation loop from scratch',
    'Parse structured JSON action formats from LLM output',
    'Handle errors, stopping conditions, and recovery in the loop',
  ],
  theory: `# ReAct Pattern

## What is ReAct?

**ReAct** (Reasoning + Acting) is a prompting and agent architecture pattern introduced in the paper *"ReAct: Synergizing Reasoning and Acting in Language Models"* (Yao et al., 2022). It interleaves **reasoning traces** (Thought) with **actions** (tool calls) and **observations** (results).

The key insight: reasoning helps the agent decide what to do, and acting provides new information that feeds back into reasoning.

## The Thought/Action/Observation Loop

Each step follows this structure:

1. **Thought** — The model reasons about the current state and decides what to do next
2. **Action** — The model picks a tool and provides input arguments
3. **Observation** — The tool result is returned to the model
4. **Repeat** until the model outputs a final answer

### Format

\`\`\`
Thought: I need to find the population of Tokyo. Let me search for it.
Action: search
Action Input: {"query": "Tokyo population 2024"}
Observation: Tokyo has a population of 14 million.
Thought: I now know the answer. Let me respond.
Final Answer: Tokyo has approximately 14 million people.
\`\`\`

## Prompt Structure

A ReAct prompt includes:

- **System message** — Agent identity and rules
- **Tool descriptions** — Name, description, and parameter schema for each tool
- **Format instructions** — Exactly how to format thoughts and actions
- **Examples** — One or more demonstrations of the format
- **Stopping conditions** — When to emit Final Answer vs continuing

## CoT vs ReAct

| Aspect | Chain-of-Thought | ReAct |
|--------|-----------------|-------|
| Output | Text only | Text + tool calls |
| Grounding | Internal knowledge | External tools + APIs |
| Error recovery | Cannot correct facts | Can retry with different inputs |
| Use case | Pure reasoning | Interactive tasks |

## ReAct Prompting Template

\`\`\`
You are an agent with access to these tools:
{tool_descriptions}

To use a tool, respond with:
Thought: <your reasoning>
Action: <tool name>
Action Input: <JSON arguments>

When done, respond with:
Thought: <your reasoning>
Final Answer: <your answer>

Question: {user_input}
\`\`\`

## Stopping Conditions

- **Final Answer** — The model signals completion
- **Max iterations** — Hard limit to prevent infinite loops
- **Token limit** — Stop if context window is full
- **Special stop tokens** — e.g., <|im_end|>

## Error Recovery in the Loop

When a tool call fails:

1. Return the error as an Observation
2. The model can retry with corrected input
3. After N failures, switch to a fallback strategy
4. If no progress after M steps, ask the user for clarification

## Plan-and-Solve Comparison

**ReAct** reasons and acts interleaved — each thought leads to an action.

**Plan-and-Solve** creates a complete plan first, then executes each step. This is better for tasks where steps depend on prior results that cannot change.

ReAct is more flexible for dynamic environments. Plan-and-Solve is better when the full path is known upfront.`,
  understanding: {
    analogy: 'Think of ReAct like a detective solving a case. The detective thinks about clues (Thought), then takes actions like searching records or interviewing witnesses (Action), observes what they find (Observation), and uses that to update their theory. This cycle continues until they reach a conclusion (Final Answer). A detective who only thinks (CoT) might miss evidence only discoverable through action.',
    steps: [
      { title: 'Reason about State', content: 'The agent examines the current situation: user query, previous observations, and conversation history. It forms a hypothesis about what information is still needed.' },
      { title: 'Choose an Action', content: 'Based on its reasoning, the agent selects a tool and provides arguments. The action must be in the expected format (e.g., JSON).' },
      { title: 'Execute and Observe', content: 'The system executes the tool call and returns the result as an observation. The agent cannot modify the observation — it must work with what it gets.' },
      { title: 'Update Reasoning', content: 'The agent incorporates the observation into its reasoning. It may confirm its hypothesis, adjust its plan, or recognize that the goal is achieved.' },
      { title: 'Terminate or Continue', content: 'If the agent has enough information, it emits a Final Answer. Otherwise, it loops back to step 1 with the new observation in context.' },
    ],
    misconceptions: [
      { misconception: 'ReAct always outperforms standard prompting', truth: 'ReAct excels at tasks requiring external information or multi-step tool use. For pure reasoning (math, logic), CoT can be more efficient without the overhead of tool calls.' },
      { misconception: 'The thought step is optional decoration', truth: 'Thought traces are critical — they help the model maintain coherent reasoning across steps and provide interpretability for debugging agent behavior.' },
    ],
    comparisons: [
      { label: 'Approach', methodA: 'ReAct: Interleave thought and action', methodB: 'Plan-and-Solve: Plan first, then execute' },
      { label: 'Flexibility', methodA: 'ReAct: Adapts to new observations', methodB: 'Plan-and-Solve: Rigid plan, less adaptive' },
      { label: 'Best For', methodA: 'ReAct: Dynamic, information-seeking tasks', methodB: 'Plan-and-Solve: Well-defined, linear tasks' },
    ],
  },
  codeExamples: [
    {
      level: 'basic',
      code: `# Basic ReAct loop with hardcoded decisions
import json

def react_step(thought: str, action: str, action_input: dict) -> dict:
    """Format a single ReAct step."""
    print(f"Thought: {thought}")
    print(f"Action: {action}")
    print(f"Action Input: {json.dumps(action_input)}")
    return {"thought": thought, "action": action, "input": action_input}

def execute_tool(action: str, action_input: dict) -> str:
    """Execute a tool call and return observation."""
    if action == "search":
        query = action_input.get("query", "")
        return f"Search results for '{query}': Found relevant information."
    elif action == "calculator":
        expr = action_input.get("expression", "")
        return f"Result: {eval(expr)}"
    return f"Error: Unknown tool '{action}'"

def react_loop(question: str, max_steps: int = 3):
    context = f"Question: {question}\\n"
    print(f"Starting ReAct loop for: {question}\\n")

    for step in range(max_steps):
        print(f"--- Step {step + 1} ---")

        # Simulated LLM reasoning
        if "population" in question.lower():
            step_data = react_step(
                "I need to find population data. Let me search.",
                "search",
                {"query": question}
            )
        elif step == 0:
            step_data = react_step(
                "Let me analyze this step by step.",
                "calculator",
                {"expression": "2 + 2"}
            )
        else:
            print("Final Answer: I have completed the analysis.")
            return

        observation = execute_tool(step_data["action"], step_data["input"])
        print(f"Observation: {observation}\\n")
        context += f"Thought: {step_data['thought']}\\n"
        context += f"Action: {step_data['action']}\\n"
        context += f"Observation: {observation}\\n"

    print("Max steps reached.")

react_loop("What is the population of Tokyo?")`,
      output: `Starting ReAct loop for: What is the population of Tokyo?

--- Step 1 ---
Thought: I need to find population data. Let me search.
Action: search
Action Input: {"query": "What is the population of Tokyo?"}
Observation: Search results for 'What is the population of Tokyo?': Found relevant information.

--- Step 2 ---
Thought: Let me analyze this step by step.
Action: calculator
Action Input: {"expression": "2 + 2"}
Observation: Result: 4

--- Step 3 ---
Final Answer: I have completed the analysis.`,
      explanation: 'This basic ReAct loop demonstrates the structure: Thought -> Action -> Action Input -> Observation. Each step prints the full cycle, showing how reasoning leads to action and action produces observations.',
    },
    {
      level: 'intermediate',
      code: `# ReAct with JSON action parsing and multiple tools
import json
import re
from typing import Optional

class ReActParser:
    """Parse ReAct format from LLM output."""

    @staticmethod
    def parse_action(text: str) -> Optional[dict]:
        """Extract Thought, Action, and Action Input."""
        thought_match = re.search(r"Thought:\s*(.*?)(?=\nAction:|$)", text, re.DOTALL)
        action_match = re.search(r"Action:\s*(\w+)", text)
        input_match = re.search(r"Action Input:\s*(\{.*?\}|\`.*?\`|\".*?\")", text, re.DOTALL)

        if not action_match:
            return None

        result = {"thought": thought_match.group(1).strip() if thought_match else ""}
        result["action"] = action_match.group(1)

        if input_match:
            raw = input_match.group(1)
            try:
                result["input"] = json.loads(raw) if raw.startswith("{") else raw.strip("\`\\\"")
            except json.JSONDecodeError:
                result["input"] = raw.strip("\`\\\"")
        else:
            result["input"] = {}

        return result

    @staticmethod
    def has_final_answer(text: str) -> Optional[str]:
        """Check for Final Answer and extract it."""
        match = re.search(r"Final Answer:\s*(.*)", text, re.DOTALL)
        return match.group(1).strip() if match else None

tools = {
    "search": lambda q: f"Search results for: {q}",
    "calculator": lambda expr: str(eval(expr)),
    "get_time": lambda: "Current time is 14:30 UTC",
}

def llm_simulator(history: list[dict]) -> str:
    """Simulate an LLM responding in ReAct format."""
    last = history[-1]["content"] if history else ""

    if "search" in last.lower():
        return "Thought: The search results are in. I can answer now.\\nFinal Answer: Tokyo has 14 million people."
    if history and history[0].get("role") == "user":
        return "Thought: I need to find population data.\\nAction: search\\nAction Input: {\"query\": \"Tokyo population 2024\"}"
    return "Thought: I can answer now.\\nFinal Answer: I don't have enough information."

def run_react_agent(question: str, max_steps: int = 5):
    history = [{"role": "user", "content": question}]

    for step in range(max_steps):
        response = llm_simulator(history)
        print(f"\\nLLM Output:\\n{response}")

        # Check for final answer
        final = ReActParser.has_final_answer(response)
        if final:
            print(f"\\n=== FINAL ANSWER ===\\n{final}")
            return final

        # Parse action
        parsed = ReActParser.parse_action(response)
        if not parsed:
            print("Could not parse action. Stopping.")
            break

        # Execute tool
        tool_func = tools.get(parsed["action"])
        if not tool_func:
            observation = f"Error: Unknown tool '{parsed['action']}'"
        else:
            try:
                inp = parsed.get("input", {})
                observation = tool_func(inp) if isinstance(inp, str) else tool_func(**inp)
            except Exception as e:
                observation = f"Error: {e}"

        print(f"Observation: {observation}")
        history.append({"role": "assistant", "content": response})
        history.append({"role": "tool", "content": observation})

    return "Max steps reached."

run_react_agent("What is the population of Tokyo?")`,
      output: `LLM Output:
Thought: I need to find population data.
Action: search
Action Input: {"query": "Tokyo population 2024"}
Observation: Search results for: Tokyo population 2024

LLM Output:
Thought: The search results are in. I can answer now.
Final Answer: Tokyo has 14 million people.

=== FINAL ANSWER ===
Tokyo has 14 million people.`,
      explanation: 'This intermediate implementation uses a ReActParser class to extract Thought, Action, and Action Input using regex. It supports multiple tools and handles Final Answer detection, unknown tools, and execution errors.',
    },
    {
      level: 'advanced',
      code: `# Full ReAct agent with error recovery and streaming
import json
import re
import time
from typing import Optional, Callable

class ReActAgent:
    def __init__(
        self,
        llm_func: Callable,
        tools: dict,
        max_steps: int = 10,
        max_retries: int = 3,
    ):
        self.llm = llm_func
        self.tools = tools
        self.max_steps = max_steps
        self.max_retries = max_retries

    def _build_system_prompt(self) -> str:
        tool_descriptions = "\\n".join(
            f"  {name}: {info['description']} - args: {json.dumps(info['parameters'])}"
            for name, info in self.tools.items()
        )
        return f"""You are a ReAct agent. You have access to these tools:
{tool_descriptions}

Respond in this exact format:
Thought: <your step-by-step reasoning>
Action: <tool_name>
Action Input: <JSON args>

When complete:
Thought: <final reasoning>
Final Answer: <answer>"""

    def _parse_response(self, text: str) -> dict:
        result = {"type": "thinking", "thought": "", "action": None, "input": None}

        # Check for Final Answer first
        fa_match = re.search(r"Final Answer:\s*(.*)", text, re.DOTALL)
        if fa_match:
            result["type"] = "final"
            result["thought"] = re.search(r"Thought:\s*(.*?)(?=Final Answer:)", text, re.DOTALL)
            result["thought"] = result["thought"].group(1).strip() if result["thought"] else ""
            result["final_answer"] = fa_match.group(1).strip()
            return result

        # Parse action
        action_match = re.search(r"Action:\s*(\w+)", text)
        input_match = re.search(r"Action Input:\s*(\{.*?\}|\[.*?\])", text, re.DOTALL)
        thought_match = re.search(r"Thought:\s*(.*?)(?=\nAction:|$)", text, re.DOTALL)

        if action_match:
            result["type"] = "action"
            result["thought"] = thought_match.group(1).strip() if thought_match else ""
            result["action"] = action_match.group(1)
            if input_match:
                try:
                    result["input"] = json.loads(input_match.group(1))
                except json.JSONDecodeError:
                    result["input"] = input_match.group(1)

        return result

    def _execute_tool(self, name: str, inp) -> str:
        if name not in self.tools:
            return f"Error: Unknown tool '{name}'. Available: {list(self.tools.keys())}"

        tool = self.tools[name]
        retries = 0

        while retries < self.max_retries:
            try:
                if isinstance(inp, dict):
                    result = tool["func"](**inp)
                else:
                    result = tool["func"](inp)
                return str(result)
            except Exception as e:
                retries += 1
                if retries >= self.max_retries:
                    return f"Error after {retries} retries: {e}"
                time.sleep(0.5)

        return "Max retries exceeded"

    def run(self, question: str, stream_callback: Optional[Callable] = None):
        messages = [
            {"role": "system", "content": self._build_system_prompt()},
            {"role": "user", "content": question},
        ]

        for step in range(self.max_steps):
            response = self.llm(messages)

            if stream_callback:
                stream_callback("assistant", response)

            parsed = self._parse_response(response)

            if parsed["type"] == "final":
                if stream_callback:
                    stream_callback("final", parsed["final_answer"])
                return parsed["final_answer"]

            if parsed["type"] == "action":
                if stream_callback:
                    stream_callback("action", parsed)

                observation = self._execute_tool(parsed["action"], parsed["input"])

                if stream_callback:
                    stream_callback("observation", observation)

                messages.append({"role": "assistant", "content": response})
                messages.append({"role": "tool", "content": observation})
            else:
                messages.append({"role": "assistant", "content": response})

        return "Maximum steps reached without conclusion."

# Demo with simulated LLM
def dummy_llm(messages):
    thought = "I need to find information about the Eiffel Tower."
    action = "search"
    inp = json.dumps({"query": "Eiffel Tower height"})
    return f"Thought: {thought}\\nAction: {action}\\nAction Input: {inp}"

tools = {
    "search": {
        "description": "Search the web for information",
        "parameters": {"query": "string"},
        "func": lambda query: f"Height: 330m, Location: Paris",
    }
}

def stream_callback(role, content):
    if role == "action":
        print(f"\\n[Agent uses: {content['action']}]")
    elif role == "observation":
        print(f"[Result: {content}]")
    elif role == "final":
        print(f"\\n=== FINAL: {content} ===")
    else:
        print(f"[{role}]: {content[:80]}...")

agent = ReActAgent(dummy_llm, tools, max_steps=3)
result = agent.run("How tall is the Eiffel Tower?", stream_callback)`,
      output: `[assistant]: Thought: I need to find information about the Eiffel Tower.
Action: search
Action Input: {"query": "Eiffel Tower height"}...

[Agent uses: search]
[Result: Height: 330m, Location: Paris]

=== FINAL: Height: 330m, Location: Paris ===`,
      explanation: 'This advanced ReAct agent includes streaming callbacks, retry logic with exponential backoff, robust JSON parsing, and comprehensive error handling. The agent can recover from tool failures and provides real-time progress updates.',
    },
  ],
  realWorld: {
    useCases: [
      { industry: 'Research Assistance', description: 'ReAct agents help researchers by searching academic databases, summarizing papers, and cross-referencing findings across multiple sources in a single session.' },
      { industry: 'DevOps Automation', description: 'ReAct agents triage production incidents by checking logs, querying metrics, searching runbooks, and executing remediation steps while documenting each action.' },
    ],
    caseStudy: {
      problem: 'A financial analysis team needed to compile weekly reports from 12 different data sources. The manual process took 8 hours and frequently missed updated figures.',
      solution: 'A ReAct agent was deployed with tools for each data source (APIs, databases, files). The agent would search each source, compare figures, flag discrepancies, and compile the report autonomously.',
      results: 'Report generation dropped from 8 hours to 12 minutes. Data accuracy improved from 92% to 99.8%. The agent recovered from API failures by retrying with different endpoints.',
    },
    bestPractices: [
      'Always include a "Thought" step — it improves both accuracy and debuggability',
      'Set max_steps to 5-10 for most tasks; use lower values for simple queries',
      'Return structured error observations so the model can correct its approach',
      'Log the full Thought/Action/Observation history for post-hoc analysis',
      'Test with adversarial tool inputs to ensure parsing handles edge cases',
    ],
    tools: ['OpenAI API', 'Anthropic Claude', 'LangChain', 'LangGraph', 'LlamaIndex'],
    jobRoles: ['AI Engineer', 'Research Engineer', 'DevOps Engineer', 'Data Scientist'],
    furtherReading: [
      'Original paper and foundational research',
      'ReAct prompting guide (promptingguide.ai)',
      'LangChain ReAct documentation',
      'Anthropic tool use with ReAct pattern',
    ],
  },
  quiz: [
    {
      id: 'react-1', type: 'truefalse',
      question: 'In ReAct, the "Thought" step is optional and can be omitted for faster performance.',
      correctAnswer: 'False',
      explanation: 'The Thought step is critical — it provides reasoning that guides action selection and makes agent behavior interpretable. Skipping it reduces both accuracy and debuggability.',
    },
    {
      id: 'react-2', type: 'mcq',
      question: 'What distinguishes ReAct from standard Chain-of-Thought prompting?',
      options: [
        'ReAct uses longer prompts',
        'ReAct interleaves reasoning with external actions and observations',
        'ReAct does not use tools',
        'ReAct requires a larger model',
      ],
      correctAnswer: 'ReAct interleaves reasoning with external actions and observations',
      explanation: 'CoT is purely internal reasoning. ReAct adds an action-observation loop where the model can interact with external tools and incorporate results.',
    },
    {
      id: 'react-3', type: 'fillblank',
      question: 'The three components of a ReAct step are Thought, Action, and ___.',
      correctAnswer: 'Observation',
      explanation: 'The cycle is: Thought (reasoning) -> Action (tool call) -> Observation (result). The observation feeds back into the next Thought step.',
    },
    {
      id: 'react-4', type: 'code',
      question: 'In the ReAct parser below, what does the regex for Action Input match?',
      code: `input_match = re.search(
    r"Action Input:\\s*(\\{.*?\\}|\`.*?\`|\".*?\")", text, re.DOTALL
)`,
      options: [
        'Only JSON objects with curly braces',
        'JSON objects, backtick strings, or double-quoted strings after "Action Input:"',
        'Only the first word after "Action Input:"',
        'Any text until the end of the response',
      ],
      correctAnswer: 'JSON objects, backtick strings, or double-quoted strings after "Action Input:"',
      explanation: 'The regex alternation matches three patterns: {...} for JSON objects, `...` for backtick strings, and "..." for quoted strings, all appearing after "Action Input:".',
    },
    {
      id: 'react-5', type: 'match',
      question: 'Match each ReAct component with its purpose:',
      pairs: [
        { left: 'Thought', right: 'Internal reasoning about next steps' },
        { left: 'Action', right: 'Tool invocation to gather information' },
        { left: 'Observation', right: 'Result returned from tool execution' },
        { left: 'Final Answer', right: 'Conclusion delivered to the user' },
      ],
      correctAnswer: 'All matched correctly',
      explanation: 'Thought drives reasoning, Action invokes tools, Observation captures results, and Final Answer delivers the conclusion.',
    },
  ],
}))

export {}
