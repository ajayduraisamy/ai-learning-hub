import { registerContent } from '@/content/index'

registerContent('p10-tool-use', () => ({
  difficulty: 'Advanced',
  estimatedTime: '45 minutes',
  prerequisites: ['p10-agent-fundamentals'],
  tags: ['Phase 10', 'Advanced', 'Topic'],
  objectives: [
    'Understand OpenAI function calling API and tool schema definition',
    'Implement parallel tool calls and handle tool binding',
    'Use structured output extraction with Pydantic schemas',
    'Apply tool choice modes and security best practices',
  ],
  theory: `# Tool Use & Function Calling

## OpenAI Function Calling API

The OpenAI function calling API allows the model to request tool invocations. The model outputs a structured JSON object describing which function to call and with what arguments — it does not execute the function itself.

### Tool Schema Definition

Each tool is defined by a JSON schema:

\\\`\\\`\\\`json
{
  "type": "function",
  "function": {
    "name": "search",
    "description": "Search the web for information",
    "parameters": {
      "type": "object",
      "properties": {
        "query": {
          "type": "string",
          "description": "The search query"
        }
      },
      "required": ["query"]
    }
  }
}
\\\`\\\`\\\`

### Schema Components

| Field | Description |
|-------|-------------|
| \`name\` | Unique identifier for the tool (used in code) |
| \`description\` | Tells the LLM what the tool does (critical for correct selection) |
| \`parameters\` | JSON Schema describing valid arguments |
| \`strict\` | When true, forces the model to produce schema-compliant JSON |

## Parallel Tool Calls

OpenAI supports calling multiple tools in a single response. The model can output several \`tool_calls\` in one message, each with a unique \`id\`. The caller executes them (potentially in parallel) and returns results.

## Tool Binding

Tool binding connects the schema definition to actual implementation:

1. Define JSON schema for the LLM
2. Parse \`tool_calls\` from the response
3. Dispatch to the appropriate function
4. Return results as \`tool\` role messages

## Tool Choice Modes

| Mode | Behavior |
|------|----------|
| \`auto\` | Model decides whether to call tools |
| \`none\` | Model will never call tools |
| \`required\` | Model must call at least one tool |
| \`{"type": "function", "function": {"name": "..."}}\` | Force a specific tool |

## Tool Chaining

Tools can chain — the output of one tool becomes input to another. For example: \`search_for_papers\` -> \`download_paper\` -> \`summarize_paper\`.

## Security Considerations

- **Sandboxing** — Execute tools in isolated environments (containers, subprocesses)
- **Permission levels** — Read-only vs read-write vs destructive
- **Input validation** — Sanitize all arguments before execution
- **Rate limiting** — Cap tool calls per minute and per session
- **Audit logging** — Log every tool invocation with arguments and results
- **Confirmation gates** — Require human approval for destructive actions`,
  understanding: {
    analogy: 'Giving an LLM tools is like giving someone a Swiss Army knife with clearly labeled tools. Each tool has an instruction card (description) that says what it does and how to use it (parameters). The person (LLM) reads the cards, decides which tool fits the task, and describes exactly how they will use it. You then execute the action and report back what happened.',
    steps: [
      { title: 'Define Tools', content: 'Create JSON schemas for each tool with name, description, and parameter specification. Good descriptions are critical — they are how the LLM knows which tool to pick.' },
      { title: 'Send to LLM', content: 'Include tool schemas in the API call. The LLM analyzes the user query and available tools to decide which to invoke.' },
      { title: 'Parse Tool Calls', content: 'Extract the tool_calls array from the response. Each call has an id, function name, and arguments (as JSON string).' },
      { title: 'Execute Tools', content: 'Dispatch each call to the appropriate function. For parallel calls, use concurrent execution. Collect results as tool messages.' },
      { title: 'Return Results', content: 'Send tool results back to the LLM with the matching tool_call_id. The LLM uses these results to formulate its response or request more tool calls.' },
    ],
    misconceptions: [
      { misconception: 'The LLM executes the tool function itself', truth: 'The LLM only outputs a structured request to call a function. Your application code must execute the function and return the result as a new message.' },
      { misconception: 'Tool descriptions are optional or unimportant', truth: 'Descriptions are the primary way the LLM understands what a tool does. Poor descriptions lead to incorrect tool selection. Invest time in writing clear, specific descriptions.' },
    ],
    comparisons: [
      { label: 'Schema Format', methodA: 'OpenAI: JSON Schema in "function" object', methodB: 'Anthropic: JSON Schema in "input_schema" object' },
      { label: 'Parallel Calls', methodA: 'OpenAI: Multiple tool_calls in one response', methodB: 'Anthropic: Multiple tool_use blocks in content' },
      { label: 'Strict Mode', methodA: 'OpenAI: strict: true forces schema compliance', methodB: 'Anthropic: No strict mode, relies on prompting' },
    ],
  },
  codeExamples: [
    {
      level: 'basic',
      code: `# OpenAI function calling basics
import json
from openai import OpenAI

client = OpenAI()

# Define tools
tools = [
    {
        "type": "function",
        "function": {
            "name": "get_weather",
            "description": "Get the current weather for a city",
            "parameters": {
                "type": "object",
                "properties": {
                    "location": {
                        "type": "string",
                        "description": "City name, e.g. London"
                    },
                    "unit": {
                        "type": "string",
                        "enum": ["celsius", "fahrenheit"],
                        "description": "Temperature unit"
                    }
                },
                "required": ["location"],
            },
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_time",
            "description": "Get the current time in a timezone",
            "parameters": {
                "type": "object",
                "properties": {
                    "timezone": {
                        "type": "string",
                        "description": "IANA timezone, e.g. America/New_York"
                    }
                },
                "required": ["timezone"],
            },
        }
    }
]

# Tool implementations
def get_weather(location: str, unit: str = "celsius"):
    return f"Weather in {location}: 22\\u00b0{unit[0].upper()}, partly cloudy"

def get_time(timezone: str):
    return f"Current time in {timezone}: 14:30"

# Map function names to implementations
tool_map = {"get_weather": get_weather, "get_time": get_time}

# Make API call
response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "What is the weather in Tokyo and time in New York?"}],
    tools=tools,
    tool_choice="auto",
)

message = response.choices[0].message

# Execute tool calls
if message.tool_calls:
    for tc in message.tool_calls:
        func_name = tc.function.name
        func_args = json.loads(tc.function.arguments)
        result = tool_map[func_name](**func_args)
        print(f"{func_name}({func_args}) -> {result}")`,
      output: `get_weather({'location': 'Tokyo', 'unit': 'celsius'}) -> Weather in Tokyo: 22°C, partly cloudy
get_time({'timezone': 'America/New_York'}) -> Current time in America/New_York: 14:30`,
      explanation: 'This basic example shows OpenAI function calling with two tools. The schemas define what each tool expects, and the model returns structured tool_calls that we dispatch to actual implementations.',
    },
    {
      level: 'intermediate',
      code: `# Parallel tool calls with Pydantic schemas
import json
from pydantic import BaseModel, Field
from typing import Literal, Optional
from openai import OpenAI

client = OpenAI()

# Pydantic models for tool parameters
class SearchParams(BaseModel):
    query: str = Field(description="The search query")
    max_results: Optional[int] = Field(default=5, description="Number of results")

class CalculatorParams(BaseModel):
    expression: str = Field(description="Math expression to evaluate")
    precision: Optional[int] = Field(default=2, description="Decimal places")

class SendEmailParams(BaseModel):
    to: str = Field(description="Recipient email")
    subject: str = Field(description="Email subject")
    body: str = Field(description="Email body")

# Tool definitions from Pydantic models
def model_to_tool_schema(name: str, description: str, model: type[BaseModel]) -> dict:
    schema = model.model_json_schema()
    return {
        "type": "function",
        "function": {
            "name": name,
            "description": description,
            "parameters": {
                "type": "object",
                "properties": schema["properties"],
                "required": list(schema.get("required", [])),
            },
        },
    }

tools = [
    model_to_tool_schema("search", "Search the web", SearchParams),
    model_to_tool_schema("calculator", "Evaluate math expressions", CalculatorParams),
    model_to_tool_schema("send_email", "Send an email message", SendEmailParams),
]

# Tool implementations
def search(query: str, max_results: int = 5):
    return f"Top {max_results} results for '{query}': [result1, result2, ...]"

def calculator(expression: str, precision: int = 2):
    return f"Result: {round(eval(expression), precision)}"

def send_email(to: str, subject: str, body: str):
    return f"Email sent to {to} with subject '{subject}'"

tool_map = {"search": search, "calculator": calculator, "send_email": send_email}

# Parallel tool call example
response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{
        "role": "user",
        "content": "Search for AI news, calculate 2^10, and email results to test@example.com"
    }],
    tools=tools,
    parallel_tool_calls=True,
)

message = response.choices[0].message
print(f"Model made {len(message.tool_calls)} parallel call(s):\\n")

results = []
for tc in message.tool_calls:
    func_name = tc.function.name
    func_args = json.loads(tc.function.arguments)
    result = tool_map[func_name](**func_args)
    print(f"  [{tc.id}] {func_name}({func_args})")
    print(f"    -> {result}")
    results.append({"role": "tool", "tool_call_id": tc.id, "content": result})`,
      output: `Model made 3 parallel call(s):

  [call_abc] search({'query': 'AI news', 'max_results': 5})
    -> Top 5 results for 'AI news': [result1, result2, ...]
  [call_def] calculator({'expression': '2**10', 'precision': 2})
    -> Result: 1024
  [call_ghi] send_email({'to': 'test@example.com', 'subject': 'AI News Results', 'body': '...'})
    -> Email sent to test@example.com with subject 'AI News Results'`,
      explanation: 'This intermediate example demonstrates parallel tool calls using Pydantic models for schema definitions. The model can request multiple independent tool calls simultaneously, which can be executed concurrently for efficiency.',
    },
    {
      level: 'advanced',
      code: `# Custom tool wrapper with validation, retry, and logging
import json
import time
import functools
from dataclasses import dataclass, field
from typing import Any, Callable, Optional
from enum import Enum

class PermissionLevel(Enum):
    READ = "read"
    WRITE = "write"
    DESTRUCTIVE = "destructive"

@dataclass
class Tool:
    name: str
    description: str
    parameters: dict
    func: Callable
    permission: PermissionLevel = PermissionLevel.READ
    max_retries: int = 2
    timeout: float = 30.0
    audit_log: list = field(default_factory=list)

    def execute(self, **kwargs) -> dict:
        """Execute with validation, retry, and audit logging."""
        start = time.time()
        errors = []

        for attempt in range(self.max_retries + 1):
            try:
                self._validate_args(kwargs)
                result = self.func(**kwargs)
                elapsed = time.time() - start

                entry = {
                    "tool": self.name,
                    "args": kwargs,
                    "success": True,
                    "elapsed": round(elapsed, 3),
                    "permission": self.permission.value,
                }
                self.audit_log.append(entry)

                return {"success": True, "result": result, "elapsed": elapsed}

            except Exception as e:
                errors.append(str(e))
                if attempt < self.max_retries:
                    time.sleep(0.5 * (attempt + 1))
                continue

        elapsed = time.time() - start
        self.audit_log.append({
            "tool": self.name,
            "args": kwargs,
            "success": False,
            "errors": errors,
            "elapsed": round(elapsed, 3),
        })

        return {"success": False, "errors": errors, "elapsed": elapsed}

    def _validate_args(self, kwargs: dict):
        """Validate arguments against JSON schema."""
        props = self.parameters.get("properties", {})
        required = self.parameters.get("required", [])

        for req in required:
            if req not in kwargs:
                raise ValueError(f"Missing required argument: {req}")

        for key, value in kwargs.items():
            if key in props:
                prop_type = props[key].get("type")
                if prop_type == "string" and not isinstance(value, str):
                    raise TypeError(f"Argument '{key}' should be string, got {type(value).__name__}")
                if prop_type == "integer" and not isinstance(value, int):
                    raise TypeError(f"Argument '{key}' should be integer, got {type(value).__name__}")

class ToolRegistry:
    def __init__(self):
        self.tools: dict[str, Tool] = {}

    def register(self, tool: Tool):
        self.tools[tool.name] = tool

    def get_schemas(self) -> list[dict]:
        return [
            {
                "type": "function",
                "function": {
                    "name": t.name,
                    "description": t.description,
                    "parameters": {
                        "type": "object",
                        "properties": t.parameters.get("properties", {}),
                        "required": t.parameters.get("required", []),
                    },
                },
            }
            for t in self.tools.values()
        ]

    def execute(self, name: str, arguments: dict) -> dict:
        if name not in self.tools:
            return {"success": False, "errors": [f"Unknown tool: {name}"]}
        return self.tools[name].execute(**arguments)

    def get_audit_log(self) -> list[dict]:
        log = []
        for tool in self.tools.values():
            log.extend(tool.audit_log)
        return sorted(log, key=lambda x: x.get("elapsed", 0))

# Usage example
registry = ToolRegistry()

registry.register(Tool(
    name="read_file",
    description="Read contents of a file",
    parameters={
        "properties": {"path": {"type": "string", "description": "File path"}},
        "required": ["path"],
    },
    func=lambda path: f"Contents of {path}: Hello World",
    permission=PermissionLevel.READ,
))

registry.register(Tool(
    name="delete_file",
    description="Permanently delete a file",
    parameters={
        "properties": {"path": {"type": "string", "description": "File path"}},
        "required": ["path"],
    },
    func=lambda path: f"Deleted {path}",
    permission=PermissionLevel.DESTRUCTIVE,
    max_retries=0,
))

# Execute tools
result1 = registry.execute("read_file", {"path": "test.txt"})
print(f"Read result: {result1}")

result2 = registry.execute("delete_file", {"path": "test.txt"})
print(f"Delete result: {result2}")

print(f"\\nAudit log: {json.dumps(registry.get_audit_log(), indent=2)}")`,
      output: `Read result: {'success': True, 'result': 'Contents of test.txt: Hello World', 'elapsed': 0.0}
Delete result: {'success': True, 'result': 'Deleted test.txt', 'elapsed': 0.0}

Audit log: [
  {
    "tool": "read_file",
    "args": {"path": "test.txt"},
    "success": true,
    "elapsed": 0.0,
    "permission": "read"
  },
  {
    "tool": "delete_file",
    "args": {"path": "test.txt"},
    "success": true,
    "elapsed": 0.0,
    "permission": "destructive"
  }
]`,
      explanation: 'This advanced tool wrapper includes argument validation against JSON schema, retry logic with exponential backoff, permission levels (read/write/destructive), timeout tracking, and automatic audit logging for every invocation.',
    },
  ],
  realWorld: {
    useCases: [
      { industry: 'Data Engineering', description: 'Tool-calling agents connect to databases, run SQL queries, transform data with Pandas, and generate visualizations — all through structured function calls.' },
      { industry: 'Healthcare', description: 'HIPAA-compliant agents use tools to access patient records, check drug interactions, schedule appointments, and generate clinical notes with strict audit trails.' },
    ],
    caseStudy: {
      problem: 'A financial services company needed to automate quarterly compliance reporting. Engineers spent 40 hours each quarter extracting data from 6 systems, running calculations, and formatting reports.',
      solution: 'They deployed an agent with 12 tools: database query, spreadsheet operations, PDF generation, email dispatch, and compliance rule checking. Each tool had strict parameter validation and audit logging.',
      results: 'Report generation dropped to 2 hours. Audit logs provided complete traceability for regulators. Error rate fell from 8% to 0.5%. The permission system prevented unauthorized data access.',
    },
    bestPractices: [
      'Write clear tool descriptions — the LLM relies on them to choose correctly',
      'Use strict mode (strict: true) for reliable JSON output',
      'Always validate and sanitize tool arguments before execution',
      'Implement rate limiting to prevent runaway costs from tool loops',
      'Log every tool invocation with full arguments and results for debugging',
    ],
    tools: ['OpenAI API', 'Anthropic Claude', 'LangChain', 'Pydantic', 'FastAPI'],
    jobRoles: ['AI Engineer', 'Backend Engineer', 'Platform Engineer', 'Security Engineer'],
    furtherReading: [
      'Original paper and foundational research',
      'OpenAI function calling documentation',
      'Anthropic tool use documentation',
      'JSON Schema specification',
    ],
  },
  quiz: [
    {
      id: 'tu-1', type: 'truefalse',
      question: 'When using OpenAI function calling, the LLM executes the function and returns the result.',
      correctAnswer: 'False',
      explanation: 'The LLM only outputs a structured request to call a function. Your application code must execute the function and return the result as a new message with role "tool".',
    },
    {
      id: 'tu-2', type: 'mcq',
      question: 'What does tool_choice="required" do?',
      options: [
        'Forces the model to call at least one tool',
        'Prevents the model from calling tools',
        'Lets the model decide whether to use tools',
        'Makes all tool descriptions required reading',
      ],
      correctAnswer: 'Forces the model to call at least one tool',
      explanation: 'tool_choice="required" ensures the model always returns a tool call. This is useful when you know a tool must be invoked for every request.',
    },
    {
      id: 'tu-3', type: 'fillblank',
      question: 'Pydantic\'s ___ method generates a JSON schema from a BaseModel class.',
      correctAnswer: 'model_json_schema()',
      explanation: 'model_json_schema() converts a Pydantic model\'s type annotations and Field definitions into a JSON Schema object suitable for tool parameter definitions.',
    },
    {
      id: 'tu-4', type: 'code',
      question: 'What does this tool schema tell the model?',
      code: `{
  "type": "function",
  "function": {
    "name": "send_email",
    "description": "Send an email",
    "parameters": {
      "type": "object",
      "properties": {
        "to": {"type": "string"},
        "body": {"type": "string"}
      },
      "required": ["to", "body"]
    }
  }
}`,
      options: [
        'The model can send emails directly',
        'The model can request an email be sent with "to" and "body" arguments',
        'The email function is optional and has no required fields',
        'The model will receive emails from this address',
      ],
      correctAnswer: 'The model can request an email be sent with "to" and "body" arguments',
      explanation: 'The schema defines a function the model can request. The name is "send_email", both "to" and "body" are required string parameters.',
    },
    {
      id: 'tu-5', type: 'match',
      question: 'Match each tool_choice mode with its behavior:',
      pairs: [
        { left: 'auto', right: 'Model decides whether to call tools' },
        { left: 'none', right: 'Model will never call tools' },
        { left: 'required', right: 'Model must call at least one tool' },
        { left: '{"type": "function", ...}', right: 'Force a specific tool by name' },
      ],
      correctAnswer: 'All matched correctly',
      explanation: 'The four modes give different levels of control over tool invocation, from full model choice (auto) to forced specific tool.',
    },
  ],
}))

export {}
