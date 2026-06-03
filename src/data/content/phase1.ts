// Phase 1: Python Deep Dive - Complete Content
// Auto-generated from topic JSON parts

const phase1Content = {
  "p1-async-python": {
    "theory": "Async Python enables concurrent execution of I/O-bound tasks using an event loop that efficiently manages multiple operations without threads. The async/await syntax (introduced in Python 3.5 via PEP 492) provides a cooperative multitasking model where tasks voluntarily yield control at await points. An async function is defined with async def and returns a coroutine object. The await keyword suspends the current coroutine until the awaited awaitable completes.\n\nThe event loop (asyncio.run() in Python 3.7+) is the central coordinator: it maintains a queue of tasks, runs them one at a time, and switches between them at await points. When a coroutine hits await, the event loop can pause it and run another coroutine that's ready. This makes async Python ideal for I/O-bound workloads (web requests, database queries, file operations) where tasks spend most time waiting.\n\nTasks (asyncio.create_task()) schedule coroutines for concurrent execution on the event loop. A task is a wrapper for a coroutine that runs independently. asyncio.gather() runs multiple awaitables concurrently and collects results. asyncio.wait_for() adds timeouts. Async generators (async for) and async context managers (async with) extend the pattern to iteration and resource management.\n\nThe Global Interpreter Lock (GIL) limits CPU-bound parallelism but does NOT limit async concurrency—async tasks voluntarily yield, so they don't contend for the GIL. However, async does not make CPU-bound code faster. For CPU-bound work, use multiprocessing. For I/O-bound work, async or threading. Async shines with thousands of concurrent connections (networking, web servers) where threading would be too heavy.\n\nFor AI/ML work, async is essential for: serving models via web APIs (FastAPI/Quart), concurrent data fetching from multiple sources, streaming inference pipelines, real-time model monitoring dashboards, and parallel I/O for data loading (aiohttp, aiofiles). Async is not useful for GPU-bound training loops (which are CPU/GPU-bound), but is critical for the infrastructure around ML systems.",
    "keyDefinitions": [
      {
        "term": "Coroutine",
        "definition": "An awaitable object returned by an async def function that can be paused and resumed at await points during its execution.",
        "example": "async def fetch(url): data = await http.get(url); return data — returns a coroutine object when called."
      },
      {
        "term": "Event Loop",
        "definition": "The central runtime that schedules and runs asynchronous tasks, managing I/O events and task switching when coroutines await.",
        "example": "asyncio.run(main()) creates and manages an event loop that executes the main() coroutine and all its awaited sub-coroutines."
      },
      {
        "term": "Task",
        "definition": "A wrapper for a coroutine scheduled for concurrent execution on the event loop, created with asyncio.create_task().",
        "example": "task1 = asyncio.create_task(fetch('url1')) schedules fetch('url1') to run concurrently without waiting for it."
      },
      {
        "term": "Awaitable",
        "definition": "An object with an __await__ method that can be used with the await keyword. Coroutines, Tasks, and Futures are the main awaitable types.",
        "example": "await asyncio.sleep(1) — sleep(1) returns a coroutine that is an awaitable; await suspends until complete."
      }
    ],
    "formulas": [
      {
        "title": "Async Concurrency Model",
        "formula": "total_time ~= max(task_times) NOT sum(task_times)",
        "explanation": "For I/O-bound tasks with async, the total time is approximately the maximum of individual task times (since they overlap), not the sum. If three requests each take 1s, async completes all in ~1s, while synchronous takes ~3s.",
        "example": "results = await asyncio.gather(fetch('a'), fetch('b'), fetch('c')) # ~1s total, not ~3s"
      },
      {
        "title": "Event Loop Scheduling",
        "formula": "while tasks_remain:\n    for task in ready:\n        task.step()  # advance until yield/await\n    poll_io_events()",
        "explanation": "The event loop repeatedly iterates over ready tasks, advancing each by one 'step' (up to the next await). When no tasks are ready, it polls for I/O events (network, file descriptors) to unblock waiting tasks.",
        "example": "Each await point is a scheduling opportunity where the event loop can switch to another ready task."
      }
    ],
    "whyItMatters": "Async Python powers the infrastructure layer of ML systems. Model serving with FastAPI handles thousands of concurrent inference requests efficiently. Data pipelines fetch from multiple APIs concurrently. Real-time monitoring dashboards stream metrics via async WebSockets. While the training loop itself is synchronous, the systems around it—data ingestion, model serving, experiment tracking—benefit enormously from async. Understanding async is essential for ML engineers building production systems.",
    "architecture": {
      "title": "Python Async Event Loop Architecture",
      "description": "How asyncio's event loop manages coroutines, I/O, and scheduling.",
      "blocks": [
        {
          "label": "Ready Queue",
          "description": "FIFO queue of tasks that are ready to execute (not awaiting anything)"
        },
        {
          "label": "I/O Wait Queue",
          "description": "Tasks waiting for I/O events (socket readable, file writable) monitored by selector/epoll/kqueue"
        },
        {
          "label": "Timer Heap",
          "description": "Min-heap of tasks waiting on asyncio.sleep() or timeouts, ordered by deadline"
        },
        {
          "label": "Callback Handlers",
          "description": "call_soon(), call_later(), call_at() for scheduling non-coroutine callbacks"
        },
        {
          "label": "I/O Multiplexer (selector)",
          "description": "Platform-specific: selectors.SelectSelector (Windows) selectors.EpollSelector (Linux)"
        }
      ]
    },
    "understanding": {
      "analogy": "Async Python is like a chef cooking multiple dishes at once. A synchronous chef (regular Python) starts dish A, waits for the water to boil (I/O wait), does nothing during that time, then starts dish B after finishing A. An async chef starts dish A, puts water on to boil (await), and instead of staring at the pot, switches to chopping vegetables for dish B (async task). When dish A's water boils, the chef pauses dish B and finishes dish A. The chef (event loop) switches between tasks only at natural pause points (await). This doesn't make the chef faster (same CPU) but gives the appearance of doing many things at once.",
      "steps": [
        {
          "title": "Write Async Functions with async/await",
          "content": "Use async def fetch_data(): ... to define coroutines. Use await for I/O calls: data = await aiohttp.get(url). Call coroutines with await, not directly."
        },
        {
          "title": "Run the Event Loop",
          "content": "Use asyncio.run(main()) as the entry point. This creates and manages the event loop. Never call run() from inside an async function."
        },
        {
          "title": "Create Tasks for Concurrency",
          "content": "Use task = asyncio.create_task(coro()) to schedule concurrent execution. Use asyncio.gather() to run multiple tasks and collect results."
        },
        {
          "title": "Use Async Context Managers and Iterators",
          "content": "Use async with aiohttp.ClientSession() as session: for managed async connections. Use async for data in stream: for async iteration."
        },
        {
          "title": "Handle Timeouts and Cancellation",
          "content": "Use asyncio.wait_for(coro(), timeout=10) for timeouts. Use asyncio.shield() to protect tasks from cancellation. Handle asyncio.CancelledError."
        }
      ],
      "misconceptions": [
        {
          "misconception": "Async Python runs code in parallel across multiple CPU cores.",
          "truth": "Async is single-threaded cooperative concurrency, not parallelism. It handles I/O-bound tasks efficiently by waiting without blocking. For CPU parallelism, use multiprocessing."
        },
        {
          "misconception": "You can call an async function just like a regular function.",
          "truth": "Calling an async function returns a coroutine object—it does NOT execute the function body. You must either await it, pass it to asyncio.run(), or create_task() to execute it."
        }
      ]
    },
    "codeExamples": [
      {
        "level": "basic",
        "code": "# Basic async/await with asyncio\nimport asyncio\n\nasync def say_after(delay, message):\n    await asyncio.sleep(delay)\n    print(message)\n    return message\n\nasync def main():\n    print(f\"Started at {__import__('time').strftime('%X')}\")\n\n    # Sequential execution\n    await say_after(1, \"First\")\n    await say_after(1, \"Second\")\n\n    print(f\"Sequential done at {__import__('time').strftime('%X')}\")\n\n    # Concurrent execution\n    t1 = asyncio.create_task(say_after(1, \"Concurrent A\"))\n    t2 = asyncio.create_task(say_after(1, \"Concurrent B\"))\n    await t1\n    await t2\n\n    print(f\"Concurrent done at {__import__('time').strftime('%X')}\")\n\nasyncio.run(main())",
        "output": "Started at 10:00:00\nFirst\nSecond\nSequential done at 10:00:02\nConcurrent A\nConcurrent B\nConcurrent done at 10:00:03",
        "explanation": "Sequential awaits take 2s total. Concurrent tasks with create_task take 1s total because they run overlapping. asyncio.run() manages the event loop. await suspends the current coroutine."
      },
      {
        "level": "intermediate",
        "code": "# Async gather, timeouts, and error handling\nimport asyncio\nimport aiohttp\n\nasync def fetch_url(session, url, timeout=5):\n    try:\n        async with asyncio.timeout(timeout):\n            async with session.get(url) as response:\n                return url, response.status, len(await response.text())\n    except asyncio.TimeoutError:\n        return url, None, \"TIMEOUT\"\n    except Exception as e:\n        return url, None, str(e)\n\nasync def main():\n    urls = [\n        \"https://httpbin.org/delay/1\",\n        \"https://httpbin.org/delay/2\",\n        \"https://httpbin.org/delay/3\",\n    ]\n\n    async with aiohttp.ClientSession() as session:\n        # Create tasks for all URLs\n        tasks = [fetch_url(session, url) for url in urls]\n\n        # Gather with timeout for entire batch\n        try:\n            results = await asyncio.wait_for(\n                asyncio.gather(*tasks, return_exceptions=True),\n                timeout=10\n            )\n        except asyncio.TimeoutError:\n            print(\"Batch timed out!\")\n            return\n\n        for url, status, info in results:\n            print(f\"{url}: status={status}, info={info}\")\n\nasyncio.run(main())",
        "output": "https://httpbin.org/delay/1: status=200, info=...\nhttps://httpbin.org/delay/2: status=200, info=...\nhttps://httpbin.org/delay/3: status=200, info=...",
        "explanation": "asyncio.gather() runs fetch_url concurrently for all URLs. asyncio.wait_for() adds a batch-level timeout. Individual fetch_url has per-request timeout via async with asyncio.timeout(). return_exceptions=True prevents one failure from failing all."
      },
      {
        "level": "advanced",
        "code": "# Async generators, async context managers, and semaphores\nimport asyncio\nimport asyncio\n\nclass AsyncResource:\n    \"\"\"Async context manager example.\"\"\"\n    async def __aenter__(self):\n        print(\"Acquiring resource...\")\n        await asyncio.sleep(0.5)\n        return self\n\n    async def __aexit__(self, exc_type, exc_val, exc_tb):\n        print(\"Releasing resource...\")\n        await asyncio.sleep(0.3)\n\n    async def work(self, name):\n        print(f\"  {name} using resource\")\n        await asyncio.sleep(1)\n        return f\"{name} done\"\n\n# Async generator (Python 3.6+)\nasync def async_counter(stop):\n    for i in range(stop):\n        await asyncio.sleep(0.1)\n        yield i\n\n# Semaphore for rate limiting\nasync def rate_limited_fetch(semaphore, name, delay):\n    async with semaphore:\n        print(f\"  Starting {name}\")\n        await asyncio.sleep(delay)\n        print(f\"  Finished {name}\")\n        return f\"{name} result\"\n\nasync def main():\n    # Async generator\n    print(\"Async generator:\")\n    async for num in async_counter(5):\n        print(f\"  Received: {num}\")\n\n    # Async context manager\n    print(\"\\nAsync context manager:\")\n    async with AsyncResource() as res:\n        result = await res.work(\"task\")\n        print(f\"  Result: {result}\")\n\n    # Semaphore limiting concurrency\n    print(\"\\nSemaphore (max 2 concurrent):\")\n    sem = asyncio.Semaphore(2)\n    tasks = [\n        asyncio.create_task(rate_limited_fetch(sem, f\"Task {i}\", 1))\n        for i in range(5)\n    ]\n    results = await asyncio.gather(*tasks)\n    print(f\"All results: {results}\")\n\nasyncio.run(main())",
        "output": "Async generator:\n  Received: 0\n  Received: 1\n  Received: 2\n  Received: 3\n  Received: 4\n\nAsync context manager:\nAcquiring resource...\n  task using resource\n  Result: task done\nReleasing resource...\n\nSemaphore (max 2 concurrent):\n  Starting Task 0\n  Starting Task 1\n  Finished Task 0\n  Finished Task 1\n  Starting Task 2\n  Starting Task 3\n  Finished Task 2\n  Starting Task 4\n  Finished Task 3\n  Finished Task 4\nAll results: ['Task 0 result', ...]",
        "explanation": "Async generators (async for) lazily produce values. Async context managers (async with) manage async resource lifecycle. Semaphore (max 2) limits concurrent task execution—tasks are released in batches of 2."
      }
    ],
    "realWorld": {
      "useCases": [
        {
          "industry": "Web APIs / Microservices",
          "description": "FastAPI and Quart serve ML model predictions asynchronously, handling thousands of concurrent inference requests with minimal overhead."
        },
        {
          "industry": "Data Ingestion",
          "description": "Concurrent HTTP requests fetch data from multiple APIs simultaneously. Async database drivers (asyncpg, aiomysql) handle millions of queries efficiently."
        },
        {
          "industry": "Real-Time Monitoring",
          "description": "Async WebSocket servers stream model metrics, training logs, and system health data to dashboards without blocking."
        }
      ],
      "caseStudy": {
        "problem": "A model serving API built with Flask handled 50 concurrent inference requests per second. Increasing throughput required excessive horizontal scaling (15+ instances) due to synchronous request handling blocking on model inference.",
        "solution": "Migrated from Flask to FastAPI with async route handlers. Model inference was wrapped in async using run_in_executor for CPU-bound work. A semaphore limited concurrent inference to GPU memory capacity. Async HTTP client (httpx) fetched preprocessing data concurrently.",
        "results": "Throughput increased from 50 to 2000 requests/second on a single instance. P99 latency dropped from 500ms to 120ms. Instance count reduced from 15 to 3, saving 80% in infrastructure costs."
      },
      "bestPractices": [
        "Use asyncio.run() as the entry point (Python 3.7+)",
        "Use asyncio.gather() for concurrent execution of multiple coroutines",
        "Add timeouts to all async operations to prevent hangs",
        "Use Semaphore for rate limiting concurrent operations",
        "Prefer async libraries (aiohttp, asyncpg, httpx) over sync in async code",
        "Avoid blocking calls (time.sleep(), requests.get()) in async code—use their async equivalents",
        "Use run_in_executor() for CPU-bound tasks in async context"
      ],
      "tools": [
        "asyncio — Standard library for async/await, tasks, event loop, synchronisation primitives",
        "aiohttp — Async HTTP client/server for high-concurrency networking",
        "httpx — Async HTTP client with compatibility with requests API",
        "FastAPI — Modern async web framework with automatic OpenAPI docs",
        "asyncpg — Async PostgreSQL driver with connection pooling",
        "asyncio.run_in_executor — Bridge between async and blocking/CPU-bound code",
        "uvloop — Drop-in replacement for asyncio event loop (2x faster on Linux)"
      ],
      "jobRoles": [
        "Backend Engineer — Builds async APIs and microservices handling high concurrency",
        "ML Engineer — Implements async model serving and data ingestion pipelines",
        "Data Engineer — Creates async ETL pipelines for real-time data processing",
        "Platform Engineer — Develops async infrastructure for distributed ML systems",
        "Full-Stack Engineer — Builds real-time dashboards with async WebSockets"
      ],
      "furtherReading": [
        {
          "title": "PEP 492 — Coroutines with async and await",
          "url": "https://peps.python.org/pep-0492/"
        },
        {
          "title": "asyncio official documentation",
          "url": "https://docs.python.org/3/library/asyncio.html"
        },
        {
          "title": "FastAPI async documentation",
          "url": "https://fastapi.tiangolo.com/async/"
        },
        {
          "title": "Real Python: Async IO in Python",
          "url": "https://realpython.com/async-io-python/"
        }
      ]
    },
    "quiz": [
      {
        "type": "mcq",
        "question": "What does calling an async function return?",
        "options": [
          "The function's result",
          "A coroutine object",
          "A Task object",
          "A Future object"
        ],
        "answer": "A coroutine object"
      },
      {
        "type": "truefalse",
        "question": "Async Python can execute CPU-bound operations in parallel across cores.",
        "answer": "False"
      },
      {
        "type": "fillblank",
        "question": "The function _____ is the recommended entry point for running async code in Python 3.7+.",
        "answer": "asyncio.run()"
      },
      {
        "type": "code",
        "question": "What does asyncio.gather() do?",
        "options": [
          "Runs coroutines sequentially",
          "Runs coroutines concurrently",
          "Creates a new event loop",
          "Cancels all tasks"
        ],
        "answer": "Runs coroutines concurrently"
      },
      {
        "type": "match",
        "question": "Match async concept to description:",
        "pairs": {
          "Coroutine": "Async function that can be suspended",
          "Task": "Scheduled concurrent coroutine",
          "Event Loop": "Central scheduling coordinator",
          "Semaphore": "Limits concurrent access"
        }
      }
    ]
  },
  "p1-comprehensions": {
    "theory": "Comprehensions are concise syntactic constructs in Python for creating sequences and mappings from existing iterables. They provide a functional, declarative alternative to explicit for loops, often producing more readable and faster code. Python supports list comprehensions, dictionary comprehensions, set comprehensions, and generator expressions (using parentheses instead of brackets).\n\nA list comprehension [expression for item in iterable if condition] consists of three parts: the output expression, the input iterable with iteration variable, and an optional filter predicate. Multiple for clauses create nested loops, and multiple if clauses chain conditions. Comprehensions execute at C speed within CPython (the entire expression runs as a single bytecode operation), making them typically faster than manual for loops with .append().\n\nList comprehensions should be used when the goal is to transform or filter a sequence into a new list. They become less readable when the expression is complex or when there are more than two for clauses. For complex transformations, a regular for loop with appropriate comments is preferred.\n\nGenerator expressions produce items lazily—they compute and yield one item at a time as requested. This makes them memory-efficient for large or infinite sequences because they don't build a complete list in memory. Generator expressions are the functional equivalent of generator functions (using yield) but in a single expression. They're commonly used as arguments to functions like sum(), any(), all(), and min()/max().\n\nFor AI/ML work, comprehensions are heavily used for data preprocessing: normalizing feature vectors, filtering outliers, transforming labels, and building lookup dictionaries. Generator expressions help process large datasets that don't fit in memory—for example, reading a large CSV line by line and yielding parsed rows.",
    "keyDefinitions": [
      {
        "term": "List Comprehension",
        "definition": "A concise syntax [expr for var in iterable if cond] that builds a new list by applying an expression to each element, optionally filtering.",
        "example": "[x**2 for x in range(10) if x % 2 == 0] produces [0, 4, 16, 36, 64] (squares of evens)."
      },
      {
        "term": "Generator Expression",
        "definition": "A lazy-evaluated comprehension using parentheses instead of brackets, yielding items one at a time without storing the entire sequence.",
        "example": "sum(x**2 for x in range(10_000_000)) computes sum of squares without a 10M-element list."
      },
      {
        "term": "Dictionary Comprehension",
        "definition": "A comprehension syntax {key_expr: value_expr for var in iterable} that builds a dictionary from an iterable.",
        "example": "{word: len(word) for word in ['apple', 'banana', 'cherry']} produces {'apple': 5, 'banana': 6, 'cherry': 6}."
      },
      {
        "term": "Nested Comprehension",
        "definition": "A comprehension with multiple for clauses creating a Cartesian product or flattening nested structures.",
        "example": "[f'{x},{y}' for x in range(3) for y in range(2)] yields ['0,0', '0,1', '1,0', '1,1', '2,0', '2,1']."
      }
    ],
    "formulas": [
      {
        "title": "List Comprehension as Map-Filter",
        "formula": "[f(x) for x in iterable if p(x)] = map(f, filter(p, iterable))",
        "explanation": "A list comprehension with filter is semantically equivalent to mapping a function over a filtered iterable. Comprehensions are preferred for readability and execute as a single bytecode operation.",
        "example": "[n * 2 for n in range(10) if n > 5] vs list(map(lambda n: n*2, filter(lambda n: n>5, range(10))))"
      },
      {
        "title": "Generator Expression Memory",
        "formula": "memory(gen_expr) = O(1)\nmemory(list_comp) = O(n)",
        "explanation": "Generator expressions use constant memory regardless of input size because they yield one element at a time. List comprehensions use O(n) memory storing all results simultaneously.",
        "example": "sys.getsizeof([x for x in range(10000)]) = 85176 vs sys.getsizeof((x for x in range(10000))) = 208"
      }
    ],
    "whyItMatters": "Comprehensions and generators are fundamental to writing idiomatic, efficient Python for AI/ML. List comprehensions replace verbose training loops for batch preprocessing. Dictionary comprehensions build vocabulary mappings in single lines. Generator expressions enable processing datasets larger than RAM—yielding batches from disk, computing metrics incrementally, and building streaming data pipelines.",
    "understanding": {
      "analogy": "Comprehensions are like assembly lines in a factory. The iterable is a conveyor belt of raw materials. Each for clause adds a processing station. The expression (x**2) is the transformation machine. The if clause is an inspection station removing defective items. List comprehensions package finished products into crates (memory-heavy). Generator expressions are just-in-time manufacturing—each item is made and shipped immediately with no warehouse storage.",
      "steps": [
        {
          "title": "Start with Simple List Comprehensions",
          "content": "Replace result = []; for x in data: result.append(f(x)) with result = [f(x) for x in data]. Add if filter: [f(x) for x in data if x > 0]."
        },
        {
          "title": "Add Multiple Clauses for Nested Iteration",
          "content": "Flatten a matrix: [item for row in matrix for item in row]. The order of for clauses matches regular nested loop order (outer first)."
        },
        {
          "title": "Use Dictionary and Set Comprehensions",
          "content": "Build word->index mapping: {word: i for i, word in enumerate(vocab)}. Filter dict: {k: v for k, v in d.items() if v > 0}. Unique lengths: {len(w) for w in words}."
        },
        {
          "title": "Upgrade to Generator Expressions for Large Data",
          "content": "Replace brackets [] with parentheses () when you don't need all results at once. Use with sum(), any(), all(), min(), max()."
        },
        {
          "title": "Avoid Common Pitfalls",
          "content": "Don't use comprehensions for side effects (use for loop). Don't nest more than 2-3 for clauses. Don't use when expression is too complex."
        }
      ],
      "misconceptions": [
        {
          "misconception": "List comprehensions are always faster than for loops.",
          "truth": "They're generally faster due to C-level execution, but advantage disappears for very complex expressions. Profile before optimizing."
        },
        {
          "misconception": "Generator expressions are always better than list comprehensions.",
          "truth": "Generators save memory but are slower when iterated multiple times (they're consumed after one pass). If you need reuse, use a list."
        }
      ]
    },
    "codeExamples": [
      {
        "level": "basic",
        "code": "# Basic list, dict, and set comprehensions\nnumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]\n\nsquares_even = [n**2 for n in numbers if n % 2 == 0]\nprint(f\"Squares of evens: {squares_even}\")\n\ncubes_odd = {n: n**3 for n in numbers if n % 2 == 1}\nprint(f\"Cubes of odds: {cubes_odd}\")\n\nwords = ['apple', 'banana', 'avocado', 'cherry', 'apricot']\nfirst_letters = {w[0] for w in words}\nprint(f\"Unique first letters: {first_letters}\")\n\nsquares_gen = (n**2 for n in range(5))\nprint(f\"Generator: {list(squares_gen)}\")",
        "output": "Squares of evens: [4, 16, 36, 64, 100]\nCubes of odds: {1: 1, 3: 27, 5: 125, 7: 343, 9: 729}\nUnique first letters: {'b', 'c', 'a'}\nGenerator: [0, 1, 4, 9, 16]",
        "explanation": "List comprehension filters evens and squares. Dict comprehension maps odds to cubes. Set comprehension deduplicates first letters. Generator expression materialized via list()."
      },
      {
        "level": "intermediate",
        "code": "# Nested comprehensions and conditional expressions\nmatrix = [\n    [1, 2, 3],\n    [4, 5, 6],\n    [7, 8, 9]\n]\n\nflattened = [item for row in matrix for item in row]\nprint(f\"Flattened: {flattened}\")\n\ntransposed = [[row[i] for row in matrix] for i in range(3)]\nprint(f\"Transposed: {transposed}\")\n\nlabels = ['cat', 'dog', 'bird', 'fish', 'cat']\nlabel_ids = [0 if l == 'cat' else 1 if l == 'dog' else 2 for l in labels]\nprint(f\"Label IDs: {label_ids}\")\n\nscores = {'Alice': 88, 'Bob': 42, 'Charlie': 95, 'Dave': 33}\npassing = {name: score for name, score in scores.items() if score >= 60}\nprint(f\"Passing: {passing}\")",
        "output": "Flattened: [1, 2, 3, 4, 5, 6, 7, 8, 9]\nTransposed: [[1, 4, 7], [2, 5, 8], [3, 6, 9]]\nLabel IDs: [0, 1, 2, 3, 0]\nPassing: {'Alice': 88, 'Charlie': 95}",
        "explanation": "Nested comprehensions flatten a matrix and transpose it. Ternary expression inside comprehension maps labels to IDs. Dict comprehension filters passing scores."
      },
      {
        "level": "advanced",
        "code": "# Memory comparison: list comp vs generator expression\nimport sys\n\nn = 10_000_000\n\nlist_squares = [x**2 for x in range(n)]\ngen_squares = (x**2 for x in range(n))\n\nprint(f\"List comprehension size: {sys.getsizeof(list_squares) / 1024 / 1024:.2f} MB\")\nprint(f\"Generator expression size: {sys.getsizeof(gen_squares)} bytes\")\n\n# Chaining generators\nraw_data = (x**2 for x in range(100))\nfiltered = (x for x in raw_data if x > 500)\ntransformed = (x * 1.5 for x in filtered)\nlimited = list(transformed)[:5]\nprint(f\"\\nPipeline result (first 5): {limited}\")\n\n# Walrus operator in comprehension (Python 3.8+)\nfrom math import sqrt\nvalues = [4, 9, 16, 25, 36]\nresult = [sq for x in values if (sq := sqrt(x)) > 3]\nprint(f\"Sqrt > 3: {result}\")",
        "output": "List comprehension size: 76.29 MB\nGenerator expression size: 208 bytes\n\nPipeline result (first 5): [750.0, 864.0, 1014.0, 1176.0, 1350.0]\nSqrt > 3: [4.0, 5.0, 6.0]",
        "explanation": "The list comp allocates ~76 MB; the gen expr uses 208 bytes regardless of n. Generator pipelines chain transformations lazily. The walrus operator computes sqrt(x) once and both filters and includes it."
      }
    ],
    "realWorld": {
      "useCases": [
        {
          "industry": "Data Engineering",
          "description": "Generator expressions stream CSV rows without loading entire files. Chained generators form ETL pipelines."
        },
        {
          "industry": "NLP Preprocessing",
          "description": "List comprehensions normalize text corpora. Dict comprehensions build vocabularies. Generator expressions yield batches."
        },
        {
          "industry": "Financial Analysis",
          "description": "Generator expressions compute running aggregates: sum(price * qty for price, qty in zip(prices, quantities))."
        }
      ],
      "caseStudy": {
        "problem": "A genomics pipeline processing 50GB+ CSV files used list comprehensions that loaded entire datasets into memory, causing OOM crashes on 32GB machines.",
        "solution": "All intermediate list comprehensions replaced with generator expressions. Final aggregation used sum(), max(), Counter.update() with generator inputs.",
        "results": "Peak memory usage dropped from 45GB to 200MB. Runtime increased by only 8%. Code became cleaner—explicit accumulation replaced with single-line generator expressions."
      },
      "bestPractices": [
        "Use comprehensions for mapping/filtering, not for side effects",
        "Prefer generator expressions for large or infinite iterables",
        "Limit nested comprehensions to at most 2-3 for clauses",
        "Use sum(gen) over sum([list]) to avoid intermediate lists",
        "Avoid comprehensions spanning more than 2-3 lines",
        "Use conditional expressions (ternary) inside comprehensions sparingly",
        "Name complex expressions by extracting into functions"
      ],
      "tools": [
        "itertools.islice — Slice generators without materializing",
        "itertools.chain — Chain multiple generators into one sequence",
        "itertools.groupby — Group consecutive elements by key function",
        "memory_profiler — Measure memory of list comps vs generators",
        "pandas.Series.apply — Vectorized alternative to comprehensions",
        "numpy.vectorize — Vectorized functions for array operations",
        "__slots__ — Memory optimization for comprehension-heavy code"
      ],
      "jobRoles": [
        "Data Engineer — Streaming data pipelines with generator expressions",
        "NLP Engineer — Comprehensions for text preprocessing and vocab building",
        "Backend Developer — Efficient list/dict transformations for API responses",
        "ML Engineer — Batch generators for training loops and data loaders",
        "DevOps Engineer — Log processing pipelines with generator chains"
      ],
      "furtherReading": [
        {
          "title": "PEP 202 — List Comprehensions",
          "url": "https://peps.python.org/pep-0202/"
        },
        {
          "title": "PEP 289 — Generator Expressions",
          "url": "https://peps.python.org/pep-0289/"
        },
        {
          "title": "Python Comprehensions Guide",
          "url": "https://realpython.com/list-comprehension-python/"
        },
        {
          "title": "Generator vs List Comprehensions",
          "url": "https://stackoverflow.com/questions/47789/generator-expressions-vs-list-comprehensions"
        }
      ]
    },
    "quiz": [
      {
        "type": "mcq",
        "question": "What is the output of [x for x in [1, 2, 3, 4]]?",
        "options": [
          "[1, 2, 3, 4]",
          "x",
          "Generator object",
          "(1, 2, 3, 4)"
        ],
        "answer": "[1, 2, 3, 4]"
      },
      {
        "type": "truefalse",
        "question": "Generator expressions consume the same memory as list comprehensions for the same input.",
        "answer": "False"
      },
      {
        "type": "fillblank",
        "question": "A comprehension with {k: v for ...} syntax creates a _____ comprehension.",
        "answer": "dictionary"
      },
      {
        "type": "code",
        "question": "What does sum(x**2 for x in range(4)) return?",
        "options": [
          "14",
          "30",
          "0",
          "9"
        ],
        "answer": "14"
      },
      {
        "type": "match",
        "question": "Match syntax to result type:",
        "pairs": {
          "[x for x in r]": "List",
          "{x for x in r}": "Set",
          "{x: x for x in r}": "Dict",
          "(x for x in r)": "Generator"
        }
      }
    ]
  },
  "p1-control-flow": {
    "theory": "Control flow dictates the order in which individual statements, instructions, or function calls are executed or evaluated in a Python program. The primary control flow constructs are conditional branching (if, elif, else), loops (for, while), and loop control (break, continue, else on loops). Python differs from many C-family languages by using indentation to define blocks instead of braces, making the visual structure of the code match its logical structure.\n\nConditional statements evaluate boolean expressions using short-circuit evaluation: and returns the first falsy operand or the last operand; or returns the first truthy operand or the last operand. This enables concise patterns like value = x or default (use x if truthy, else default). The walrus operator (:=) introduced in Python 3.8 allows assignment within expressions: if (n := len(data)) > 10:. Python 3.10 introduced match for structural pattern matching, which goes beyond simple switch statements to support destructuring, guards, and type matching.\n\nThe for loop in Python is a for-each loop—it iterates directly over items of any iterable (list, string, file, generator). The range() function generates numeric sequences without creating a full list in memory. The while loop repeats as long as a condition remains truthy. Both loop types support else clauses that execute only if the loop completed normally (not via break), which is useful for search-and-confirm patterns.\n\nFor AI/ML work, control flow patterns appear in training loops, data preprocessing pipelines, and conditional model selection. Efficient looping is critical because ML typically processes large datasets—using break early in search operations, avoiding unnecessary iterations with continue, and leveraging else on loops for sentinel detection can significantly reduce runtime.\n\nCommon pitfalls include modifying a list while iterating over it (use a copy or iterate backwards), infinite while loops from forgetting to update the condition variable, and the confusing behavior of else on loops. Another frequent mistake is using is instead of == for value comparison in conditions—is checks identity, not equality.",
    "keyDefinitions": [
      {
        "term": "Short-Circuit Evaluation",
        "definition": "The behavior where boolean operators and and or stop evaluating as soon as the result is determined, returning the last evaluated operand rather than a boolean.",
        "example": "None or [] or 42 or 'fallback' evaluates to 42 because it's the first truthy value."
      },
      {
        "term": "Walrus Operator (:=)",
        "definition": "An assignment expression that assigns a value to a variable within an enclosing expression, introduced in Python 3.8.",
        "example": "if (n := len(data)) > 100: print(f'Large dataset: {n} items')"
      },
      {
        "term": "Loop's else Clause",
        "definition": "An optional else block after a for or while loop that executes only when the loop terminates normally (not via break or an unhandled exception).",
        "example": "for x in [1, 2, 3]: if x == 5: break else: print('5 not found')"
      },
      {
        "term": "Structural Pattern Matching",
        "definition": "Python 3.10+'s match statement that matches a subject against patterns with literal, capture, sequence, mapping, and class patterns.",
        "example": "match point: case (0, 0): print('origin'); case (x, 0): print(f'x-axis at {x}')"
      }
    ],
    "formulas": [
      {
        "title": "Short-Circuit Logical Evaluation",
        "formula": "A and B = (A if A is falsy else B)\nA or B = (A if A is truthy else B)",
        "explanation": "These formulas define how and and or work in Python: they don't necessarily return True/False but return the actual operand value that determined the result.",
        "example": ">>> [] or [1, 2] or print('not reached')\n[1, 2]\n>>> 0 and 'unreachable'\n0"
      },
      {
        "title": "Loop Invariant (for-else pattern)",
        "formula": "exists x in iterable: P(x) -> break\notherwise -> else_clause",
        "explanation": "The loop's else clause acts as a 'not found' handler. It executes exactly when no break occurred, eliminating the need for boolean flag variables in search operations.",
        "example": "numbers = [2, 4, 6, 8]; for n in numbers: if n % 2 != 0: break else: print('all even')"
      }
    ],
    "whyItMatters": "Control flow is the backbone of all algorithms in AI/ML. Training loops iterate over epochs and batches, data preprocessing pipelines conditionally handle missing values, and model evaluation branches on performance metrics. Efficient control flow directly impacts both code clarity and runtime performance on large datasets.",
    "architecture": {
      "title": "Python Bytecode Control Flow",
      "description": "How Python compiles control flow constructs into bytecode with jump instructions.",
      "blocks": [
        {
          "label": "COMPARE_OP",
          "description": "Pushes comparison result (True/False) onto the value stack"
        },
        {
          "label": "POP_JUMP_IF_FALSE",
          "description": "Pops top of stack; if False, jumps to else/next branch"
        },
        {
          "label": "JUMP_FORWARD / ABSOLUTE",
          "description": "Unconditional jump for else branches and loop headers"
        },
        {
          "label": "FOR_ITER",
          "description": "Gets next item from iterator; on StopIteration, jumps to else clause"
        },
        {
          "label": "SETUP_LOOP / BREAK_LOOP",
          "description": "Manages loop frames and break targets on interpreter's block stack"
        }
      ]
    },
    "understanding": {
      "analogy": "Control flow is like a train switching yard. Your code is a train traveling along tracks (sequential execution). Conditional statements (if/elif/else) are switches routing the train to different branches. Loops (for/while) are circular tracks—the train goes around until the conductor says stop. break is an emergency exit, continue skips the current lap's remainder, and else on a loop is a station visited only if all laps complete without emergency exiting.",
      "steps": [
        {
          "title": "Master if/elif/else Chains",
          "content": "Write conditions from most specific to most general. Use elif instead of nested if for mutually exclusive conditions. Python supports chained comparison: if 0 < x < 10."
        },
        {
          "title": "Leverage Short-Circuit Evaluation",
          "content": "Use a and b check preconditions before accessing: user and user.name. Use value or default for fallbacks."
        },
        {
          "title": "Iterate Correctly with for Loops",
          "content": "Use for item in iterable. For indices, use enumerate(). For parallel sequences, use zip()."
        },
        {
          "title": "Use while Loops Judiciously",
          "content": "Prefer for over while for known sequences. Use while for retry logic, polling, or convergence loops."
        },
        {
          "title": "Apply Pattern Matching (Python 3.10+)",
          "content": "Use match for value dispatch, destructuring, and structural checks. Combine with guards (if) for complex matching."
        }
      ],
      "misconceptions": [
        {
          "misconception": "else on a loop runs regardless of whether the loop executed.",
          "truth": "The else clause runs only if the loop completed normally (iterator exhausted, condition falsy). It does NOT run if exited via break."
        },
        {
          "misconception": "Python's switch statement doesn't exist.",
          "truth": "Python 3.10 introduced match via PEP 634, far more powerful than C's switch with literal, capture, sequence, mapping, and OR patterns."
        }
      ]
    },
    "codeExamples": [
      {
        "level": "basic",
        "code": "# Basic if-elif-else with short-circuit\nscore = 85\nif score >= 90:\n    grade = 'A'\nelif score >= 80:\n    grade = 'B'\nelif score >= 70:\n    grade = 'C'\nelif score >= 60:\n    grade = 'D'\nelse:\n    grade = 'F'\n\nuser_name = None\ndisplay_name = user_name or 'Guest'\nprint(f\"Score: {score} -> Grade: {grade}\")\nprint(f\"User: {display_name}\")\n\nx = 42\nif 10 < x < 50:\n    print(f\"{x} is between 10 and 50\")",
        "output": "Score: 85 -> Grade: B\nUser: Guest\n42 is between 10 and 50",
        "explanation": "Basic conditional branching with elif, short-circuit or for default values, and Python's chained comparison syntax 10 < x < 50."
      },
      {
        "level": "intermediate",
        "code": "# Loop control with for-else and enumerate\nimport math\n\ndef is_prime(n):\n    if n < 2:\n        return False\n    for i in range(2, int(math.sqrt(n)) + 1):\n        if n % i == 0:\n            print(f\"{n} is divisible by {i}\")\n            break\n    else:\n        return True\n    return False\n\nfruits = ['apple', 'banana', 'cherry']\nfor idx, fruit in enumerate(fruits, start=1):\n    print(f\"{idx}. {fruit}\")\n\nnames = ['Alice', 'Bob', 'Charlie']\nscores = [88, 92, 85]\npaired = {name: score for name, score in zip(names, scores)}\nprint(f\"Paired dict: {paired}\")",
        "output": "1. apple\n2. banana\n3. cherry\nPaired dict: {'Alice': 88, 'Bob': 92, 'Charlie': 85}",
        "explanation": "for-else runs the else block only if no break occurred. enumerate generates index-element pairs. zip pairs two lists element-wise into a dict comprehension."
      },
      {
        "level": "advanced",
        "code": "# Structural pattern matching (Python 3.10+)\ndef process_command(command):\n    match command:\n        case \"quit\" | \"exit\" | \"q\":\n            return \"Shutting down\"\n        case [\"add\", *items]:\n            return f\"Adding {len(items)} items: {items}\"\n        case {\"action\": \"delete\", \"id\": id, \"confirm\": True}:\n            return f\"Deleting record {id}\"\n        case str() if len(command) > 100:\n            return \"Command too long\"\n        case _:\n            return f\"Unknown command: {command}\"\n\nprint(process_command(\"quit\"))\nprint(process_command([\"add\", \"apple\", \"banana\"]))\nprint(process_command({\"action\": \"delete\", \"id\": 42, \"confirm\": True}))\nprint(process_command(\"x\" * 101))\nprint(process_command(\"run\"))",
        "output": "Shutting down\nAdding 2 items: ('apple', 'banana')\nDeleting record 42\nCommand too long\nUnknown command: run",
        "explanation": "Pattern matching uses | for OR patterns, [*items] for sequence unpacking, {'key': var} for mapping patterns, str() for type guards, and _ as wildcard."
      }
    ],
    "realWorld": {
      "useCases": [
        {
          "industry": "Web Scraping",
          "description": "Control flow handles retry logic for failed requests, pagination iteration, and conditional extraction of page elements."
        },
        {
          "industry": "ETL Pipelines",
          "description": "Data processing pipelines use for loops over chunks with conditional branching for data quality checks and error handling."
        },
        {
          "industry": "Model Training",
          "description": "Training loops contain nested for loops over epochs and batches with conditional early stopping based on validation loss."
        }
      ],
      "caseStudy": {
        "problem": "A real-time fraud detection system needed to evaluate thousands of transactions per second against 50+ rules. The nested if-elif chain was slow and unmaintainable.",
        "solution": "The team replaced the if-elif chain with a dispatch dictionary mapping rule names to callable functions and used pattern matching for complex rules.",
        "results": "Codebase lines for rule evaluation dropped by 60%. Throughput increased 3x via O(1) dict lookup vs O(n) elif chains."
      },
      "bestPractices": [
        "Prefer for loops over while loops for definite iteration",
        "Use for-else for search-and-confirm patterns instead of boolean flags",
        "Keep conditional nesting to 3 levels max",
        "Use enumerate() over manual index tracking in loops",
        "Avoid modifying the iterable while iterating—create a copy if needed",
        "Use match for type dispatch and complex destructuring (Python 3.10+)",
        "Never use is for value comparison—only for identity checks"
      ],
      "tools": [
        "itertools — chain, cycle, groupby, islice for advanced iteration",
        "more-itertools — Third-party library extending itertools",
        "dis — Bytecode disassembler for control flow constructs",
        "timeit — Measure execution time of different loop constructs",
        "tqdm — Progress bars for loops with automatic iteration tracking",
        "contextlib — Context manager utilities for resource handling",
        "forelse — PyPI package for educational for-else demonstration"
      ],
      "jobRoles": [
        "Data Engineer — Writes ETL pipelines with complex branching logic",
        "ML Engineer — Designs training loops with early stopping and conditional evaluation",
        "Backend Developer — Implements request routing with conditional middleware",
        "Automation Engineer — Builds conditional workflow automations",
        "Security Engineer — Develops rule-based detection with dispatch tables"
      ],
      "furtherReading": [
        {
          "title": "PEP 308 — Conditional Expressions",
          "url": "https://peps.python.org/pep-0308/"
        },
        {
          "title": "PEP 634 — Structural Pattern Matching",
          "url": "https://peps.python.org/pep-0634/"
        },
        {
          "title": "Python 3.10 Match Statement Tutorial",
          "url": "https://realpython.com/python-match-statement/"
        },
        {
          "title": "Loop Better in Python",
          "url": "https://nedbatchelder.com/text/iter.html"
        }
      ]
    },
    "quiz": [
      {
        "type": "mcq",
        "question": "What does this print? for i in range(3): print(i) else: print('done')",
        "options": [
          "0 1 2",
          "0 1 2 done",
          "done",
          "0 1 2 done done"
        ],
        "answer": "0 1 2 done"
      },
      {
        "type": "truefalse",
        "question": "Python's match statement can destructure nested sequences and mappings.",
        "answer": "True"
      },
      {
        "type": "fillblank",
        "question": "The operator _____ was introduced in Python 3.8 for assignment within expressions.",
        "answer": ":="
      },
      {
        "type": "code",
        "question": "What is the output of: print(0 and 42 or 100)",
        "options": [
          "0",
          "42",
          "100",
          "True"
        ],
        "answer": "100"
      },
      {
        "type": "match",
        "question": "Match patterns to what they match:",
        "pairs": {
          "case _:": "Wildcard — matches anything",
          "case [x, *rest]:": "Sequence with at least one element",
          "case {'key': val}:": "Mapping with literal key",
          "case str() | int():": "Type OR — string or integer"
        }
      }
    ]
  },
  "p1-data-structures": {
    "theory": "Python's built-in data structures—lists, tuples, dictionaries, and sets—are the workhorses of nearly every Python program. Each offers different trade-offs between mutability, ordering, access speed, memory usage, and hashing capability. Mastering these four structures and knowing when to use each is a fundamental skill that separates novice from proficient Python developers.\n\nLists are ordered, mutable sequences implemented as dynamic arrays (array of PyObject* pointers). They support O(1) amortized append and pop from the end, O(n) insertion/deletion at arbitrary positions, and O(1) indexing. Tuples are ordered, immutable sequences implemented as fixed arrays—they cannot be modified after creation, which makes them hashable and usable as dictionary keys. Tuples also serve as lightweight records for grouping related data without defining a class.\n\nDictionaries are insertion-ordered (as of Python 3.7) mutable mappings implemented as hash tables. They provide O(1) average-case lookup, insertion, and deletion. Keys must be hashable (immutable objects or objects implementing __hash__ and __eq__). Sets are unordered collections of unique hashable elements, implemented similarly to dictionaries (as hash tables with only keys). They support O(1) membership testing and mathematical set operations like union, intersection, and difference.\n\nPython also provides specialized data structures in the collections module: deque (double-ended queue for O(1) appends/pops from both ends), defaultdict (dict that provides default values for missing keys), Counter (dict subclass for counting hashable objects), and namedtuple (tuple subclass with named fields for readable code).\n\nFor AI/ML work, lists store data batches, tuples represent immutable coordinates or configurations, dictionaries encode hyperparameters and label mappings, and sets handle unique identifier collections. The defaultdict and Counter are indispensable for text preprocessing: counting word frequencies, building vocabulary mappings, and aggregating statistics.\n\nCommon pitfalls include using a list where a set would provide O(1) membership testing, forgetting that dicts and sets require hashable keys, and confusing copy() (shallow copy) with deepcopy() for nested structures. Another frequent issue is modifying a dictionary's size while iterating over it, which raises RuntimeError.",
    "keyDefinitions": [
      {
        "term": "Hash Table",
        "definition": "A data structure storing key-value pairs by computing a hash of the key to determine storage bucket, providing O(1) average-case lookup.",
        "example": "d = {'apple': 5}; d['banana'] = 3 — Python hashes keys to determine storage location."
      },
      {
        "term": "Amortized O(1) Append",
        "definition": "The guarantee that appending to a list is O(1) on average because resizing happens exponentially less often as the list grows.",
        "example": "lst = []; for i in range(1000): lst.append(i) — each append is O(1) average with ~12 resizes."
      },
      {
        "term": "Hashable",
        "definition": "An object with __hash__() returning a constant integer and a corresponding __eq__(), required for dict keys or set members.",
        "example": "hash((1, 'a', True)) works, but hash([1, 2, 3]) raises TypeError: unhashable type: 'list'."
      },
      {
        "term": "Insertion Ordering",
        "definition": "The property that dicts (Python 3.7+) and sets (Python 3.8+) preserve the order of first insertion, making iteration predictable.",
        "example": "d = {}; d['b'] = 1; d['a'] = 2; list(d) returns ['b', 'a'] in insertion order."
      }
    ],
    "formulas": [
      {
        "title": "List Growth Pattern",
        "formula": "new_capacity = old_capacity * growth_factor (growth_factor ~ 1.125 in CPython)",
        "explanation": "Python lists grow by multiplying capacity by ~1.125 when full, ensuring O(n) total cost over n appends and O(1) amortized per append.",
        "example": "A list with capacity 8 resizes to 10 when the 9th element is appended, then to 13 when the 11th arrives."
      },
      {
        "title": "Dictionary Load Factor Threshold",
        "formula": "resize_when: entries / table_size > 2/3 (~ 0.66)",
        "explanation": "Python's dict resizes when entries exceed 2/3 of the hash table's slots, maintaining sparse tables for O(1) lookup. New size doubles to minimize future resizes.",
        "example": "A dict with 8 slots resizes when the 6th entry is added (6/8 = 0.75 > 2/3)."
      }
    ],
    "whyItMatters": "Data structures determine the performance characteristics of every ML algorithm. Feature vectors stored as lists give O(1) random access for model inference. Hyperparameter grids are dicts. Vocabulary-to-index mappings are dicts with O(1) lookup. Label deduplication uses sets. Choosing a list when a set is needed turns O(1) into O(n), catastrophic on datasets with millions of samples.",
    "architecture": {
      "title": "Python Dictionary Internal Layout",
      "description": "Python's hash table dictionary organization with sparse table and entry array.",
      "blocks": [
        {
          "label": "dk_refcnt / dk_size",
          "description": "Reference count and hash table size (power of 2, >= 8)"
        },
        {
          "label": "dk_indices (char[])",
          "description": "Sparse index array mapping hash values to entry positions using 1/2/4 byte entries"
        },
        {
          "label": "dk_entries (PyDictKeyEntry[])",
          "description": "Dense entry array: each holds key pointer, hash value, and value pointer"
        },
        {
          "label": "ma_values (PyObject**)",
          "description": "Separate values table for split-table dicts (class instances); NULL for combined dicts"
        }
      ]
    },
    "understanding": {
      "analogy": "Data structures are different containers in a warehouse. Lists are long shelves with items in order—easy to add to the end, harder to insert in the middle. Tuples are sealed boxes—you see the contents but cannot change them. Dictionaries are labeled filing cabinets—each drawer (key) opens directly to the file (value). Sets are bins of unique items—instant membership check but random order.",
      "steps": [
        {
          "title": "Choose Correct Structure",
          "content": "List for ordered mutable sequences. Tuple for immutable fixed records (e.g., (x, y)). Set for O(1) membership testing and dedup."
        },
        {
          "title": "Master Dictionary Operations",
          "content": "Use d.get(key, default) for safe access, d.setdefault(key, []) for auto-initializing, d.items() for iteration."
        },
        {
          "title": "Leverage collections Module",
          "content": "defaultdict(list) for grouping, Counter for frequencies, deque for queue operations, namedtuple for readable records."
        },
        {
          "title": "Understand Copying Semantics",
          "content": "copy.copy() creates shallow copies (nested objects shared). copy.deepcopy() recursively copies everything."
        },
        {
          "title": "Avoid Common Pitfalls",
          "content": "Don't modify dict/set while iterating. Don't use mutable objects as dict keys. Don't use is for value comparison."
        }
      ],
      "misconceptions": [
        {
          "misconception": "Dictionaries in Python are unordered.",
          "truth": "As of Python 3.7, dicts maintain insertion order as a language guarantee. Sets also maintain insertion order as of Python 3.8."
        },
        {
          "misconception": "Tuples are just immutable lists.",
          "truth": "Tuples serve as records for heterogeneous data where position has meaning. Lists are for homogeneous sequences with variable length."
        }
      ]
    },
    "codeExamples": [
      {
        "level": "basic",
        "code": "# List, tuple, dict, set basics\nfruits = ['apple', 'banana', 'cherry']\nfruits.append('date')\nfruits.insert(1, 'blueberry')\nprint(f\"List: {fruits}\")\n\npoint = (3, 4)\nx, y = point\nprint(f\"Point: ({x}, {y}), hashable: {hash(point)}\")\n\ncapitals = {\"France\": \"Paris\", \"Japan\": \"Tokyo\"}\ncapitals[\"India\"] = \"New Delhi\"\nprint(f\"Japan: {capitals.get('Japan')}\")\n\nunique = {1, 2, 3, 3, 2, 1}\nprint(f\"Unique set: {unique}\")\nprint(f\"Is 3 in set? {3 in unique}\")",
        "output": "List: ['apple', 'blueberry', 'banana', 'cherry', 'date']\nPoint: (3, 4), hashable: 2576485172200686449\nJapan: Tokyo\nUnique set: {1, 2, 3}\nIs 3 in set? True",
        "explanation": "Lists support insertion, append, indexing. Tuples are hashable. Dicts map keys to values with .get(). Sets deduplicate and provide O(1) in checks."
      },
      {
        "level": "intermediate",
        "code": "# Advanced collections: defaultdict, Counter, namedtuple\nfrom collections import defaultdict, Counter, namedtuple, deque\n\nwords = ['apple', 'banana', 'apple', 'cherry', 'banana', 'apple']\nby_count = defaultdict(list)\nfor i, word in enumerate(words):\n    by_count[word].append(i)\nprint(f\"Groups: {dict(by_count)}\")\n\nfreq = Counter(words)\nprint(f\"Frequency: {dict(freq)}\")\nprint(f\"Most common: {freq.most_common(2)}\")\n\nStudent = namedtuple('Student', ['name', 'age', 'grade'])\ns = Student('Alice', 22, 'A')\nprint(f\"Student: {s.name}, {s.age}, {s.grade}\")\n\nqueue = deque(['a', 'b', 'c'])\nqueue.append('d')\nqueue.appendleft('z')\nprint(f\"Deque pop left: {queue.popleft()}, pop right: {queue.pop()}\")",
        "output": "Groups: {'apple': [0, 2, 5], 'banana': [1, 4], 'cherry': [3]}\nFrequency: {'apple': 3, 'banana': 2, 'cherry': 1}\nMost common: [('apple', 3), ('banana', 2)]\nStudent: Alice, 22, A\nDeque pop left: z, pop right: d",
        "explanation": "defaultdict(list) auto-creates empty lists for missing keys. Counter tallies counts with most_common(). namedtuple creates lightweight records. deque provides O(1) append/pop from both ends."
      },
      {
        "level": "advanced",
        "code": "# Custom hashable type and performance comparison\nimport time\n\nclass Point:\n    __slots__ = ('x', 'y')\n    def __init__(self, x, y):\n        self.x = x\n        self.y = y\n    def __hash__(self):\n        return hash((self.x, self.y))\n    def __eq__(self, other):\n        return isinstance(other, Point) and self.x == other.x and self.y == other.y\n    def __repr__(self):\n        return f\"P({self.x},{self.y})\"\n\npoint_map = {Point(0, 0): 'origin', Point(1, 0): 'right'}\nprint(f\"Point(0,0) -> {point_map[Point(0, 0)]}\")\n\nn = 10_000_000\ndata = list(range(n))\ndata_set = set(data)\n\nt0 = time.perf_counter()\n_ = -1 in data\nt1 = time.perf_counter()\n\nt2 = time.perf_counter()\n_ = -1 in data_set\nt3 = time.perf_counter()\n\nprint(f\"\\nList 'in': {t1 - t0:.4f}s (O(n))\")\nprint(f\"Set  'in': {t3 - t2:.6f}s (O(1))\")",
        "output": "Point(0,0) -> origin\n\nList 'in': 0.0421s (O(n))\nSet  'in': 0.000001s (O(1))",
        "explanation": "Custom types as dict keys must implement __hash__ and __eq__. __slots__ reduces memory. Performance benchmark shows set membership is ~40,000x faster than list for 10M elements."
      }
    ],
    "realWorld": {
      "useCases": [
        {
          "industry": "NLP",
          "description": "Counter for vocabulary frequency, defaultdict(list) for token grouping, dicts for word-to-embedding mappings, sets for stopword O(1) filtering."
        },
        {
          "industry": "E-Commerce",
          "description": "Shopping carts as lists of dicts, product catalogs as nested dicts, order dedup using sets, deque for request queues."
        },
        {
          "industry": "Graph Analytics",
          "description": "Adjacency lists via defaultdict(set), BFS/DFS with deque, namedtuple for weighted edges."
        }
      ],
      "caseStudy": {
        "problem": "A real-time recommendation system exceeded 10ms SLA using lists for membership checks on millions of users (O(n) scans).",
        "solution": "All membership checks migrated from lists to sets. User->preference mappings used dicts. Co-occurrence used defaultdict(Counter). Candidate generation used set intersections.",
        "results": "P95 latency dropped from 45ms to 6ms. Set dedup reduced redundant recommendations by 30%. defaultdict(Counter) replaced 50 lines with 3."
      },
      "bestPractices": [
        "Use sets for membership tests and deduplication, not lists",
        "Use defaultdict and Counter over manual dict key checking",
        "Prefer tuple over list for fixed-size, immutable collections",
        "Use namedtuple or dataclasses for structured records",
        "Use deque over list for fast appends/pops from both ends",
        "Avoid modifying dicts or sets while iterating",
        "Use {**d1, **d2} or d1 | d2 for dictionary merging"
      ],
      "tools": [
        "collections — defaultdict, Counter, deque, namedtuple, OrderedDict, ChainMap",
        "array — Compact typed arrays for homogeneous numeric data",
        "bisect — Binary search and insertion on sorted lists",
        "heapq — Priority queue implementation with heap operations",
        "itertools — chain, groupby, permutations, combinations",
        "copy — Shallow and deep copy for nested data structures",
        "pickle — Serialization for persistence"
      ],
      "jobRoles": [
        "Data Engineer — Dicts for configs, lists for batches, sets for dedup",
        "Backend Developer — In-memory caches with dict and OrderedDict LRU",
        "NLP Engineer — Counter, defaultdict, dict for vocabulary analysis",
        "ML Platform Engineer — Feature stores with appropriate collections",
        "Systems Engineer — Priority queues (heapq) and sliding windows (deque)"
      ],
      "furtherReading": [
        {
          "title": "Python collections module docs",
          "url": "https://docs.python.org/3/library/collections.html"
        },
        {
          "title": "CPython dict internals explained",
          "url": "https://benhoyt.com/writings/python-dict-internals/"
        },
        {
          "title": "TimeComplexity of Python operations",
          "url": "https://wiki.python.org/moin/TimeComplexity"
        },
        {
          "title": "Python 3.7+ dict ordering guarantee",
          "url": "https://mail.python.org/pipermail/python-dev/2017-December/151283.html"
        }
      ]
    },
    "quiz": [
      {
        "type": "mcq",
        "question": "Which data structure provides O(1) membership testing?",
        "options": [
          "list",
          "tuple",
          "set",
          "str"
        ],
        "answer": "set"
      },
      {
        "type": "truefalse",
        "question": "A Python tuple can be used as a dictionary key.",
        "answer": "True"
      },
      {
        "type": "fillblank",
        "question": "The _____ type from collections is useful for counting hashable objects like word frequencies.",
        "answer": "Counter"
      },
      {
        "type": "code",
        "question": "What is the result of {1, 2, 3} & {2, 3, 4}?",
        "options": [
          "{2, 3}",
          "{1, 2, 3, 4}",
          "{1, 4}",
          "set()"
        ],
        "answer": "{2, 3}"
      },
      {
        "type": "match",
        "question": "Match collection to use case:",
        "pairs": {
          "deque": "Fast appends/pops from both ends",
          "defaultdict": "Auto-initializing missing keys",
          "namedtuple": "Readable immutable records",
          "OrderedDict": "Dict with move_to_end method"
        }
      }
    ]
  },
  "p1-data-types": {
    "theory": "Python provides a rich set of built-in data types that form the foundation for all programming. The primary categories are numeric types (int, float, complex), sequence types (str, list, tuple, range), mapping types (dict), set types (set, frozenset), and boolean (bool). Every value in Python is an object with an associated type, determined automatically at runtime. Understanding these types deeply is critical because they directly impact memory usage, performance characteristics, and algorithm design.\n\nIntegers in Python are arbitrary-precision (big integers), meaning they can grow to any size limited only by available memory. Floats follow IEEE 754 double-precision format, which means they have approximately 15-17 decimal digits of precision and can represent values from 5e-324 to 1.8e+308. Complex numbers use the j suffix: 3 + 4j. The decimal.Decimal type from the standard library provides exact decimal arithmetic for financial calculations, while fractions.Fraction handles rational numbers precisely.\n\nStrings are immutable sequences of Unicode code points. Python 3 uses Unicode throughout—every string is a sequence of Unicode characters, not bytes. String literals can use single quotes, double quotes, triple quotes, and f-string syntax. Raw strings (r'...') disable escape sequence processing. Type conversion functions (int(), float(), str(), bool()) perform explicit casting. The isinstance() function checks whether a value belongs to a type, which is preferred over type() == for inheritance-aware checks.\n\nFor AI/ML work, numeric types and their precision characteristics are paramount. Standard Python floats are sufficient for most ML tasks, but deep learning frameworks like PyTorch and TensorFlow use their own tensor types with configurable precision (float32, float64, bfloat16). Boolean indexing is a fundamental pattern used extensively in numpy and pandas for filtering data. The bool() conversion follows truthiness rules: zero, None, empty collections, and False are falsy; all other values are truthy.\n\nCommon pitfalls include comparing floats with == due to precision issues (use math.isclose() instead), assuming None == None is the only truthy check (use is None for identity, not equality), and forgetting that type checks with isinstance() are better than type() for subclass support. Another frequent mistake is using mutable objects as default function arguments—defaults are evaluated once at definition time, not each call.",
    "keyDefinitions": [
      {
        "term": "Immutable Type",
        "definition": "A type whose instances cannot be modified after creation. Any operation that appears to modify an immutable type returns a new object instead.",
        "example": "s = 'hello'; s.upper() returns a new string 'HELLO' without changing the original s."
      },
      {
        "term": "Type Coercion",
        "definition": "The automatic or explicit conversion of a value from one type to another, performed by Python in mixed-type operations or via cast functions.",
        "example": "In 3 + 4.5, Python automatically coerces the integer 3 to float 3.0, then performs float addition to yield 7.5."
      },
      {
        "term": "Truthiness",
        "definition": "The Boolean evaluation of a value in a logical context. Every Python object is either truthy or falsy based on its __bool__() or __len__() method.",
        "example": "bool([]), bool(0), and bool(None) all return False because empty sequences, zero, and None are falsy."
      },
      {
        "term": "Arbitrary-Precision Integer",
        "definition": "Python's int type can represent integers of any magnitude, limited only by system memory, using a variable-length array of digits internally.",
        "example": "2 ** 1000 computes a 302-digit integer perfectly without overflow, something that would fail in languages with fixed-width integers."
      }
    ],
    "formulas": [
      {
        "title": "Floating-Point Precision Error",
        "formula": "0.1 + 0.2 != 0.3 (in IEEE 754 double precision)",
        "explanation": "Due to binary representation of decimal fractions, 0.1 and 0.2 cannot be represented exactly in base-2 floating point. The sum yields 0.30000000000000004, not 0.3. Use math.isclose(0.1 + 0.2, 0.3) for safe comparison.",
        "example": ">>> 0.1 + 0.2\n0.30000000000000004\n>>> import math\n>>> math.isclose(0.1 + 0.2, 0.3)\nTrue"
      },
      {
        "title": "Type Conversion Precedence",
        "formula": "bool < int < float < complex (widening hierarchy)",
        "explanation": "When mixing numeric types, Python converts the narrower type to the wider type automatically. A bool combined with an int promotes to int; an int with a float promotes to float; a float with a complex promotes to complex.",
        "example": ">>> True + 2\n3\n>>> 3 + 4.5\n7.5\n>>> 2.0 + 3j\n(2+3j)"
      }
    ],
    "whyItMatters": "Every AI/ML operation reduces to manipulating numeric data: feature vectors are lists of floats, labels are integers or one-hot encoded bools, model parameters are tensors of floats with specific precision requirements. Understanding Python's type system—especially numeric precision, type conversion, and memory representation—is essential before working with numpy arrays or PyTorch tensors. Mistakes in type handling can silently corrupt data, introduce numerical instability, or cause catastrophic performance degradation in ML pipelines.",
    "architecture": {
      "title": "Python Object Layout (PyObject)",
      "description": "How every Python object is represented in memory, showing the common header and type-specific data.",
      "blocks": [
        {
          "label": "ob_refcnt (Py_ssize_t)",
          "description": "Reference count for garbage collection — incremented/decremented on each reference operation"
        },
        {
          "label": "ob_type (PyTypeObject*)",
          "description": "Pointer to the type object that defines the type's behavior, methods, and slots"
        },
        {
          "label": "ob_size (Py_ssize_t) [var objects]",
          "description": "Length field for variable-size objects like strings, lists, tuples — stored before actual data"
        },
        {
          "label": "ob_data / ob_digit [payload]",
          "description": "The actual value data — inline for small ints/float, heap-allocated for big ints and sequences"
        },
        {
          "label": "PyTypeObject (shared per type)",
          "description": "Shared structure defining type name, method tables, hash function, comparison ops, etc."
        }
      ]
    },
    "understanding": {
      "analogy": "Python's type system is like a container yard at a shipping port. Each container (object) has a label showing its contents (type). 'int' containers hold whole numbers, 'float' containers hold decimal numbers, 'str' containers hold text. You can look at a container's label with type() (like scanning a barcode). Some containers are sealed shut (immutable) — you can't change what's inside, you can only swap the whole container for a new one. Other containers open easily (mutable) — you can add or remove items freely.",
      "steps": [
        {
          "title": "Learn Basic Numeric Types",
          "content": "Experiment with int, float, and complex. Note that 3 and 3.0 are different types. Use type() to verify. Try isinstance(3, (int, float)) to check multiple types at once."
        },
        {
          "title": "Understand String Fundamentals",
          "content": "Create strings with different quote styles. Use f-strings for interpolation: f'Value: {x:.2f}'. Learn slicing: s[start:stop:step]. Remember strings are immutable—every operation returns a new string."
        },
        {
          "title": "Master Type Conversion Functions",
          "content": "Practice int('42'), float('3.14'), str(100), bool(1), list('abc'). Understand that int('3.14') raises ValueError while float('3') works."
        },
        {
          "title": "Explore None and Boolean Types",
          "content": "None is Python's null value—use is None for comparison, not ==. Learn all falsy values: False, None, 0, 0.0, '', [], (), {}, set()."
        },
        {
          "title": "Handle Edge Cases with Decimal and Fraction",
          "content": "Import decimal.Decimal for exact monetary calculations and fractions.Fraction for rational arithmetic. Compare 0.1 + 0.2 with Decimal('0.1') + Decimal('0.2')."
        }
      ],
      "misconceptions": [
        {
          "misconception": "== None and is None are interchangeable.",
          "truth": "is None checks object identity (same memory location), which is always correct for None since it's a singleton. Always use is None and is not None."
        },
        {
          "misconception": "Python integers can overflow like in C/Java.",
          "truth": "Python 3 integers are arbitrary-precision and never overflow (except for memory limits). Operations like 10**100000 are valid but slow."
        }
      ]
    },
    "codeExamples": [
      {
        "level": "basic",
        "code": "# Basic type exploration\nimport sys\n\na = 42\nb = 3.14\nc = \"hello\"\nd = [1, 2, 3]\ne = (1, 2)\nf = {\"key\": \"value\"}\ng = {1, 2, 3}\nh = None\n\nfor var in [a, b, c, d, e, f, g, h]:\n    print(f\"{var!r:10s} -> type={type(var).__name__:8s} size={sys.getsizeof(var):4d} bytes\")",
        "output": "42         -> type=int      size=  28 bytes\n3.14       -> type=float    size=  24 bytes\n'hello'    -> type=str      size=  54 bytes\n[1, 2, 3]  -> type=list     size=  88 bytes\n(1, 2)     -> type=tuple    size=  56 bytes\n{'key': 'value'} -> type=dict      size= 232 bytes\n{1, 2, 3}  -> type=set      size= 216 bytes\nNone       -> type=NoneType size=   8 bytes",
        "explanation": "This shows the eight fundamental Python built-in types and their memory footprints. NoneType is the type of None. Sizes vary: small ints are 28 bytes, floats are 24 bytes, and collections grow with their contents."
      },
      {
        "level": "intermediate",
        "code": "# Float precision and Decimal precision comparison\nimport math\nfrom decimal import Decimal, getcontext\n\ngetcontext().prec = 50\n\nresult1 = 0.1 + 0.2\nresult2 = Decimal('0.1') + Decimal('0.2')\n\nprint(f\"float:  0.1 + 0.2 = {result1!r}\")\nprint(f\"float:  0.1 + 0.2 == 0.3? {result1 == 0.3}\")\nprint(f\"float:  math.isclose(0.1+0.2, 0.3)? {math.isclose(result1, 0.3)}\")\nprint(f\"Decimal: 0.1 + 0.2 = {result2!r}\")\nprint(f\"Decimal: 0.1 + 0.2 == 0.3? {result2 == Decimal('0.3')}\")\n\nbig_int = 2**53\nprint(f\"\\n2**53 exact:       {big_int}\")\nprint(f\"float(2**53):     {float(big_int)}\")\nprint(f\"float(2**53 + 1): {float(big_int + 1)}\")",
        "output": "float:  0.1 + 0.2 = 0.30000000000000004\nfloat:  0.1 + 0.2 == 0.3? False\nfloat:  math.isclose(0.1+0.2, 0.3)? True\nDecimal: 0.1 + 0.2 = 0.3\nDecimal: 0.1 + 0.2 == 0.3? True\n\n2**53 exact:       9007199254740992\nfloat(2**53):     9007199254740992.0\nfloat(2**53 + 1): 9007199254740992.0",
        "explanation": "This demonstrates floating-point precision limits. 0.1 + 0.2 in float64 is not exactly 0.3, but Decimal maintains exact representation. 2**53 is the boundary where consecutive integers can no longer be distinguished in float64."
      },
      {
        "level": "advanced",
        "code": "# Memory optimization with __slots__ and custom numeric types\nimport sys\n\nclass Point:\n    __slots__ = ('x', 'y')\n    def __init__(self, x, y):\n        self.x = x\n        self.y = y\n    def __repr__(self):\n        return f\"Point({self.x}, {self.y})\"\n    def __add__(self, other):\n        if isinstance(other, Point):\n            return Point(self.x + other.x, self.y + other.y)\n        return NotImplemented\n    def __eq__(self, other):\n        return isinstance(other, Point) and self.x == other.x and self.y == other.y\n    def __hash__(self):\n        return hash((self.x, self.y))\n\nclass PointNoSlots:\n    def __init__(self, x, y):\n        self.x = x\n        self.y = y\n\np1 = Point(3, 4)\np2 = PointNoSlots(3, 4)\nprint(f\"Point with __slots__:   {sys.getsizeof(p1)} bytes\")\nprint(f\"Point without __slots__: {sys.getsizeof(p2)} bytes\")\nprint(f\"Point + Point: {p1 + Point(1, 2)}\")\nprint(f\"Hashable? {hash(p1)}\")",
        "output": "Point with __slots__:   48 bytes\nPoint without __slots__: 56 bytes\nPoint + Point: Point(4, 6)\nHashable? -1710005286903448483",
        "explanation": "__slots__ reduces per-instance memory by eliminating the per-instance __dict__. We implement __add__ for the + operator and __hash__ with __eq__ to make points usable as dictionary keys or set members."
      }
    ],
    "realWorld": {
      "useCases": [
        {
          "industry": "Finance",
          "description": "Decimal types handle currency calculations with exact precision to avoid rounding errors in trading systems."
        },
        {
          "industry": "Scientific Computing",
          "description": "Float64 arrays store sensor readings, simulation outputs, and experimental data. numpy's dtypes mirror Python's types."
        },
        {
          "industry": "Web APIs",
          "description": "JSON serialization converts Python types to JSON equivalents: dict to object, list to array, int to number, None to null."
        }
      ],
      "caseStudy": {
        "problem": "A financial trading system was losing small amounts of money per transaction due to floating-point rounding errors in Python floats over millions of transactions.",
        "solution": "The team replaced all monetary calculations with decimal.Decimal using a precision of 28 digits and ROUND_HALF_EVEN rounding mode.",
        "results": "All rounding errors were eliminated. Decimal arithmetic with getcontext().prec = 28 matched the precision requirements of financial regulators."
      },
      "bestPractices": [
        "Use isinstance() for type checking, never type() ==",
        "Compare floats with math.isclose() or numpy.isclose(), never ==",
        "Use Decimal for all monetary values requiring exact decimal representation",
        "Prefer tuple over list for fixed-size collections to save memory and enable hashing",
        "Use is None and is not None for None checks, never ==",
        "Leverage __slots__ in classes with many instances to reduce memory overhead",
        "Use int for all discrete quantities and float only when fractional values are needed"
      ],
      "tools": [
        "decimal — Standard library module for exact decimal floating-point arithmetic",
        "fractions — Standard library module for rational number arithmetic",
        "numbers — ABC module with Number, Integral, Real abstract base classes",
        "sys.getsizeof — Returns memory size of any Python object",
        "math.isclose — Safe float comparison with configurable tolerance",
        "array — Standard library for compact typed arrays ('d' for double, 'i' for int)",
        "struct — Pack/unpack Python values to/from C-style binary representations"
      ],
      "jobRoles": [
        "Quantitative Analyst — Uses Python's Decimal and float types for financial modeling",
        "Data Engineer — Manages type conversions in ETL pipelines between databases and files",
        "ML Engineer — Selects appropriate tensor dtypes (float32 vs float64) for model training",
        "Backend Developer — Designs API serialization/deserialization with proper type mapping",
        "Systems Programmer — Optimizes memory layouts using __slots__ and typed arrays"
      ],
      "furtherReading": [
        {
          "title": "Numeric Types in CPython",
          "url": "https://docs.python.org/3/library/stdtypes.html#numeric-types-int-float-complex"
        },
        {
          "title": "Floating-Point Arithmetic",
          "url": "https://docs.oracle.com/cd/E19957-01/806-3568/ncg_goldberg.html"
        },
        {
          "title": "Python 3's F-Strings Guide",
          "url": "https://realpython.com/python-f-strings/"
        },
        {
          "title": "CPython internals: PyObject",
          "url": "https://realpython.com/cpython-source-code-guide/"
        }
      ]
    },
    "quiz": [
      {
        "type": "mcq",
        "question": "What is the output of type(3.0) is int?",
        "options": [
          "True",
          "False",
          "TypeError",
          "None"
        ],
        "answer": "False"
      },
      {
        "type": "truefalse",
        "question": "In Python 3, sys.maxsize represents the maximum value an integer can hold.",
        "answer": "False"
      },
      {
        "type": "fillblank",
        "question": "The expression 0.1 + 0.2 == 0.3 evaluates to _____ in standard Python.",
        "answer": "False"
      },
      {
        "type": "code",
        "question": "What does bool('False') return?",
        "options": [
          "False",
          "True",
          "TypeError",
          "None"
        ],
        "answer": "True"
      },
      {
        "type": "match",
        "question": "Match each Python type to its memory behavior:",
        "pairs": {
          "int": "Arbitrary precision, never overflows",
          "float": "IEEE 754 double-precision, 64-bit",
          "str": "Immutable sequence of Unicode code points",
          "tuple": "Immutable, hashable sequence type"
        }
      }
    ]
  },
  "p1-decorators": {
    "theory": "Decorators are a powerful Python feature that allows modifying or enhancing functions or methods without changing their source code. A decorator is a callable (usually a function) that takes another function as an argument and returns a replacement function. The @decorator syntax is syntactic sugar for func = decorator(func). Decorators enable cross-cutting concerns like logging, timing, authentication, caching, and validation to be applied declaratively.\n\nClosures are the foundation of decorators. A closure is a nested function that captures variables from its enclosing scope, which remain accessible even after the outer function has finished executing. The captured variables are stored in the function's __closure__ attribute as cell objects. Closures enable decorators to maintain state across calls (e.g., call counters, cached values) and to parameterize behavior (e.g., passing arguments to decorators).\n\nCommon decorator patterns include: simple decorators (wrapping without arguments), parameterized decorators (@decorator(args) using a factory), decorators with state (using closures to maintain counters/caches), class-based decorators (implementing __call__), and decorators that preserve metadata (using @functools.wraps). The built-in decorators include @property, @staticmethod, @classmethod, and @functools.cache (Python 3.9+).\n\nDecorators can be stacked (multiple @ lines above a function) and apply bottom-up: the lowest decorator runs first, and each subsequent decorator wraps the previous result. Stacking is commonly used in ML frameworks: @torch.no_grad() combined with @torch.compile() and custom validation decorators.\n\nFor AI/ML work, decorators are extensively used: @torch.compile() optimizes model forward passes, @timer decorators benchmark training steps, @validate decorators check data shapes, @cache decorators memoize expensive preprocessing, and @register decorators add models/optimizers/schedulers to registries. Understanding decorators is essential for working with PyTorch Lightning callbacks, TensorFlow Keras layers, and ML experiment tracking frameworks.",
    "keyDefinitions": [
      {
        "term": "Decorator",
        "definition": "A callable that accepts a function or class and returns a modified version, applied with @ syntax.",
        "example": "@timer; def train(): ... is equivalent to train = timer(train) where timer wraps with timing logic."
      },
      {
        "term": "Closure",
        "definition": "A nested function that captures and retains references to variables from its enclosing lexical scope even after the outer function returns.",
        "example": "def outer(x): def inner(y): return x + y; return inner; add5 = outer(5); add5(3) returns 8."
      },
      {
        "term": "functools.wraps",
        "definition": "A decorator that copies metadata (__name__, __doc__, __module__, __annotations__) from the original function to the wrapper, preserving introspection.",
        "example": "@functools.wraps(func) on the wrapper ensures wrapper.__name__ == func.__name__ instead of 'wrapper'."
      },
      {
        "term": "Parameterized Decorator",
        "definition": "A decorator that accepts arguments, implemented as a factory function returning a decorator.",
        "example": "@repeat(n=3); def greet(): ... applies the function 3 times, implemented via def repeat(n): return lambda func: wrapper."
      }
    ],
    "formulas": [
      {
        "title": "Decorator Equivalence",
        "formula": "@D\ndef F(): pass\n= F = D(F)",
        "explanation": "The @decorator syntax is syntactic sugar. The decorator D is called with the original function F as its argument, and the return value replaces F in the current namespace. D(F) must return a callable (usually a wrapper function).",
        "example": "@log_calls\ndef add(a, b): return a + b\n# Equivalent to: add = log_calls(add)"
      },
      {
        "title": "Parameterized Decorator",
        "formula": "@D(args)\ndef F(): pass\n= F = D(args)(F)",
        "explanation": "A parameterized decorator D(args) is called first with the arguments, returning the actual decorator. That decorator is then applied to the function F. This two-level nesting enables configurable decorators.",
        "example": "@repeat(3)\ndef hi(): print('hi')\n# Equivalent to: hi = repeat(3)(hi)"
      }
    ],
    "whyItMatters": "Decorators are ubiquitous in ML frameworks. PyTorch's @torch.no_grad() disables gradient tracking during inference. @torch.compile() JIT-compiles model forward passes. TensorFlow's @tf.function compiles Python functions into graph operations. Experiment trackers use @log_metrics decorators. Custom decorators implement timing, caching, retry logic, and input validation. Understanding decorators allows ML engineers to create clean, reusable, and composable code for training and inference pipelines.",
    "architecture": {
      "title": "Python Decorator Execution Flow",
      "description": "How decorators wrap functions and the execution flow through nested wrapper layers.",
      "blocks": [
        {
          "label": "Function Definition",
          "description": "def func(): ... creates the original function object in memory"
        },
        {
          "label": "Decorator Application",
          "description": "@decorator calls decorator(func), which returns the wrapper function"
        },
        {
          "label": "Name Re-binding",
          "description": "The wrapper function replaces func in the namespace (func = wrapper)"
        },
        {
          "label": "Call-time Flow",
          "description": "func() actually calls wrapper(), which executes its logic, calls the original func, and returns"
        },
        {
          "label": "Stacked Decorators",
          "description": "@A; @B; def F: ... becomes F = A(B(F)), with B applied first, then A"
        }
      ]
    },
    "understanding": {
      "analogy": "Decorators are like customizing a food order at a restaurant. The base function (def burger():) is a plain burger. A decorator @with_cheese is like adding cheese—you get back an enhanced burger that still has all the original burger properties but with added cheese. @with_bacon stacks on top. When you 'call' the burger (eat it), you get the fully customized version. The restaurant doesn't change the original recipe—they just wrap it. Closures are like customizing your regular order: the waiter remembers 'the usual' (captured variable) and applies it automatically every time you visit.",
      "steps": [
        {
          "title": "Write Simple Wrapper Decorators",
          "content": "Create a function that takes a function, defines an inner wrapper(*args, **kwargs), adds pre/post logic, calls the original, and returns the result. Apply with @decorator_name."
        },
        {
          "title": "Preserve Metadata with @functools.wraps",
          "content": "Always apply @functools.wraps(func) to the wrapper function. This copies func.__name__, __doc__, __module__ so debugging and documentation tools work correctly."
        },
        {
          "title": "Create Parameterized Decorators",
          "content": "Build a three-level decorator: outer function takes arguments, returns a decorator function (takes func), which returns the wrapper. Supports @decorator(arg1, arg2)."
        },
        {
          "title": "Build Class-Based Decorators",
          "content": "Implement __call__ on a class to make it a decorator. Use __init__ to store the decorated function or configuration. Useful for stateful decorators (counters, accumulators)."
        },
        {
          "title": "Understand Closure Cell Variables",
          "content": "Access captured variables via wrapper.__closure__ tuple of cell objects. Each cell has .cell_contents. This is how decorators remember configuration and state across calls."
        }
      ],
      "misconceptions": [
        {
          "misconception": "Decorators can only be applied to functions.",
          "truth": "Decorators can be applied to classes too (@dataclass, @functools.total_ordering). Class decorators receive the class as argument and return a modified class. Functions are just the most common target."
        },
        {
          "misconception": "The @ syntax changes the function at call time.",
          "truth": "Decorators are applied at definition time (when the module is imported), not at call time. The wrapper replaces the original function at definition, and all subsequent calls go through the wrapper."
        }
      ]
    },
    "codeExamples": [
      {
        "level": "basic",
        "code": "# Simple decorator with and without @functools.wraps\nimport functools\nimport time\n\n# Without wraps (metadata lost)\ndef timer_bare(func):\n    def wrapper(*args, **kwargs):\n        start = time.perf_counter()\n        result = func(*args, **kwargs)\n        elapsed = time.perf_counter() - start\n        print(f\"{func.__name__} took {elapsed:.4f}s\")\n        return result\n    return wrapper\n\n# With wraps (metadata preserved)\ndef timer(func):\n    @functools.wraps(func)\n    def wrapper(*args, **kwargs):\n        start = time.perf_counter()\n        result = func(*args, **kwargs)\n        elapsed = time.perf_counter() - start\n        print(f\"{func.__name__} took {elapsed:.4f}s\")\n        return result\n    return wrapper\n\n@timer\ndef compute_squares(n):\n    \"\"\"Compute squares up to n.\"\"\"\n    return [x**2 for x in range(n)]\n\nresult = compute_squares(10000)\nprint(f\"Function name: {compute_squares.__name__}\")\nprint(f\"Docstring: {compute_squares.__doc__}\")",
        "output": "compute_squares took 0.0012s\nFunction name: compute_squares\nDocstring: Compute squares up to n.",
        "explanation": "The timer decorator wraps compute_squares with timing logic. @functools.wraps preserves the original function's __name__ and __doc__, enabling proper introspection."
      },
      {
        "level": "intermediate",
        "code": "# Parameterized decorator and stateful decorator\nimport functools\n\ndef repeat(n=1):\n    \"\"\"Parameterized decorator: repeat function n times.\"\"\"\n    def decorator(func):\n        @functools.wraps(func)\n        def wrapper(*args, **kwargs):\n            results = []\n            for _ in range(n):\n                results.append(func(*args, **kwargs))\n            return results\n        return wrapper\n    return decorator\n\n@repeat(n=3)\ndef greet(name):\n    return f\"Hello, {name}!\"\n\nprint(greet(\"Alice\"))\n\n# Stateful decorator with closure\nimport functools\n\ndef count_calls(func):\n    @functools.wraps(func)\n    def wrapper(*args, **kwargs):\n        wrapper.calls += 1\n        print(f\"Call #{wrapper.calls} to {func.__name__}\")\n        return func(*args, **kwargs)\n    wrapper.calls = 0\n    return wrapper\n\n@count_calls\ndef say_hi(name):\n    return f\"Hi {name}!\"\n\nprint(say_hi(\"Bob\"))\nprint(say_hi(\"Charlie\"))\nprint(f\"Total calls: {say_hi.calls}\")",
        "output": "Hello, Alice!\nHello, Alice!\nHello, Alice!\n\nCall #1 to say_hi\nHi Bob!\nCall #2 to say_hi\nHi Charlie!\nTotal calls: 2",
        "explanation": "Parameterized decorator @repeat(n=3) uses a factory function returning the actual decorator. Stateful decorator count_calls attaches state (calls counter) to the wrapper function itself, accessible as wrapper.calls."
      },
      {
        "level": "advanced",
        "code": "# Class-based decorator and stacked decorators\nimport functools\nimport time\n\nclass Timer:\n    \"\"\"Class-based decorator with state.\"\"\"\n    def __init__(self, unit='s'):\n        self.unit = unit\n        self.times = []\n\n    def __call__(self, func):\n        @functools.wraps(func)\n        def wrapper(*args, **kwargs):\n            start = time.perf_counter()\n            result = func(*args, **kwargs)\n            elapsed = time.perf_counter() - start\n            self.times.append(elapsed)\n            print(f\"{func.__name__}: {elapsed:.4f}{self.unit}\")\n            return result\n        wrapper._decorator = self\n        return wrapper\n\n    def stats(self):\n        import statistics\n        return {\n            'count': len(self.times),\n            'mean': statistics.mean(self.times),\n            'total': sum(self.times),\n        }\n\ntimer = Timer()\n\n@timer\ndef process(data):\n    time.sleep(0.01)  # simulate work\n    return sum(data)\n\nprint(f\"Result: {process([1,2,3])}\")\nprint(f\"Result: {process([4,5,6])}\")\nprint(f\"Timer stats: {timer.stats()}\")\n\n# Stacked decorators\ndef bold(func):\n    @functools.wraps(func)\n    def wrapper():\n        return f\"<b>{func()}</b>\"\n    return wrapper\n\ndef italic(func):\n    @functools.wraps(func)\n    def wrapper():\n        return f\"<i>{func()}</i>\"\n    return wrapper\n\n@bold\n@italic\ndef html_greeting():\n    return \"Hello!\"\n\nprint(f\"Stacked: {html_greeting()}\")\n# Equivalent to: html_greeting = bold(italic(html_greeting))",
        "output": "process: 0.0101s\nResult: 6\nprocess: 0.0102s\nResult: 15\nTimer stats: {'count': 2, 'mean': 0.01015, 'total': 0.0203}\nStacked: <b><i>Hello!</i></b>",
        "explanation": "Class-based Timer decorator stores call times and provides stats(). Stacked decorators @bold @italic apply bottom-up: italic wraps first, then bold wraps the result. Equivalent to bold(italic(html_greeting))."
      }
    ],
    "realWorld": {
      "useCases": [
        {
          "industry": "Web Frameworks",
          "description": "Flask/FastAPI route decorators: @app.get('/path'), @app.post('/path'). Authentication: @login_required. Validation: @validate_request(schema)."
        },
        {
          "industry": "ML Frameworks",
          "description": "PyTorch: @torch.no_grad(), @torch.compile(). TensorFlow: @tf.function. Caching: @functools.cache on expensive preprocessing."
        },
        {
          "industry": "Logging & Monitoring",
          "description": "@log_calls, @timer, @track_memory. Experiment tracking: @log_to_mlflow, @log_params. Error handling: @retry(max_attempts=3)."
        }
      ],
      "caseStudy": {
        "problem": "An ML research team had timing, logging, and validation code duplicated across 200+ training and evaluation functions. Adding monitoring required modifying every function signature.",
        "solution": "Created a library of reusable decorators: @timer (execution time), @log_args (input/output logging), @validate_tensors (NaN/Inf checks), @device_aware (auto device placement). Applied them as stacked annotations on each function.",
        "results": "Boilerplate reduced by 70%. New monitoring features could be added by adding a single decorator line. Stacking decorators enabled composable behavior (e.g., @timer @log_args @validate_tensors all on one function)."
      },
      "bestPractices": [
        "Always use @functools.wraps to preserve metadata",
        "Keep decorators focused on a single responsibility",
        "Use parameterized decorators for configurable behavior",
        "Use class-based decorators for stateful operations",
        "Document what each decorator adds/modifies clearly",
        "Stack decorators thoughtfully—order matters",
        "Test decorators in isolation and in combination"
      ],
      "tools": [
        "functools.wraps — Preserve function metadata in wrappers",
        "functools.lru_cache — LRU caching decorator for expensive functions",
        "functools.cache — Unlimited caching decorator (Python 3.9+)",
        "functools.singledispatch — Single-dispatch generic function decorator",
        "contextlib.contextmanager — Decorator to make generators into context managers",
        "dataclasses.dataclass — Class decorator auto-generating __init__ and __repr__",
        "property — Built-in decorator making method act as attribute"
      ],
      "jobRoles": [
        "ML Engineer — Uses @torch.no_grad(), @torch.compile(), custom training decorators",
        "Backend Developer — Implements @auth, @rate_limit, @validate, @cache decorators for APIs",
        "Python Library Author — Creates reusable decorators for public libraries",
        "DevOps Engineer — Writes @timer, @retry, @log decorators for infrastructure code",
        "Data Engineer — Applies @validate, @transform, @cache to ETL pipeline functions"
      ],
      "furtherReading": [
        {
          "title": "PEP 318 — Decorators for Functions and Methods",
          "url": "https://peps.python.org/pep-0318/"
        },
        {
          "title": "Primer on Python Decorators",
          "url": "https://realpython.com/primer-on-python-decorators/"
        },
        {
          "title": "Python Closures Explained",
          "url": "https://www.programiz.com/python-programming/closure"
        },
        {
          "title": "functools module documentation",
          "url": "https://docs.python.org/3/library/functools.html"
        }
      ]
    },
    "quiz": [
      {
        "type": "mcq",
        "question": "What does @decorator def f(): ... actually do?",
        "options": [
          "f = decorator(f)",
          "f = f(decorator)",
          "decorator = f(decorator)",
          "decorator(f) is called at runtime"
        ],
        "answer": "f = decorator(f)"
      },
      {
        "type": "truefalse",
        "question": "Decorators are applied at function call time, not definition time.",
        "answer": "False"
      },
      {
        "type": "fillblank",
        "question": "The _____ decorator from functools preserves a function's metadata in the wrapper.",
        "answer": "wraps"
      },
      {
        "type": "code",
        "question": "With @A @B def f(): pass, which decorator applies first?",
        "options": [
          "A applies first",
          "B applies first",
          "Both simultaneously",
          "Depends on Python version"
        ],
        "answer": "B applies first"
      },
      {
        "type": "match",
        "question": "Match built-in decorator to purpose:",
        "pairs": {
          "@property": "Method acts as attribute",
          "@staticmethod": "Method without self/instance",
          "@classmethod": "Method receives class not instance",
          "@functools.cache": "Memoize function results"
        }
      }
    ]
  },
  "p1-exception-handling": {
    "theory": "Exception handling in Python manages runtime errors gracefully using try/except/else/finally blocks. When an error occurs, Python raises an exception (an object that inherits from BaseException). If not caught, the exception propagates up the call stack until caught by an except block, or terminates the program if unhandled. Python's exception hierarchy is deep and specific, allowing precise error handling.\n\nThe try block contains code that might raise an exception. except blocks catch specific exception types (or use bare except: which catches everything—discouraged). Multiple except blocks can handle different exception types differently. The else block runs only if no exception was raised—useful for code that should execute only on success. The finally block always runs (even if an exception or return statement occurs), making it ideal for cleanup operations.\n\nRaising exceptions explicitly with the raise statement communicates error conditions. Custom exceptions are defined by subclassing Exception (not BaseException). Exception chaining (raise ... from ...) preserves the original exception context, showing both the cause and the new exception in the traceback. The raise ... from None pattern suppresses the chain for cases where the cause is unimportant.\n\nPython's exception hierarchy includes built-in exceptions like TypeError (wrong type), ValueError (invalid value for type), IndexError (sequence index out of range), KeyError (dict key not found), FileNotFoundError (file missing), and RuntimeError (general error). The hierarchy lets you catch broad categories (Exception) or specific types (ValueError).\n\nFor AI/ML work, exception handling is critical for: handling missing data files, managing malformed input data, dealing with GPU out-of-memory errors, handling network timeouts during model serving, and graceful fallback when models fail to load. Custom ML exceptions (DataValidationError, ModelLoadError, ConvergenceError) make debugging and error reporting clearer.",
    "keyDefinitions": [
      {
        "term": "Exception Propagation",
        "definition": "The process where an unhandled exception travels up the call stack through calling functions until caught or reaching the top level (causing program termination).",
        "example": "def a(): b(); def b(): c(); def c(): 1/0 — zero division propagates from c() through b(), a() to the top level."
      },
      {
        "term": "Exception Chaining",
        "definition": "The mechanism where raising an exception from a caught exception preserves both tracebacks using raise ... from ..., or suppresses the chain with raise ... from None.",
        "example": "try: 1/0 except ZeroDivisionError as e: raise ValueError('Invalid math') from e — shows both tracebacks."
      },
      {
        "term": "Else Clause (try/except)",
        "definition": "An optional block after all except clauses that executes only when no exception was raised in the try block.",
        "example": "try: x = int('42') except ValueError: print('invalid') else: print(f'got {x}') — prints 'got 42' since no exception."
      },
      {
        "term": "EAFP vs LBYL",
        "definition": "EAFP (Easier to Ask Forgiveness than Permission) tries an operation and catches exceptions; LBYL (Look Before You Leap) checks conditions first. Python prefers EAFP.",
        "example": "EAFP: try: d['key'] except KeyError vs LBYL: if 'key' in d: d['key'] — EAFP is idiomatic Python."
      }
    ],
    "formulas": [
      {
        "title": "Exception Propagation Path",
        "formula": "raise E -> frame_n.__exit__? -> ... -> frame_0.__exit__? -> sys.excepthook -> stderr + exit",
        "explanation": "When an exception E is raised, Python walks up the call stack checking each frame for a matching except clause. If none found, sys.excepthook is called (which prints the traceback and exits). The raise statement can be at any nesting depth.",
        "example": "def inner(): 1/0; def outer(): inner(); outer() — ZeroDivisionError propagates from inner to outer to module level to sys.excepthook."
      },
      {
        "title": "Control Flow with try/except/else/finally",
        "formula": "try: A → no_exception? → else: B\n      → exception? → except: C\n      always → finally: D",
        "explanation": "The try block executes A. If no exception, B runs after A, then D always runs. If exception occurs in A, C runs (if type matches), then D always runs. D executes regardless of return/break/continue in other blocks.",
        "example": "def f(): try: return 1 finally: print('cleanup') — prints 'cleanup' before returning 1."
      }
    ],
    "whyItMatters": "Exception handling is essential for robust AI/ML systems. Training pipelines must handle corrupted data files without crashing mid-epoch. Model serving APIs need graceful error responses instead of 500 errors. GPU out-of-memory must be caught to trigger batch size reduction. Data validation failures should produce clear error messages for debugging. Python's EAFP idiom makes ML preprocessing code cleaner—try the operation, handle the failure, rather than checking every precondition.",
    "architecture": {
      "title": "Python Exception Handling Internals",
      "description": "How CPython manages exception state through the interpreter's block stack and thread state.",
      "blocks": [
        {
          "label": "Thread State (PyThreadState)",
          "description": "Stores curexc_type, curexc_value, curexc_traceback for the current exception"
        },
        {
          "label": "Frame's f_exc_type/value/tb",
          "description": "Per-frame exception state; restored on frame exit for chaining"
        },
        {
          "label": "Block Stack (try/except/finally)",
          "description": "Each try/except/finally pushes a block entry; on exception, unwinds blocks until matching handler"
        },
        {
          "label": "SETUP_EXCEPT / SETUP_FINALLY",
          "description": "Bytecode instructions that push exception/finally handlers onto the block stack"
        },
        {
          "label": "Traceback Objects",
          "description": "Linked list of frame references showing the call path at exception time"
        }
      ]
    },
    "understanding": {
      "analogy": "Exception handling is like a building's fire safety system. The try block is a room where something might catch fire (error). The except blocks are fire extinguishers for specific types of fires—a CO2 extinguisher for electrical fires (ValueError), water for paper fires (KeyError). Multiple except blocks are like having different extinguishers for different fire types. The else block is the 'all clear' signal that sounds only if no fire occurred. The finally block is the building's automatic sprinkler system—it activates regardless of whether there was a fire, ensuring any remaining damage is contained. Raising an exception is like pulling the fire alarm—the alarm propagates through the building (call stack) until someone responds.",
      "steps": [
        {
          "title": "Use Specific Exception Types",
          "content": "Catch specific exceptions (ValueError, KeyError, TypeError) not bare except:. Use except Exception as e: for catching all application errors without suppressing SystemExit."
        },
        {
          "title": "Structure try/except/else/finally Properly",
          "content": "Keep try blocks minimal (only the error-prone code). Use else for success-only code. Use finally for cleanup that must always run."
        },
        {
          "title": "Create Custom Exceptions",
          "content": "Subclass Exception: class DataValidationError(Exception): pass. Add meaningful __init__ with error context. Use specific names like ModelLoadError, ConfigError."
        },
        {
          "title": "Use Exception Chaining Effectively",
          "content": "Use raise NewError('msg') from original_exception to chain errors. Use raise ... from None to suppress chaining when the cause is obvious or uninformative."
        },
        {
          "title": "Follow EAFP Idiom",
          "content": "Try the operation and catch exceptions rather than checking with if statements. Example: try: return d['key'] except KeyError: return default instead of if 'key' in d: return d['key'] else: return default."
        }
      ],
      "misconceptions": [
        {
          "misconception": "Bare except: catches all exceptions including KeyboardInterrupt and SystemExit.",
          "truth": "Bare except: catches BaseException, which includes SystemExit, KeyboardInterrupt, and GeneratorExit. Always use except Exception: unless you specifically need to catch those."
        },
        {
          "misconception": "A finally block can't affect the return value.",
          "truth": "If the finally block has a return statement, it overrides any return from try/except/else blocks. The finally return value becomes the function's return value."
        }
      ]
    },
    "codeExamples": [
      {
        "level": "basic",
        "code": "# Basic try/except/else/finally\nimport sys\n\ndef safe_divide(a, b):\n    try:\n        result = a / b\n    except ZeroDivisionError:\n        print(\"Error: Cannot divide by zero\")\n        return None\n    except TypeError as e:\n        print(f\"Type error: {e}\")\n        return None\n    else:\n        print(f\"Division successful: {result}\")\n        return result\n    finally:\n        print(f\"  (cleanup: a={a}, b={b})\")\n\nprint(f\"Result 1: {safe_divide(10, 2)}\")\nprint()\nprint(f\"Result 2: {safe_divide(10, 0)}\")\nprint()\nprint(f\"Result 3: {safe_divide('10', 2)}\")",
        "output": "Division successful: 5.0\n  (cleanup: a=10, b=2)\nResult 1: 5.0\n\nError: Cannot divide by zero\n  (cleanup: a=10, b=0)\nResult 2: None\n\nType error: unsupported operand type(s) for /: 'str' and 'int'\n  (cleanup: a=10, b=2)\nResult 3: None",
        "explanation": "try catches ZeroDivisionError and TypeError separately. else runs only on success. finally always runs (prints cleanup). Functions return None when exception caught, or the result on success."
      },
      {
        "level": "intermediate",
        "code": "# Custom exceptions and exception chaining\nclass DataValidationError(Exception):\n    def __init__(self, field, value, message):\n        self.field = field\n        self.value = value\n        self.message = message\n        super().__init__(f\"Validation failed for {field}={value!r}: {message}\")\n\nclass DataPipelineError(Exception):\n    pass\n\ndef validate_age(age):\n    if not isinstance(age, (int, float)):\n        raise DataValidationError('age', age, 'must be numeric')\n    if age < 0:\n        raise DataValidationError('age', age, 'cannot be negative')\n    if age > 150:\n        raise DataValidationError('age', age, 'unrealistic value')\n    return float(age)\n\ndef process_record(record):\n    try:\n        age = validate_age(record.get('age'))\n        return {'validated_age': age}\n    except DataValidationError as e:\n        raise DataPipelineError(\"Record processing failed\") from e\n\ndef process_batch(records):\n    results = []\n    for record in records:\n        try:\n            results.append(process_record(record))\n        except DataPipelineError:\n            results.append({'error': record})\n            print(f\"Skipping invalid record: {record}\")\n    return results\n\nrecords = [{'age': 25}, {'age': -5}, {'age': 'unknown'}, {'age': 200}]\noutput = process_batch(records)\nprint(f\"Processed {len(output)} records\")",
        "output": "Skipping invalid record: {'age': -5}\nSkipping invalid record: {'age': 'unknown'}\nSkipping invalid record: {'age': 200}\nProcessed 4 records",
        "explanation": "Custom DataValidationError provides structured error info. Exception chaining (raise ... from e) preserves the original error context. process_batch gracefully handles per-record failures without stopping the entire batch."
      },
      {
        "level": "advanced",
        "code": "# Context manager for exception handling and sys.excepthook\nimport sys\nimport traceback\n\n# Custom exception hook for logging\ndef global_exception_handler(exc_type, exc_value, exc_tb):\n    if issubclass(exc_type, KeyboardInterrupt):\n        sys.__excepthook__(exc_type, exc_value, exc_tb)\n        return\n    print(f\"[GLOBAL HANDLER] {exc_type.__name__}: {exc_value}\")\n    print(\"  Traceback details:\", ''.join(traceback.format_tb(exc_tb)))\n\nsys.excepthook = global_exception_handler\n\n# Context manager for suppressing and logging\ndef suppress_and_log(*exceptions, logger=print):\n    try:\n        yield\n    except exceptions as e:\n        logger(f\"[SUPPRESSED] {type(e).__name__}: {e}\")\n    except Exception as e:\n        logger(f\"[UNEXPECTED] {type(e).__name__}: {e}\")\n        raise\n\n# Context manager with exception monitoring\nimport contextlib\n\n@contextlib.contextmanager\ndef exception_monitor(context_name):\n    try:\n        yield\n    except Exception as e:\n        print(f\"[MONITOR] Exception in {context_name}: {type(e).__name__}: {e}\")\n        raise\n\ndef risky_operation():\n    raise RuntimeError(\"Unexpected failure\")\n\n# Usage\nwith exception_monitor(\"data_loading\"):\n    risky_operation()\n\n# This would trigger the global handler for uncaught:\n# unhandled_error()  # would call sys.excepthook",
        "output": "[MONITOR] Exception in data_loading: RuntimeError: Unexpected failure\nTraceback (most recent call last):\n  ...\nRuntimeError: Unexpected failure",
        "explanation": "sys.excepthook replaces the default unhandled exception handler for centralized logging. contextlib-based context managers provide reusable exception handling patterns. exception_monitor wraps any code block with pre/post exception logging."
      }
    ],
    "realWorld": {
      "useCases": [
        {
          "industry": "Data Pipelines",
          "description": "Per-record try/except to skip corrupted data without failing the entire batch. Custom exceptions for validation, schema mismatch, and data quality issues."
        },
        {
          "industry": "API Development",
          "description": "Try/except in request handlers returning appropriate HTTP status codes. Custom HTTPError(StatusCodeError) with chained original exception."
        },
        {
          "industry": "ML Serving",
          "description": "Catch model inference errors (OOM, NaN predictions) with graceful fallback. Custom ModelLoadError, PredictionError for monitoring."
        }
      ],
      "caseStudy": {
        "problem": "A batch ML inference pipeline processing 10M records would crash entirely on a single malformed input record, wasting hours of compute and requiring manual restart.",
        "solution": "Implemented per-record try/except wrappers around the inference function. Malformed records were logged with full traceback and skipped. Custom exception classes (ValidationError, InferenceError) categorized failures. A finally block ensured checkpoint saving even when batches failed.",
        "results": "Pipeline robustness went from 0-tolerance to processing >99.9% of records successfully even with noisy data. Operations team could inspect failure logs and fix data issues without restarts. Saved ~20 hours/week of wasted compute."
      },
      "bestPractices": [
        "Catch specific exception types, never bare except:",
        "Keep try blocks minimal—only the code that might fail",
        "Use custom exceptions for domain-specific errors",
        "Use exception chaining (raise ... from) to preserve context",
        "Log exceptions with tracebacks for debugging",
        "Prefer EAFP (try/except) over LBYL (if checks) in Python",
        "Don't silence exceptions silently—at minimum log them"
      ],
      "tools": [
        "builtins — Exception, BaseException, standard exception hierarchy",
        "traceback — Format and print exception tracebacks: format_exc(), print_exc()",
        "logging.exception() — Log exceptions with full traceback at ERROR level",
        "sys.excepthook — Global handler for unhandled exceptions",
        "warnings — Non-fatal alert system for deprecations and recoverable issues",
        "contextlib.suppress — Context manager to ignore specific exceptions",
        "faulthandler — Dump Python tracebacks on segfaults and timeout signals"
      ],
      "jobRoles": [
        "Backend Developer — Implements robust error handling in API endpoints and services",
        "Data Engineer — Builds fault-tolerant ETL pipelines with per-record error handling",
        "ML Engineer — Handles model loading, inference, and training errors gracefully",
        "DevOps/SRE — Monitors application health via exception logging and alerting",
        "Librarian — Defines clean exception hierarchies for library APIs"
      ],
      "furtherReading": [
        {
          "title": "PEP 3134 — Exception Chaining",
          "url": "https://peps.python.org/pep-3134/"
        },
        {
          "title": "Python Exception Hierarchy",
          "url": "https://docs.python.org/3/library/exceptions.html"
        },
        {
          "title": "Python EAFP vs LBYL",
          "url": "https://devblogs.microsoft.com/python/idiomatic-python-eafp-vs-lbyl/"
        },
        {
          "title": "Real Python: Exception Handling",
          "url": "https://realpython.com/python-exceptions/"
        }
      ]
    },
    "quiz": [
      {
        "type": "mcq",
        "question": "Which block in try/except/else/finally always executes regardless of exceptions?",
        "options": [
          "try",
          "except",
          "else",
          "finally"
        ],
        "answer": "finally"
      },
      {
        "type": "truefalse",
        "question": "A bare 'except:' clause catches KeyboardInterrupt and SystemExit.",
        "answer": "True"
      },
      {
        "type": "fillblank",
        "question": "The _____ block in try/except executes only when no exception was raised.",
        "answer": "else"
      },
      {
        "type": "code",
        "question": "What does raise ValueError('bad') from None do?",
        "options": [
          "Raises with full chain",
          "Raises with suppressed chain",
          "Raises no exception",
          "Creates warning"
        ],
        "answer": "Raises with suppressed chain"
      },
      {
        "type": "match",
        "question": "Match exception to common cause:",
        "pairs": {
          "ValueError": "Invalid value for a type",
          "KeyError": "Missing dictionary key",
          "IndexError": "List index out of range",
          "TypeError": "Operation on wrong type"
        }
      }
    ]
  },
  "p1-file-io": {
    "theory": "File I/O in Python handles reading from and writing to files on disk. The built-in open() function returns a file object that provides methods for reading (read(), readline(), readlines()) and writing (write(), writelines()). Python supports text mode ('r', 'w', 'a', 'x') and binary mode ('rb', 'wb', 'ab') for different file types. The encoding parameter specifies character encoding (default is platform-dependent, but 'utf-8' is recommended).\n\nContext managers, implemented with the with statement, are the recommended way to handle file I/O. The with statement automatically acquires and releases resources—it calls __enter__() at the start and __exit__() at the end of the block, ensuring the file is properly closed even if an exception occurs. This eliminates the need for explicit try/finally blocks for resource cleanup.\n\nCustom context managers can be created using a class with __enter__ and __exit__ methods, or more concisely using the @contextmanager decorator from contextlib with a generator function that yields at the resource acquisition point. The contextlib module also provides useful utilities: closing() (call close on objects), suppress() (ignore specific exceptions), redirect_stdout() (temporarily redirect output), and ExitStack (manage multiple context managers dynamically).\n\nFile operations in Python include reading entire files at once (suitable for small files), reading line by line (for large files), reading fixed-size chunks, and using seek()/tell() for random access. The pathlib module provides an object-oriented interface for file system paths, making path manipulations more intuitive than os.path.\n\nFor AI/ML work, file I/O and context managers are essential for: reading training data from CSV/Parquet/JSON files, writing model checkpoints and logs, managing database connections, handling API sessions, and implementing resource cleanup in ML pipelines. The with statement is used universally in ML code for file operations, database connections, and GPU context management.",
    "keyDefinitions": [
      {
        "term": "Context Manager",
        "definition": "An object implementing __enter__() and __exit__() methods, used with the with statement to manage resources automatically.",
        "example": "with open('file.txt', 'r') as f: data = f.read() — file is automatically closed after the block."
      },
      {
        "term": "Binary vs Text Mode",
        "definition": "Text mode ('r', 'w') handles encoding/decoding and line ending translation. Binary mode ('rb', 'wb') reads/writes raw bytes without translation.",
        "example": "with open('image.jpg', 'rb') as f: raw_bytes = f.read() reads JPEG bytes without text encoding."
      },
      {
        "term": "@contextmanager Decorator",
        "definition": "A decorator from contextlib that converts a generator function with a single yield into a context manager.",
        "example": "@contextmanager; def managed_resource(): resource = acquire(); yield resource; resource.release()"
      },
      {
        "term": "pathlib.Path",
        "definition": "An object-oriented interface for filesystem paths introduced in Python 3.4, providing methods for path manipulation and file operations.",
        "example": "from pathlib import Path; p = Path('data') / 'subdir' / 'file.csv'; content = p.read_text()"
      }
    ],
    "formulas": [
      {
        "title": "Context Manager Lifecycle",
        "formula": "with EXPR as VAR:\n    BLOCK\n= VAR = EXPR.__enter__()\n  try: BLOCK\n  finally: EXPR.__exit__(type, val, tb)",
        "explanation": "The with statement is equivalent to calling __enter__() on the context manager, executing the block inside a try, and always calling __exit__() in the finally clause. This guarantees cleanup even if BLOCK raises an exception.",
        "example": "with open('f.txt') as f: data = f.read() is equivalent to f = open('f.txt').__enter__(); try: data = f.read(); finally: f.__exit__(...)"
      },
      {
        "title": "Pathlib Path Operations",
        "formula": "Path(root) / 'sub' / 'file.ext'\n= Path(root + '\\' + 'sub' + '\\' + 'file.ext')",
        "explanation": "The / operator on Path objects joins path components using the platform-appropriate separator (backslash on Windows, forward slash on Unix). This is more readable and safer than string concatenation with os.path.join().",
        "example": "Path('data') / 'train' / 'images' / 'img001.png' resolves to data/train/images/img001.png on Linux."
      }
    ],
    "whyItMatters": "AI/ML work is data-intensive—every project involves reading datasets, writing model checkpoints, logging metrics, and saving results. Context managers with the with statement are the standard pattern for all resource management in ML frameworks. PyTorch uses with torch.no_grad(): for inference, with torch.cuda.amp.autocast(): for mixed precision. TensorFlow uses with tf.device('/GPU:0'): for device placement. Proper file I/O ensures data integrity and reproducible experiments.",
    "architecture": {
      "title": "Python File Object and Context Manager Architecture",
      "description": "How file objects implement the context manager protocol and the buffered I/O stack.",
      "blocks": [
        {
          "label": "open() function",
          "description": "Returns a file object based on mode: TextIOWrapper (text) or BufferedRandom/BufferedReader/BufferedWriter (binary)"
        },
        {
          "label": "Buffered I/O Layer",
          "description": "BufferedIOBase subclasses manage internal buffer (default 8192 bytes) reducing system calls"
        },
        {
          "label": "Raw I/O (FileIO)",
          "description": "Raw binary stream making direct OS system calls (read/write) via file descriptor"
        },
        {
          "label": "Context Manager Protocol",
          "description": "__enter__ returns self (the file object); __exit__ calls self.close()"
        },
        {
          "label": "Text Encoding Layer",
          "description": "TextIOWrapper encodes/decodes between str and bytes using specified encoding (default: locale)"
        }
      ]
    },
    "understanding": {
      "analogy": "File I/O with context managers is like borrowing a book from a library. open() is like checking out the book—you get a receipt (file object) showing what you borrowed. The with block is the reading period. When the with block ends (even if you spill coffee on the book!), the library's __exit__ mechanism automatically returns the book—you don't need to remember to return it manually. Without with, you'd need to write try: read book; finally: return book—easy to forget the return step, especially when errors occur.",
      "steps": [
        {
          "title": "Read Files with Context Managers",
          "content": "Use with open('file.txt', 'r') as f: content = f.read() for small files. Use for line in f: for large files. Always specify encoding='utf-8'."
        },
        {
          "title": "Write Files Safely",
          "content": "Use 'w' mode (overwrites) or 'a' mode (appends). Use 'x' mode for exclusive creation (raises FileExistsError if file exists). Write with f.write() or f.writelines()."
        },
        {
          "title": "Work with Binary Files",
          "content": "Use 'rb'/'wb' for images, audio, serialized data. Use struct module for binary data parsing. Use pickle for Python object serialization."
        },
        {
          "title": "Use pathlib for Paths",
          "content": "Use Path objects for cross-platform path manipulation. Methods: .read_text(), .write_text(), .iterdir(), .glob('*.txt'), .exists(), .mkdir(parents=True)."
        },
        {
          "title": "Create Custom Context Managers",
          "content": "Use @contextmanager decorator for simple cases: @contextmanager def managed(): ...; yield resource; ... cleanup. Use class-based for complex needs."
        }
      ],
      "misconceptions": [
        {
          "misconception": "File objects must be manually closed with f.close() after every read.",
          "truth": "Using with open(...) as f: automatically closes the file. Manual close() is only needed if you open without with. Try/finally is the fallback pattern."
        },
        {
          "misconception": "read() on a text file returns bytes.",
          "truth": "In text mode ('r'), read() returns str. In binary mode ('rb'), read() returns bytes. Python handles encoding/decoding transparently in text mode."
        }
      ]
    },
    "codeExamples": [
      {
        "level": "basic",
        "code": "# Basic file reading and writing with context managers\n# Writing to a file\nwith open('sample.txt', 'w', encoding='utf-8') as f:\n    f.write('Hello, World!\\n')\n    f.write('Second line\\n')\n    f.writelines(['Line 3\\n', 'Line 4\\n'])\n\n# Reading from a file\nwith open('sample.txt', 'r', encoding='utf-8') as f:\n    content = f.read()\n    print(f\"Full content:\\n{content}\")\n\n# Reading line by line (memory efficient)\nwith open('sample.txt', 'r', encoding='utf-8') as f:\n    print(\"Line by line:\")\n    for i, line in enumerate(f, 1):\n        print(f\"  {i}: {line.rstrip()}\")\n\n# Appending\nwith open('sample.txt', 'a', encoding='utf-8') as f:\n    f.write('Appended line\\n')\n\nimport os\nos.remove('sample.txt')  # cleanup",
        "output": "Full content:\nHello, World!\nSecond line\nLine 3\nLine 4\n\nLine by line:\n  1: Hello, World!\n  2: Second line\n  3: Line 3\n  4: Line 4",
        "explanation": "with statement ensures automatic file closure. write() and writelines() write content. read() loads entire file. Iterating over the file object reads line by line efficiently (no full load). 'a' mode appends."
      },
      {
        "level": "intermediate",
        "code": "# Context manager utilities and pathlib\nfrom contextlib import contextmanager, redirect_stdout, suppress\nfrom pathlib import Path\nimport io\n\n# Custom context manager with @contextmanager\n@contextmanager\ndef temporary_change(filename, mode='r'):\n    print(f\"Entering: opening {filename}\")\n    f = open(filename, mode)\n    try:\n        yield f\n    finally:\n        print(f\"Exiting: closing {filename}\")\n        f.close()\n\nwith temporary_change('temp_test.txt', 'w') as f:\n    f.write('Temporary content')\n\n# redirect_stdout\nbuffer = io.StringIO()\nwith redirect_stdout(buffer):\n    print(\"This goes to buffer\")\n    print(\"Not to console\")\noutput = buffer.getvalue()\nprint(f\"Captured: {output.strip()}\")\n\n# suppress - ignore specific exceptions\nwith suppress(FileNotFoundError):\n    Path('nonexistent.txt').read_text()\n    print(\"File not found exception was suppressed\")\n\n# pathlib operations\np = Path('.') / 'temp_test.txt'\nprint(f\"Path: {p.absolute()}\")\nprint(f\"Exists: {p.exists()}\")\nprint(f\"Size: {p.stat().st_size} bytes\")\np.unlink()  # delete\nprint(f\"Deleted, exists: {p.exists()}\")",
        "output": "Entering: opening temp_test.txt\nExiting: closing temp_test.txt\nCaptured: This goes to buffer\nNot to console\nFile not found exception was suppressed\nPath: D:\\Ajay\\ai-learning-hub\\temp_test.txt\nExists: False\nDeleted, exists: False",
        "explanation": "@contextmanager creates context managers from generators. redirect_stdout temporarily captures print() output. suppress ignores specific exceptions (cleaner than bare except). pathlib.Path provides object-oriented filesystem operations."
      },
      {
        "level": "advanced",
        "code": "# Binary file I/O and ExitStack for multiple resources\nimport struct\nfrom contextlib import ExitStack\n\n# Writing and reading binary data with struct\nvalues = (42, 3.14, True)\npacked = struct.pack('i d ?', *values)  # i=int, d=double, ?=bool\nprint(f\"Packed binary: {packed.hex()}\")\n\nwith open('binary.dat', 'wb') as f:\n    f.write(packed)\n\nwith open('binary.dat', 'rb') as f:\n    unpacked = struct.unpack('i d ?', f.read())\nprint(f\"Unpacked: {unpacked}\")\n\n# ExitStack for multiple context managers\ndef read_files(filenames):\n    \"\"\"Open multiple files safely with ExitStack.\"\"\"\n    with ExitStack() as stack:\n        files = [stack.enter_context(open(f, 'w')) for f in filenames]\n        for i, f in enumerate(files):\n            f.write(f\"Content for file {i}\\n\")\n        # All files auto-closed when ExitStack exits\n        print(f\"Opened {len(files)} files, all will auto-close\")\n\nread_files(['multi1.txt', 'multi2.txt', 'multi3.txt'])\n\n# Memory-mapped files for large data\nimport mmap\n# Create test file\nwith open('mmap_test.dat', 'wb') as f:\n    f.write(b'0' * 1024 * 1024)  # 1MB\n\nwith open('mmap_test.dat', 'r+b') as f:\n    with mmap.mmap(f.fileno(), 0) as mm:\n        mm[0:10] = b'FIRST10B..'\n        mm[100:110] = b'OFFSET100.'\n        print(f\"mmap[0:10]: {mm[0:10]}\")\n        print(f\"mmap[100:110]: {mm[100:110]}\")\n\n# Cleanup\nimport os\nfor f in ['binary.dat', 'multi1.txt', 'multi2.txt', 'multi3.txt', 'mmap_test.dat']:\n    if os.path.exists(f):\n        os.remove(f)",
        "output": "Packed binary: 2a000000000000001f85eb51b81e09400100000000000000\nUnpacked: (42, 3.1400000000000001, True)\nOpened 3 files, all will auto-close\nmmap[0:10]: b'FIRST10B..'\nmmap[100:110]: b'OFFSET100.'",
        "explanation": "struct packs/unpacks binary data with C-compatible formats. ExitStack manages multiple context managers dynamically (enter all, auto-exit all on block exit). mmap provides memory-mapped file I/O for large files—changes are written directly to the file via memory operations."
      }
    ],
    "realWorld": {
      "useCases": [
        {
          "industry": "Data Engineering",
          "description": "Reading large CSV/Parquet/Avro files chunk by chunk. Writing transformed data to output files. Managing database connection pools with context managers."
        },
        {
          "industry": "ML Training",
          "description": "Loading training data, writing model checkpoints with torch.save(), logging metrics to CSV/JSON, creating TensorBoard event files."
        },
        {
          "industry": "Configuration Management",
          "description": "Reading YAML/JSON/TOML config files using context managers. Writing experiment configs. Managing .env file loading."
        }
      ],
      "caseStudy": {
        "problem": "An ML training pipeline was losing hours of work when training jobs crashed mid-epoch—no checkpoints were saved, and output logs were truncated because file handles weren't properly flushed.",
        "solution": "Implemented context manager-based checkpointing: @contextmanager def checkpoint(model, path): ... yield ... save atomically via rename. Log files used LineBufferedFile context manager ensuring flush on each line. All file operations used with statements.",
        "results": "Checkpoint integrity was guaranteed—even on crash, last complete checkpoint was valid. Log files were never truncated. The team could resume from the last checkpoint losslessly, saving days of cumulative compute time."
      },
      "bestPractices": [
        "Always use with open(...) as f: for file operations",
        "Specify encoding='utf-8' explicitly—never trust platform defaults",
        "Use pathlib.Path instead of os.path for cross-platform code",
        "Use ExitStack for managing variable numbers of resources",
        "Prefer iterating over file objects over .readlines() for large files",
        "Use tempfile module for temporary files and directories",
        "Use shutil.copy2() for file copying (preserves metadata)"
      ],
      "tools": [
        "builtins.open — Standard file opening function with multiple modes",
        "pathlib — Object-oriented filesystem path manipulation",
        "contextlib — @contextmanager, ExitStack, redirect_stdout, suppress, closing",
        "io — StringIO (in-memory text streams), BytesIO (in-memory binary streams)",
        "tempfile — TemporaryFile, NamedTemporaryFile, TemporaryDirectory",
        "shutil — High-level file operations: copy, move, rmtree, make_archive",
        "mmap — Memory-mapped file I/O for large file random access"
      ],
      "jobRoles": [
        "Data Engineer — Builds ETL pipelines with robust file I/O and error handling",
        "ML Engineer — Implements checkpointing and data loading with proper resource management",
        "Backend Developer — Manages file uploads, logs, and configuration files",
        "DevOps Engineer — Writes deployment scripts with temp files and path management",
        "Systems Programmer — Works with binary file formats and memory-mapped I/O"
      ],
      "furtherReading": [
        {
          "title": "PEP 343 — The 'with' Statement",
          "url": "https://peps.python.org/pep-0343/"
        },
        {
          "title": "contextlib documentation",
          "url": "https://docs.python.org/3/library/contextlib.html"
        },
        {
          "title": "pathlib documentation",
          "url": "https://docs.python.org/3/library/pathlib.html"
        },
        {
          "title": "Real Python: Context Managers Guide",
          "url": "https://realpython.com/python-with-statement/"
        }
      ]
    },
    "quiz": [
      {
        "type": "mcq",
        "question": "What does the with statement automatically call when the block exits?",
        "options": [
          "__del__()",
          "__exit__()",
          "__close__()",
          "__clean__()"
        ],
        "answer": "__exit__()"
      },
      {
        "type": "truefalse",
        "question": "Reading a file in binary mode ('rb') returns str objects.",
        "answer": "False"
      },
      {
        "type": "fillblank",
        "question": "The _____ module provides an object-oriented interface for filesystem paths.",
        "answer": "pathlib"
      },
      {
        "type": "code",
        "question": "What does with suppress(FileNotFoundError): open('x.txt') do?",
        "options": [
          "Raises FileNotFoundError",
          "Silently ignores the error",
          "Creates the file",
          "Prints warning"
        ],
        "answer": "Silently ignores the error"
      },
      {
        "type": "match",
        "question": "Match file mode to behavior:",
        "pairs": {
          "'r'": "Read text (file must exist)",
          "'w'": "Write text (truncates existing)",
          "'a'": "Append to existing file",
          "'x'": "Exclusive creation (fail if exists)"
        }
      }
    ]
  },
  "p1-functions": {
    "theory": "Functions in Python are first-class objects, meaning they can be assigned to variables, passed as arguments, returned from other functions, and stored in data structures. A function is defined using the def keyword followed by a name, parameters in parentheses, and a colon-indented body. Functions without an explicit return statement return None. The lambda keyword creates anonymous inline functions limited to a single expression.\n\nPython supports several parameter passing modes: positional parameters, keyword arguments, default parameters, *args (variable positional arguments packed as a tuple), **kwargs (variable keyword arguments packed as a dict), positional-only parameters (before / in the signature), and keyword-only parameters (after *). Default parameter values are evaluated once at function definition time, not each call—a critical detail when using mutable defaults like lists or dicts.\n\nScope in Python follows the LEGB rule: Local, Enclosing (of outer functions), Global, Built-in. The global keyword allows writing to global variables from within a function, and nonlocal allows writing to variables in enclosing function scopes (closures). Python does not have block-level scope—variables created in if, for, or while blocks are visible throughout the enclosing function.\n\nFunctions are the primary unit of code reuse and abstraction in Python. They enable decomposition of complex problems into manageable pieces, facilitate testing through isolation, and support higher-order programming patterns like decorators, partial application, and callbacks. Type hints document expected parameter and return types, enabling static analysis with tools like mypy.\n\nFor AI/ML work, functions organize preprocessing steps, model configurations, metrics computation, and training loops. Understanding *args and **kwargs is essential for wrapping library functions and creating flexible APIs. Default parameter evaluation timing matters when building ML pipelines that accumulate state across calls.",
    "keyDefinitions": [
      {
        "term": "First-Class Function",
        "definition": "A function that can be assigned to variables, passed as arguments, returned from other functions, and stored in data structures.",
        "example": "f = lambda x: x * 2; apply = lambda fn, val: fn(val); print(apply(f, 5)) outputs 10."
      },
      {
        "term": "LEGB Scope Rule",
        "definition": "Python's variable resolution order: Local -> Enclosing -> Global -> Built-in. Names are looked up in this hierarchy during function execution.",
        "example": "x = 'global'; def outer(): x = 'enclosing'; def inner(): print(x); inner() prints 'enclosing'."
      },
      {
        "term": "Mutable Default Argument Trap",
        "definition": "Default parameter values are evaluated once at function definition time, so a mutable default like [] is shared across all calls.",
        "example": "def add(item, lst=[]): lst.append(item); return lst; print(add(1), add(2)) outputs [1] [1, 2]."
      },
      {
        "term": "Keyword-Only Argument",
        "definition": "A parameter that must be passed by keyword, not positionally, specified by placing it after * in the function signature.",
        "example": "def configure(*, host, port): ...; configure(host='localhost', port=8080) works; configure('localhost', 8080) raises TypeError."
      }
    ],
    "formulas": [
      {
        "title": "Python Parameter Passing Semantics",
        "formula": "call_by_object_reference(param) = caller_ref -> callee_ref",
        "explanation": "Python passes arguments by 'object reference'—the function receives a reference to the same object that the caller holds. For mutable objects, changes inside the function are visible outside. Reassigning the parameter does not affect the caller.",
        "example": "def mutate(lst): lst.append(4); lst = []; x = [1,2,3]; mutate(x); print(x) -> [1,2,3,4]"
      },
      {
        "title": "Closure Cell Variable Capture",
        "formula": "enclosing_frame.cells[var] -> inner_function.__closure__",
        "explanation": "When a nested function references variables from an enclosing scope, those variables are stored in 'cells' attached to the enclosing function's frame. The inner function's __closure__ attribute contains cell objects that maintain references even after the outer function returns.",
        "example": "def outer(x): def inner(y): return x + y; return inner; add5 = outer(5); print(add5(3)) -> 8"
      }
    ],
    "whyItMatters": "Functions are the building blocks of all ML code. Model classes are functions, loss functions are functions, training steps are functions. Understanding scope rules prevents subtle bugs like accidental global variable shadowing. The mutable default argument trap is notorious in ML pipelines where default configurations accumulate state. First-class function behavior underlies decorators used universally in PyTorch and TensorFlow.",
    "architecture": {
      "title": "Python Function Call Stack",
      "description": "How Python manages function calls with frames, local variables, and return addresses.",
      "blocks": [
        {
          "label": "Caller Frame",
          "description": "Current execution context with local variables and instruction pointer"
        },
        {
          "label": "Frame Object (C stack)",
          "description": "New frame pushed per call with local namespace, globals, and code object"
        },
        {
          "label": "Parameter Binding",
          "description": "Arguments bound to parameter names and stored in new frame's local namespace"
        },
        {
          "label": "Function Body Execution",
          "description": "Bytecode executed within the new frame using its local variables"
        },
        {
          "label": "Return Value & Frame Pop",
          "description": "Return value pushed onto caller's stack; callee frame popped and destroyed"
        }
      ]
    },
    "understanding": {
      "analogy": "Functions are like kitchen appliances. Each takes specific inputs (parameters) and produces a specific output (return value). A blender takes fruits and returns smoothies. The LEGB scoping rule is like how the appliance looks for ingredients: first in its own bowl (local), then the counter (enclosing), then the pantry (global), then the supermarket (built-in). Default parameters are pre-set dials—but if the dial is shared (mutable default), changing it affects all future uses.",
      "steps": [
        {
          "title": "Define and Call Functions Properly",
          "content": "Use def function_name(param1, param2): return result. Keep functions small—each should do one thing. Use descriptive verb-based names."
        },
        {
          "title": "Master Parameter Passing Styles",
          "content": "Combine positional, keyword, *args, and **kwargs. Use positional-only (/) and keyword-only (*) to enforce calling conventions."
        },
        {
          "title": "Handle the Mutable Default Trap",
          "content": "Never use [] or {} as defaults. Use None and create a fresh mutable inside: def add(item, lst=None): if lst is None: lst = []"
        },
        {
          "title": "Understand Scope and Closure Behavior",
          "content": "Variables assigned inside a function are local. Use global or nonlocal for outer scopes. Closures capture by reference using __closure__ cells."
        },
        {
          "title": "Use Type Hints for Documentation",
          "content": "Annotate with def func(x: int) -> str:. Use Optional, Union, Literal from typing. Validate with mypy or pyright."
        }
      ],
      "misconceptions": [
        {
          "misconception": "Default parameters are evaluated each time the function is called.",
          "truth": "Default parameters are evaluated once at function definition time. This is why mutable defaults accumulate state across calls."
        },
        {
          "misconception": "Variables inside a function are always local.",
          "truth": "Variables are local only if assigned anywhere in the function. A variable only read is searched via LEGB. If assigned anywhere in the body, it's local throughout."
        }
      ]
    },
    "codeExamples": [
      {
        "level": "basic",
        "code": "# Basic function with all parameter types\ndef greet(name, greeting=\"Hello\", *, punctuation=\"!\"):\n    \"\"\"Return a formatted greeting string.\"\"\"\n    return f\"{greeting}, {name}{punctuation}\"\n\nprint(greet(\"Alice\"))\nprint(greet(\"Bob\", greeting=\"Hi\"))\nprint(greet(\"Charlie\", \"Hey\", punctuation=\".\"))\n\ndef average(*numbers):\n    return sum(numbers) / len(numbers) if numbers else 0.0\n\nprint(f\"Average: {average(10, 20, 30)}\")",
        "output": "Hello, Alice!\nHi, Bob!\nHey, Charlie.\nAverage: 20.0",
        "explanation": "Shows positional parameters (name), defaults (greeting='Hello'), keyword-only (*, punctuation), and *args for variable positional arguments."
      },
      {
        "level": "intermediate",
        "code": "# Mutable default trap and closure\n\ndef bad_func(item, lst=[]):\n    lst.append(item)\n    return lst\n\ndef good_func(item, lst=None):\n    if lst is None:\n        lst = []\n    lst.append(item)\n    return lst\n\nprint(\"Bad:\", bad_func(1), bad_func(2), bad_func(3))\nprint(\"Good:\", good_func(1), good_func(2), good_func(3))\n\ndef make_multiplier(factor):\n    def multiply(x):\n        return x * factor\n    return multiply\n\ndouble = make_multiplier(2)\ntriple = make_multiplier(3)\nprint(f\"double(5) = {double(5)}, triple(5) = {triple(5)}\")",
        "output": "Bad: [1] [1, 2] [1, 2, 3]\nGood: [1] [2] [3]\ndouble(5) = 10, triple(5) = 15",
        "explanation": "The bad function shares the same list across calls (mutable default trap). The good function creates a fresh list each time. The closure make_multiplier captures factor in __closure__ cells."
      },
      {
        "level": "advanced",
        "code": "# Decorator with @functools.wraps and partial application\nimport functools\nimport time\n\ndef timed(func):\n    @functools.wraps(func)\n    def wrapper(*args, **kwargs):\n        start = time.perf_counter()\n        result = func(*args, **kwargs)\n        elapsed = time.perf_counter() - start\n        print(f\"{func.__name__} took {elapsed:.4f}s\")\n        return result\n    return wrapper\n\nfrom functools import partial\n\ndef power(base, exponent):\n    return base ** exponent\n\nsquare = partial(power, exponent=2)\ncube = partial(power, exponent=3)\n\nprint(f\"square(5) = {square(5)}\")\nprint(f\"cube(3) = {cube(3)}\")\n\ndef compute(a: int, b: int) -> int:\n    \"\"\"Multiply two integers.\"\"\"\n    return a * b\n\nprint(f\"Annotations: {compute.__annotations__}\")\nprint(f\"Name: {compute.__name__}\")",
        "output": "square(5) = 25\ncube(3) = 27\nAnnotations: {'a': <class 'int'>, 'b': <class 'int'>, 'return': <class 'int'>}\nName: compute",
        "explanation": "The timed decorator wraps functions with timing and preserves metadata via @functools.wraps. functools.partial creates new functions with pre-filled arguments. Function annotations are stored in __annotations__."
      }
    ],
    "realWorld": {
      "useCases": [
        {
          "industry": "Web Frameworks",
          "description": "Flask and FastAPI use function decorators to register route handlers: @app.get('/api/data')."
        },
        {
          "industry": "Data Science",
          "description": "Functions encapsulate data transformations (normalize, encode) in pandas pipelines. functools.partial pre-configures functions."
        },
        {
          "industry": "ML Training",
          "description": "Training loops are parameterized functions. @torch.compile decorator optimizes execution. Loss functions are callables."
        }
      ],
      "caseStudy": {
        "problem": "A large ML platform had 500+ similar preprocessing functions with duplicated code, inconsistent defaults, and bugs from mutable defaults.",
        "solution": "Refactored using a decorator-based pipeline: @transform_step(schema='...'). Mutable defaults replaced with None pattern.",
        "results": "Code reuse increased 70%. Boilerplate reduced by 40%. Adding a new step became a single-function effort."
      },
      "bestPractices": [
        "Keep functions under 20 lines ideally, 50 max",
        "Use descriptive verb-based names: calculate_mean(), not calc_mn()",
        "Always return a value explicitly or document side effects",
        "Never use mutable objects as default parameter values",
        "Use * and / in signatures to enforce calling conventions",
        "Add type hints to all parameters and return types",
        "Write docstrings following Google or NumPy conventions"
      ],
      "tools": [
        "functools — partial, wraps, lru_cache, reduce, singledispatch",
        "inspect — Inspect live objects, function signatures, source code",
        "pdb — Debugger for stepping into function calls and inspecting frames",
        "signature — inspect.signature returns parameter metadata",
        "mypy — Static type checker validating function annotations",
        "dis — Bytecode disassembler showing how functions compile",
        "timeit — Precisely measure function execution time"
      ],
      "jobRoles": [
        "Software Engineer — Designs functions as primary code organization unit",
        "ML Engineer — Writes training, loss, and evaluation functions",
        "Data Engineer — Creates transformation functions for ETL pipelines",
        "API Developer — Builds route handler functions with validated parameters",
        "Open Source Maintainer — Designs public function APIs with careful semantics"
      ],
      "furtherReading": [
        {
          "title": "PEP 3107 — Function Annotations",
          "url": "https://peps.python.org/pep-3107/"
        },
        {
          "title": "PEP 570 — Positional-Only Parameters",
          "url": "https://peps.python.org/pep-0570/"
        },
        {
          "title": "Python Scope & LEGB Rule",
          "url": "https://realpython.com/python-scope-legb-rule/"
        },
        {
          "title": "Closures and Decorators in Python",
          "url": "https://realpython.com/primer-on-python-decorators/"
        }
      ]
    },
    "quiz": [
      {
        "type": "mcq",
        "question": "What does def f(x, y=[]): y.append(x); return y; f(1); f(2); print(f(3)) output?",
        "options": [
          "[1, 2, 3]",
          "[3]",
          "[1, 2]",
          "Error"
        ],
        "answer": "[1, 2, 3]"
      },
      {
        "type": "truefalse",
        "question": "A function defined inside another has access to the outer function's local variables.",
        "answer": "True"
      },
      {
        "type": "fillblank",
        "question": "The _____ keyword assigns to a variable in an enclosing function's scope.",
        "answer": "nonlocal"
      },
      {
        "type": "code",
        "question": "What is the result of list(map(lambda x: x**2, range(4)))?",
        "options": [
          "[0, 1, 4, 9]",
          "[0, 1, 8, 27]",
          "[1, 4, 9, 16]",
          "[0, 2, 4, 6]"
        ],
        "answer": "[0, 1, 4, 9]"
      },
      {
        "type": "match",
        "question": "Match syntax to behavior:",
        "pairs": {
          "*args": "Captures extra positional args as tuple",
          "**kwargs": "Captures extra keyword args as dict",
          "/": "Marks params before it as positional-only",
          "*": "Marks params after it as keyword-only"
        }
      }
    ]
  },
  "p1-intro-python": {
    "theory": "Python is a high-level, interpreted programming language created by Guido van Rossum and first released in 1991. Its design philosophy emphasizes code readability through significant indentation and a clean syntax that allows programmers to express concepts in fewer lines of code than languages like C++ or Java. Python supports multiple programming paradigms including procedural, object-oriented, and functional programming, making it an incredibly versatile tool for everything from web development to scientific computing.\n\nAt its core, Python uses dynamic typing and automatic memory management via garbage collection. Variables are names that reference objects in memory, and the type is inferred at runtime. The language's built-in data structures—lists, tuples, dictionaries, and sets—provide powerful abstractions that handle most programming needs without requiring custom implementations. Python's __dunder__ methods enable operator overloading and integration with language syntax, allowing custom objects to behave like built-in types.\n\nThe interpreter executes code line-by-line, which means errors surface at runtime rather than compile time. Python source files use the .py extension and are compiled to bytecode (.pyc files) automatically. The Python Package Index (PyPI) hosts over 400,000 packages, and pip is the standard package manager. Virtual environments (venv) isolate project dependencies, preventing version conflicts between projects.\n\nFor practical application, always use explicit imports rather than from module import * to avoid namespace pollution. Adopt PEP 8 style guidelines from the start—consistent naming conventions (snake_case for variables/functions, CamelCase for classes) improve readability. Use type hints (def add(x: int, y: int) -> int:) to document expected types; they're not enforced at runtime but help tools and other developers understand your code.\n\nA common pitfall for beginners is confusion between mutable and immutable types. Lists, dictionaries, and sets are mutable (modifiable in place); integers, strings, tuples, and frozensets are immutable (any operation returns a new object). Another pitfall is modifying a list while iterating over it, which causes skipped elements or IndexError. Shallow copies vs deep copies also trip up new Python developers—use copy.deepcopy() for nested structures that need independent duplication.",
    "keyDefinitions": [
      {
        "term": "Interpreter",
        "definition": "A program that executes Python source code directly without a separate compilation step. Python's CPython interpreter compiles source to bytecode then executes it on a virtual machine.",
        "example": "Running python script.py invokes the CPython interpreter to execute the file's contents line by line."
      },
      {
        "term": "Dynamic Typing",
        "definition": "A type system where variable types are checked at runtime rather than compile time, allowing a single variable to hold different types over its lifetime.",
        "example": "x = 5; x = 'hello' is valid because Python infers the type of x at each assignment."
      },
      {
        "term": "PEP 8",
        "definition": "The official Python style guide that prescribes conventions for code layout, naming, and formatting to ensure consistency across Python projects.",
        "example": "PEP 8 recommends 4 spaces per indentation level and a maximum line length of 79 characters for code."
      },
      {
        "term": "Bytecode",
        "definition": "A low-level platform-independent representation of Python source code stored in .pyc files, executed by the Python Virtual Machine (PVM).",
        "example": "After importing a module, Python caches the compiled bytecode in __pycache__/ to speed up subsequent loads."
      }
    ],
    "formulas": [
      {
        "title": "Python Execution Model",
        "formula": "source_code -> bytecode -> PVM_execution",
        "explanation": "Python source code is first compiled into an intermediate bytecode representation, which is then executed by the Python Virtual Machine. This two-step process balances portability with performance, as bytecode is platform-independent and the PVM handles OS-specific operations.",
        "example": "When you run python -c 'print(1+1)', the source is compiled to bytecode instructions like LOAD_CONST 1, LOAD_CONST 1, BINARY_ADD, PRINT_ITEM, then executed by the PVM."
      },
      {
        "title": "Reference Counting Formula",
        "formula": "ref_count = sum(active_references) - sum(deleted_references)",
        "explanation": "Python tracks how many references point to each object. When an object's reference count reaches zero, its memory is immediately deallocated. The sys.getrefcount() function returns the current reference count for any object, which is always at least 1 due to the function argument itself.",
        "example": "import sys; x = []; print(sys.getrefcount(x)) outputs 2 (one for x, one for the function argument), and del x decrements the count to 0, triggering garbage collection."
      }
    ],
    "whyItMatters": "Python's simplicity and readability make it the dominant language in AI/ML. Most major frameworks—TensorFlow, PyTorch, scikit-learn, Hugging Face Transformers—offer Python-first APIs with extensive documentation. The dynamic nature of Python allows rapid prototyping of ML models, and the vast ecosystem of scientific libraries (NumPy, pandas, SciPy) provides the numerical foundation for implementing algorithms. Understanding Python's execution model, memory management, and type system is essential before diving into the specialized libraries that power AI/ML workflows.",
    "architecture": {
      "title": "Python Runtime Architecture",
      "description": "The layered architecture of how Python code executes, from source to hardware interaction.",
      "blocks": [
        {
          "label": "Python Source (.py)",
          "description": "Human-readable code written by developers, following Python syntax rules"
        },
        {
          "label": "Compiler",
          "description": "Parses source into Abstract Syntax Tree (AST) then compiles to bytecode (.pyc)"
        },
        {
          "label": "Python Bytecode",
          "description": "Platform-independent intermediate representation (e.g., LOAD_FAST, BUILD_LIST)"
        },
        {
          "label": "Python Virtual Machine",
          "description": "Stack-based interpreter that executes bytecode instructions one at a time"
        },
        {
          "label": "C API / Runtime",
          "description": "Underlying C functions that handle memory, I/O, threading, and OS interaction"
        },
        {
          "label": "Operating System",
          "description": "Manages processes, file systems, network sockets, and hardware resources"
        }
      ]
    },
    "understanding": {
      "analogy": "Think of Python as a chef in a kitchen. The recipe (source code) gives step-by-step instructions. The chef (interpreter) reads each step, performs the action—chopping vegetables (operating on data), mixing ingredients (function calls)—and serves the dish (output). If a step says 'add salt to taste,' the chef decides the exact amount at runtime (dynamic typing). Different chefs (different Python implementations like CPython, PyPy, Jython) might prepare the same recipe slightly differently but produce the same dish.",
      "steps": [
        {
          "title": "Install Python and Set Up Environment",
          "content": "Download Python 3.x from python.org, ensure python and pip are in your PATH, and verify with python --version. Create a project folder to organize your code."
        },
        {
          "title": "Write Your First Script",
          "content": "Create a .py file with a simple expression like print('Hello, World!'). Run it with python filename.py. Observe that no compilation step is required—the interpreter executes directly."
        },
        {
          "title": "Understand Variables and Assignment",
          "content": "Assign values to names: message = 'Hello'. Note that message is a reference to a string object, not a box containing a value. Use type() to inspect types at runtime."
        },
        {
          "title": "Explore Python's Interactive Mode",
          "content": "Run python without arguments to enter the REPL (Read-Eval-Print Loop). This is an interactive environment where you can test snippets, inspect objects with dir(), and experiment with the language."
        },
        {
          "title": "Adopt PEP 8 and Tooling",
          "content": "Use a linter (flake8/ruff) and formatter (black) to enforce style. Set up a virtual environment with python -m venv venv to isolate dependencies."
        }
      ],
      "misconceptions": [
        {
          "misconception": "Python passes variables by value or by reference.",
          "truth": "Python uses 'pass by assignment' or 'pass by object reference.' The variable itself is a reference to an object; reassigning inside a function does not affect the caller, but mutating an object's contents does."
        },
        {
          "misconception": "Python is a 'scripting language' and not suitable for large applications.",
          "truth": "Python is used in production at Google, Instagram, Netflix, and Dropbox for massive-scale systems. Its type hints, modular design, and testing tools make it fully capable for enterprise applications."
        }
      ]
    },
    "codeExamples": [
      {
        "level": "basic",
        "code": "# Simple variable assignment and printing\nname = \"Alice\"\nage = 30\nheight = 5.6\nis_student = True\n\nprint(f\"{name} is {age} years old, {height}ft tall.\")\nprint(type(name), type(age), type(height), type(is_student))",
        "output": "Alice is 30 years old, 5.6ft tall.\n<class 'str'> <class 'int'> <class 'float'> <class 'bool'>",
        "explanation": "This demonstrates Python's dynamic typing: four different types are assigned without explicit declarations. The f-string interpolates variables directly into the string. type() reveals the runtime type of each value, confirming Python infers str, int, float, and bool automatically."
      },
      {
        "level": "intermediate",
        "code": "# Understanding references and mutability\nimport sys\n\na = [1, 2, 3]\nb = a\nb.append(4)\nprint(f\"a = {a}, b = {b}\")\nprint(f\"Same object? {a is b}\")\nprint(f\"Ref count of a: {sys.getrefcount(a) - 1}\")\n\nx = \"hello\"\ny = x\ny = y + \" world\"\nprint(f\"x = {x}, y = {y}\")\nprint(f\"Same object? {x is y}\")",
        "output": "a = [1, 2, 3, 4], b = [1, 2, 3, 4]\nSame object? True\nRef count of a: 2\nx = hello, y = hello world\nSame object? False",
        "explanation": "This shows mutable vs immutable semantics. Lists are mutable: b = a creates an alias, and modifying b also affects a. Strings are immutable: y = x references the same string, but y += ' world' creates a new string object, leaving x unchanged."
      },
      {
        "level": "advanced",
        "code": "# Monkey-patching and dunder methods\nimport builtins\n\noriginal_print = builtins.print\ncall_count = 0\n\ndef patched_print(*args, **kwargs):\n    global call_count\n    call_count += 1\n    original_print(f\"[Call #{call_count}]\", *args, **kwargs)\n\nbuiltins.print = patched_print\n\nprint(\"First message\")\nprint(\"Second message\")\nprint(f\"print() was called {call_count} times\")\nbuiltins.print = original_print\n\nclass ReprDemo:\n    def __init__(self, value):\n        self.value = value\n    def __repr__(self):\n        return f\"ReprDemo({self.value!r})\"\n    def __add__(self, other):\n        return ReprDemo(self.value + other.value)\n\nobj = ReprDemo(42)\nprint(obj)\nprint(obj + ReprDemo(10))",
        "output": "[Call #1] First message\n[Call #2] Second message\n[Call #3] print() was called 3 times\nReprDemo(42)\nReprDemo(52)",
        "explanation": "This advanced example demonstrates Python's dynamic nature. The built-in print function is replaced at runtime to add call counting—this is monkey-patching. Afterward, we restore the original. The ReprDemo class implements __repr__ and __add__, showing how dunder methods integrate custom objects with Python syntax."
      }
    ],
    "realWorld": {
      "useCases": [
        {
          "industry": "Web Development",
          "description": "Django and Flask frameworks use Python to build server-side logic, handle HTTP requests, and manage databases. Python's readability makes team collaboration on large codebases efficient."
        },
        {
          "industry": "Data Science & Analytics",
          "description": "Python processes and analyzes data using pandas and NumPy. Companies like Netflix use Python for recommendation algorithms and viewing pattern analysis."
        },
        {
          "industry": "DevOps & Automation",
          "description": "Python scripts automate infrastructure provisioning (Ansible), CI/CD pipelines, and system administration tasks."
        }
      ],
      "caseStudy": {
        "problem": "Instagram needed to scale their Python backend to handle hundreds of millions of daily active users while maintaining rapid feature development cycles.",
        "solution": "Instagram adopted type hints at scale using Pyre (static type checker) and Django running on CPython. They optimized hot paths with C extensions and used asynchronous patterns for I/O-bound operations.",
        "results": "Instagram's Python monolith serves billions of requests daily. Type hints reduced runtime type errors by 15% and improved developer productivity through better IDE support. The team maintains a 99.9%+ uptime SLA."
      },
      "bestPractices": [
        "Always use virtual environments to isolate project dependencies",
        "Follow PEP 8 with automated formatters like black or ruff format",
        "Write docstrings for all public modules, classes, and functions",
        "Use type hints for function signatures to improve documentation and tooling",
        "Prefer explicit imports over wildcard imports to avoid namespace pollution",
        "Keep functions small and focused on a single responsibility",
        "Use __name__ == '__main__' guards to make scripts importable"
      ],
      "tools": [
        "CPython — The reference implementation of Python (python.org)",
        "PyPy — A JIT-compiled Python implementation for performance-critical code",
        "ruff — An extremely fast linter and formatter for Python",
        "mypy — A static type checker that validates type hints",
        "pip — The standard package installer for Python packages from PyPI",
        "venv — Built-in module for creating lightweight virtual environments",
        "ipython — An enhanced interactive Python shell with tab completion and introspection"
      ],
      "jobRoles": [
        "Python Developer — Builds and maintains Python applications across the full stack",
        "Data Engineer — Develops ETL pipelines and data processing systems using Python",
        "DevOps Engineer — Automates infrastructure and deployment with Python scripts",
        "Software Engineer in Test — Writes test frameworks and automation suites in Python",
        "Backend Engineer — Designs and implements server-side logic and APIs in Python"
      ],
      "furtherReading": [
        {
          "title": "Fluent Python",
          "url": "https://www.oreilly.com/library/view/fluent-python-2nd/9781492056348/"
        },
        {
          "title": "Python.org Official Tutorial",
          "url": "https://docs.python.org/3/tutorial/"
        },
        {
          "title": "PEP 8 - Style Guide for Python Code",
          "url": "https://peps.python.org/pep-0008/"
        },
        {
          "title": "CPython Internals Guide",
          "url": "https://realpython.com/cpython-source-code-guide/"
        }
      ]
    },
    "quiz": [
      {
        "type": "mcq",
        "question": "What does Python's type() function return?",
        "options": [
          "The memory address of an object",
          "The class/type of an object",
          "The size of an object in bytes",
          "The reference count of an object"
        ],
        "answer": "The class/type of an object"
      },
      {
        "type": "truefalse",
        "question": "In Python, integers are immutable objects.",
        "answer": "True"
      },
      {
        "type": "fillblank",
        "question": "Python source code is compiled to an intermediate representation called _____ before execution.",
        "answer": "bytecode"
      },
      {
        "type": "code",
        "question": "What is the output of: print(type(3.14) is float)",
        "options": [
          "True",
          "False",
          "TypeError",
          "None"
        ],
        "answer": "True"
      },
      {
        "type": "match",
        "question": "Match the Python file extensions to their purpose:",
        "pairs": {
          ".py": "Source code file",
          ".pyc": "Compiled bytecode file",
          ".pyw": "Python script without console window",
          ".pyd": "Windows DLL for Python extensions"
        }
      }
    ]
  },
  "p1-iterators-generators": {
    "theory": "Iterators and generators are Python's mechanisms for lazy, memory-efficient iteration over sequences. An iterator is an object that implements the iterator protocol: __iter__() returns self, and __next__() returns the next value or raises StopIteration. Every iterable (list, tuple, dict, str, file) can be converted to an iterator via iter() and consumed one element at a time via next(). The for loop internally uses the iterator protocol—it calls iter() on the iterable and __next__() on each iteration.\n\nGenerators are a special type of iterator defined using a function with the yield keyword instead of return. When called, a generator function returns a generator object (which is an iterator) without executing the function body. Each call to __next__() executes up to the next yield, suspends execution, and returns the yielded value. On the next call, execution resumes after the yield. This suspension and resumption of state is what makes generators powerful for lazy evaluation.\n\nGenerator functions maintain their entire state between yields: local variables, instruction pointer, stack frame, and exception state. The yield from expression (Python 3.3+) delegates iteration to a sub-generator, allowing transparent composition of generators. Generator-based coroutines (pre- async/await) used yield from for cooperative multitasking, but modern code uses native coroutines.\n\nThe itertools module provides a rich set of iterator building blocks: count() (infinite arithmetic sequence), cycle() (infinite repeat), repeat() (single value repeated), chain() (concatenate iterables), groupby() (consecutive key groups), islice() (slice iterators), product() (Cartesian product), permutations(), combinations(), and accumulate() (running reductions). These tools compose with generators for powerful data pipelines.\n\nFor AI/ML work, generators and iterators are fundamental. PyTorch's DataLoader yields batches lazily, TensorFlow's tf.data.Dataset uses iterator pipelines, and custom training loops use generator functions for data preprocessing. Understanding the iterator protocol is essential for building custom data loaders, implementing lazy transformations, and processing datasets larger than memory. itertools is heavily used for data shuffling, batching, and augmentation pipelines.",
    "keyDefinitions": [
      {
        "term": "Iterator Protocol",
        "definition": "The contract requiring __iter__() to return an iterator and __next__() to return the next element or raise StopIteration, enabling for loop support.",
        "example": "i = iter([1,2,3]); next(i) -> 1; next(i) -> 2; next(i) -> 3; next(i) -> StopIteration"
      },
      {
        "term": "Generator Function",
        "definition": "A function using yield instead of return that returns a generator iterator when called. The function body executes lazily as the generator is consumed.",
        "example": "def count_up(n): i = 0; while i < n: yield i; i += 1 — yields values 0, 1, ..., n-1 lazily."
      },
      {
        "term": "yield from",
        "definition": "An expression that delegates iteration to a sub-iterator, yielding all values from the sub-iterator transparently within the current generator.",
        "example": "def chain(*iters): for it in iters: yield from it — yields all elements from all provided iterators sequentially."
      },
      {
        "term": "itertools.islice",
        "definition": "A function that slices an iterator lazily, returning selected elements without materializing the entire iterator into memory.",
        "example": "islice(range(1_000_000), 10) yields only the first 10 elements without creating a list of 1 million items."
      }
    ],
    "formulas": [
      {
        "title": "Generator State Machine",
        "formula": "generator_state = { 'frame': code + locals, 'ip': instruction_pointer }\nsuspend at yield, resume after yield on next()",
        "explanation": "A generator maintains a hidden state machine containing the execution frame (local variables) and instruction pointer. On __next__(), execution resumes from the last yield point. On return/StopIteration, the frame is cleaned up.",
        "example": "def gen(): yield 1; yield 2; yield 3; g = gen(); next(g) -> 1 (suspend after yield 1); next(g) -> 2 (resume, yield 2)"
      },
      {
        "title": "Generator Pipeline Pattern",
        "formula": "data → gen1 → gen2 → ... → genN → consumer\n= consumer(genN(...(gen1(data))...))",
        "explanation": "Generators compose into lazy pipelines where each generator transforms the stream incrementally. No intermediate storage—each element flows through the entire pipeline one at a time. This enables processing arbitrarily large datasets with constant memory.",
        "example": "lines = (line for line in file); parsed = (parse(line) for line in lines); filtered = (p for p in parsed if p.valid); results = [next(filtered) for _ in range(10)]"
      }
    ],
    "whyItMatters": "Generators and iterators are the foundation of lazy data processing in AI/ML. PyTorch DataLoader yields batches as a generator. TensorFlow tf.data.Dataset builds iterator-based pipelines. Custom generators handle streaming data, video frame processing, and real-time sensor data. Understanding the iterator protocol enables building custom data loaders, implementing early stopping in training loops, and creating memory-efficient data augmentation pipelines. The itertools module provides essential tools for shuffling, batching, and combinatorial operations on datasets.",
    "architecture": {
      "title": "Python Generator Internal State",
      "description": "How CPython implements generators as suspended frames with state machines.",
      "blocks": [
        {
          "label": "Generator Object (PyGenObject)",
          "description": "Contains gi_frame (frozen frame), gi_running (bool), gi_code, gi_name, gi_weakreflist"
        },
        {
          "label": "Frozen Frame (PyFrameObject)",
          "description": "Captured execution state: local variables, stack, instruction pointer, global namespace"
        },
        {
          "label": "Code Object (PyCodeObject)",
          "description": "Compiled bytecode with generator flag, including YIELD_VALUE instructions"
        },
        {
          "label": "YIELD_VALUE Bytecode",
          "description": "Bytecode instruction that pops value from stack, yields it, and suspends frame"
        },
        {
          "label": "SEND / RESUME (Python 3.6+)",
          "description": "Bytecodes for sending values back into generators (generator.send()) and coroutine resume"
        }
      ]
    },
    "understanding": {
      "analogy": "Generators are like a bookmark in a textbook. When you call a generator function, instead of reading the entire book and summarizing it (like a list comprehension), Python gives you a bookmark (generator object). Each time you call next(), Python reads from where the bookmark is until it hits a 'yield' statement (like stopping at an interesting paragraph), places the bookmark there, and tells you what it found. The next next() call resumes from the bookmark. You can read a book of any length (infinite sequence) using just one bookmark (constant memory). Different bookmarks (generator instances) track independent reading positions.",
      "steps": [
        {
          "title": "Create Simple Generators with yield",
          "content": "Define def gen(): yield 1; yield 2; yield 3. Call g = gen() to get a generator object. Use next(g) or for item in g: to consume values."
        },
        {
          "title": "Build Generator Pipelines",
          "content": "Chain generators: def clean(data): for item in data: if item is not None: yield item. Chain with clean(filter(parse(raw_data))) for lazy processing."
        },
        {
          "title": "Use yield from for Delegation",
          "content": "Delegate to sub-generators: def flatten(matrix): for row in matrix: yield from row. This yields each element from each row transparently."
        },
        {
          "title": "Send Values into Generators",
          "content": "Use gen.send(value) to send values into the generator. The yield expression receives the sent value. Use gen.throw(exc) to raise exceptions inside generators."
        },
        {
          "title": "Master itertools for Advanced Iteration",
          "content": "Use itertools.chain (concatenate), .islice (lazy slice), .groupby (key grouping), .cycle (infinite repeat), .product (Cartesian product), .tee (duplicate iterator)."
        }
      ],
      "misconceptions": [
        {
          "misconception": "Generators are just a different syntax for lists.",
          "truth": "Generators are lazy and stateful. They compute values on demand and can represent infinite sequences. Lists are eager and finite. A generator is an iterator; a list is an iterable that can produce many iterators."
        },
        {
          "misconception": "You can reuse a generator after consuming it.",
          "truth": "Generators are single-use iterators. Once consumed (StopIteration), they cannot be restarted. Create a new generator by calling the generator function again for a fresh iterator."
        }
      ]
    },
    "codeExamples": [
      {
        "level": "basic",
        "code": "# Basic generator and iterator protocol\nimport sys\n\n# Generator function\ndef fibonacci(n):\n    a, b = 0, 1\n    for _ in range(n):\n        yield a\n        a, b = b, a + b\n\nprint(\"Fibonacci (first 8):\", list(fibonacci(8)))\n\n# Manual iterator protocol\nfizz = fibonacci(5)\nprint(\"Manual iteration:\")\nprint(f\"  next(): {next(fizz)}\")\nprint(f\"  next(): {next(fizz)}\")\n\n# Generator memory advantage\nn = 1_000_000\ndef my_range(n):\n    i = 0\n    while i < n:\n        yield i\n        i += 1\n\nlist_size = sys.getsizeof(list(range(1000)))\ngen_size = sys.getsizeof(my_range(1000))\nprint(f\"\\nList of 1000: {list_size} bytes\")\nprint(f\"Generator of 1000: {gen_size} bytes\")\nprint(f\"Generator always uses ~{sys.getsizeof(my_range(1000000))} bytes regardless of n\")",
        "output": "Fibonacci (first 8): [0, 1, 1, 2, 3, 5, 8, 13]\nManual iteration:\n  next(): 0\n  next(): 1\n\nList of 1000: 8856 bytes\nGenerator of 1000: 112 bytes\nGenerator always uses ~112 bytes regardless of n",
        "explanation": "Generator function yields fibonacci values lazily. list() consumes it entirely. Manual next() calls demonstrate the iterator protocol. The generator uses constant memory (~112 bytes) regardless of iteration count, while a list grows with n."
      },
      {
        "level": "intermediate",
        "code": "# Generator pipelines and yield from\ndef read_records(filename):\n    with open(filename) as f:\n        for line in f:\n            yield line.strip().split(',')\n\ndef parse_records(records):\n    for fields in records:\n        try:\n            yield {\n                'name': fields[0],\n                'age': int(fields[1]),\n                'score': float(fields[2]),\n            }\n        except (IndexError, ValueError):\n            continue  # skip malformed\n\ndef filter_adults(records, min_age=18):\n    for r in records:\n        if r['age'] >= min_age:\n            yield r\n\n# Writer for demo purposes - create sample data\nwith open('records.csv', 'w') as f:\n    f.write('Alice,30,88.5\\nBob,17,92.0\\nCharlie,25,75.3\\n')\n\n# Lazy pipeline\npipeline = filter_adults(parse_records(read_records('records.csv')))\nfor adult in pipeline:\n    print(f\"Adult: {adult}\")\n\n# yield from example\ndef flatten_and_filter(data):\n    for item in data:\n        if isinstance(item, (list, tuple)):\n            yield from flatten_and_filter(item)\n        elif item is not None:\n            yield item\n\nnested = [1, [2, [3, None, 4], 5], None, 6]\nprint(f\"\\nFlattened: {list(flatten_and_filter(nested))}\")\n\nimport os\nos.remove('records.csv')",
        "output": "Adult: {'name': 'Alice', 'age': 30, 'score': 88.5}\nAdult: {'name': 'Charlie', 'age': 25, 'score': 75.3}\n\nFlattened: [1, 2, 3, 4, 5, 6]",
        "explanation": "Generator pipeline: read_records -> parse_records -> filter_adults, each yielding lazily. No intermediate lists. yield from recursively flattens nested structures, transparently yielding all non-None elements."
      },
      {
        "level": "advanced",
        "code": "# itertools and coroutine-like generators (send)\nimport itertools\nimport operator\n\n# itertools.combinations for feature pairs\nfeatures = ['age', 'income', 'education']\npairs = list(itertools.combinations(features, 2))\nprint(f\"Feature pairs: {pairs}\")\n\n# itertools.groupby (requires sorted input)\ndata = [('A', 1), ('A', 2), ('B', 3), ('B', 4), ('C', 5)]\ngrouped = {k: list(g) for k, g in itertools.groupby(data, key=lambda x: x[0])}\nprint(f\"Grouped: {grouped}\")\n\n# Generator with send() - coroutine-like\ndef running_average():\n    total = 0\n    count = 0\n    average = None\n    while True:\n        value = yield average\n        if value is None:\n            break\n        total += value\n        count += 1\n        average = total / count\n\navg = running_average()\nnext(avg)  # prime the generator\nprint(f\"\\nRunning averages:\")\nprint(f\"  send(10): {avg.send(10):.1f}\")\nprint(f\"  send(20): {avg.send(20):.1f}\")\nprint(f\"  send(30): {avg.send(30):.1f}\")\navg.close()\n\n# Custom batched iterator\ndef batched(iterable, n):\n    it = iter(iterable)\n    while True:\n        batch = list(itertools.islice(it, n))\n        if not batch:\n            break\n        yield batch\n\nprint(f\"\\nBatched (3 per batch): {list(batched(range(10), 3))}\")",
        "output": "Feature pairs: [('age', 'income'), ('age', 'education'), ('income', 'education')]\nGrouped: {'A': [('A', 1), ('A', 2)], 'B': [('B', 3), ('B', 4)], 'C': [('C', 5)]}\n\nRunning averages:\n  send(10): 10.0\n  send(20): 15.0\n  send(30): 20.0\n\nBatched (3 per batch): [[0, 1, 2], [3, 4, 5], [6, 7, 8], [9]]",
        "explanation": "itertools.combinations generates feature pairs. itertools.groupby groups consecutive elements by key. Generator.send() enables two-way communication—sending values into the generator for running average computation. batched() uses itertools.islice for memory-efficient chunking."
      }
    ],
    "realWorld": {
      "useCases": [
        {
          "industry": "Data Engineering",
          "description": "Generator pipelines for ETL: read_chunks -> transform -> filter -> write. Memory-efficient processing of files larger than RAM."
        },
        {
          "industry": "ML Training",
          "description": "PyTorch DataLoader yields batches as a generator-like iterator. Custom generator functions yield infinite data streams with augmentation."
        },
        {
          "industry": "Streaming Analytics",
          "description": "itertools.groupby for sessionization of event streams. Generators for sliding windows, rate limiting, and real-time aggregations."
        }
      ],
      "caseStudy": {
        "problem": "An ML team needed to train a model on 500GB of image data stored on a single machine with 32GB RAM. Loading all images into a list caused OOM crashes.",
        "solution": "Implemented a generator-based DataLoader that yielded batches on demand. The generator read image paths from disk, decoded images one at a time, applied augmentations via a generator pipeline, and yielded batches using itertools.islice with fixed batch sizes.",
        "results": "Peak memory usage dropped from 500GB+ to 2GB (batch size x image size). Training time increased only 5% due to pipelined loading (CPU preprocessing overlapped with GPU training). The generator pattern was reusable for other datasets."
      },
      "bestPractices": [
        "Use generators for large or infinite sequences to save memory",
        "Build lazy data pipelines by chaining generators",
        "Use yield from to compose generators cleanly",
        "Prefer generator expressions over list comprehensions for intermediate results",
        "Use itertools functions over handwritten iterator logic",
        "Remember generators are single-use—create new ones if needed again",
        "Use generator.send() sparingly—it complicates code flow"
      ],
      "tools": [
        "itertools — chain, islice, cycle, repeat, groupby, product, permutations, combinations, accumulate, tee",
        "functools.reduce — Reduce iterators to single values",
        "more-itertools — Third-party extension with chunked, windowed, peekable, unique_everseen",
        "builtins.iter / next — Core iterator protocol functions",
        "builtins.enumerate, zip, map, filter — Return lazy iterators in Python 3",
        "pathlib.Path.glob — Returns generator of matching file paths",
        "csv.reader — Returns iterator over CSV rows"
      ],
      "jobRoles": [
        "Data Engineer — Memory-efficient data pipelines using generator chains",
        "ML Engineer — Custom data loaders with generator-based batch yielding",
        "Backend Developer — Streaming API responses via generator views (Flask.stream)",
        "Systems Programmer — Streaming parser for network protocols (yield packets)",
        "NLP Engineer — Character/word/token generators for text processing pipelines"
      ],
      "furtherReading": [
        {
          "title": "PEP 255 — Simple Generators",
          "url": "https://peps.python.org/pep-0255/"
        },
        {
          "title": "PEP 342 — Coroutines via Enhanced Generators",
          "url": "https://peps.python.org/pep-0342/"
        },
        {
          "title": "PEP 380 — Syntax for Delegating to Sub-generator",
          "url": "https://peps.python.org/pep-0380/"
        },
        {
          "title": "Itertools Recipes",
          "url": "https://docs.python.org/3/library/itertools.html#itertools-recipes"
        }
      ]
    },
    "quiz": [
      {
        "type": "mcq",
        "question": "What exception does next() raise when an iterator is exhausted?",
        "options": [
          "ValueError",
          "StopIteration",
          "IndexError",
          "GeneratorExit"
        ],
        "answer": "StopIteration"
      },
      {
        "type": "truefalse",
        "question": "A generator can be iterated multiple times by calling next() after it's exhausted.",
        "answer": "False"
      },
      {
        "type": "fillblank",
        "question": "The _____ keyword is used in generator functions to produce values without terminating.",
        "answer": "yield"
      },
      {
        "type": "code",
        "question": "What does itertools.islice(range(100), 5) return?",
        "options": [
          "[0,1,2,3,4]",
          "A generator yielding first 5 numbers",
          "range(0,5)",
          "[5]"
        ],
        "answer": "A generator yielding first 5 numbers"
      },
      {
        "type": "match",
        "question": "Match itertools function to result:",
        "pairs": {
          "chain('ABC', 'DEF')": "Iterator: A B C D E F",
          "cycle('AB')": "Infinite iterator: A B A B ...",
          "compress(data, selectors)": "Filter by selector truthiness",
          "accumulate([1,2,3,4])": "Running sum: 1 3 6 10"
        }
      }
    ]
  },
  "p1-lambda-map-filter": {
    "theory": "Lambda functions, map, filter, and reduce form Python's functional programming toolkit, enabling operations on sequences without explicit loops. A lambda is a small anonymous function defined with the lambda keyword: lambda arguments: expression. It can contain only a single expression (no statements), and the result of the expression is implicitly returned. Lambdas are often used as throw-away functions passed to higher-order functions like map(), filter(), and sorted().\n\nmap(function, iterable) applies a function to every item in an iterable, returning an iterator (not a list in Python 3). filter(function, iterable) returns an iterator containing only items for which the function returns truthy. Both are lazy: they compute results on demand as you iterate. The functools.reduce(function, iterable, initial) function (moved to functools in Python 3) cumulatively applies a function to pairs of elements, reducing the iterable to a single value.\n\nWhile map and filter are available, Python's list comprehensions are generally preferred for their readability. Both approaches have similar performance characteristics, but comprehensions are more Pythonic. However, map and filter are still valuable when: (a) the function already exists (just pass the reference without a lambda), (b) working with generator pipelines involving multiple transformations, or (c) writing code for other functional languages' ecosystems.\n\nfunctools.reduce() is a powerful but often overused tool. It's ideal for cumulative operations like computing a product, finding the maximum, or building a dictionary from a list. However, Python provides specialized functions for many reduce patterns: sum(), any(), all(), min(), max(), math.prod(). The operator module provides function versions of Python operators for use with reduce and map.\n\nFor AI/ML work, lambdas appear in sorting custom objects (e.g., sorted(dataset, key=lambda x: x['loss'])), mapping data transformations in preprocessing, and parameterizing configurations. However, too many lambdas in ML code can hurt readability—explicit named functions are usually clearer.",
    "keyDefinitions": [
      {
        "term": "Lambda Function",
        "definition": "A small anonymous function defined as lambda args: expression that evaluates and returns the expression when called, restricted to a single expression.",
        "example": "lambda x, y: x + y creates an adder; (lambda x, y: x + y)(3, 4) returns 7."
      },
      {
        "term": "Map-Reduce Pattern",
        "definition": "A data processing paradigm where map transforms each element independently and reduce aggregates all elements into a single result.",
        "example": "functools.reduce(operator.add, map(lambda x: x**2, [1,2,3,4]), 0) computes sum of squares: 30."
      },
      {
        "term": "Higher-Order Function",
        "definition": "A function that takes another function as an argument or returns a function. map, filter, reduce, and sorted (with key) are all higher-order.",
        "example": "sorted(['abc', 'de', 'fghi'], key=len) uses len as a higher-order argument."
      },
      {
        "term": "Lazy Iterator",
        "definition": "An iterator that computes elements on demand. map and filter return lazy iterators in Python 3 (unlike Python 2's lists).",
        "example": "m = map(str.upper, ['a', 'b', 'c']); list(m) triggers actual uppercasing."
      }
    ],
    "formulas": [
      {
        "title": "Reduce as a Fold Operation",
        "formula": "reduce(f, [x1, x2, ..., xn], init) = f(...f(f(init, x1), x2)..., xn)",
        "explanation": "Reduce accumulates a result by repeatedly applying a binary function to the current accumulator and each element. The initial value seeds the accumulator.",
        "example": ">>> from functools import reduce\n>>> reduce(lambda acc, x: acc + x, [1,2,3,4,5], 0)\n15\n>>> reduce(lambda a, b: a * b, range(1, 6))\n120  (5!)"
      },
      {
        "title": "Map-Filter Equivalence",
        "formula": "list(map(f, filter(p, iter))) = [f(x) for x in iter if p(x)]",
        "explanation": "A map over a filter produces the same result as a list comprehension with a condition. The comprehension is generally preferred for readability.",
        "example": "list(map(lambda x: x*2, filter(lambda x: x%2==0, [1,2,3,4,5,6])))) = [4, 8, 12]"
      }
    ],
    "whyItMatters": "Functional patterns translate directly to AI/ML data processing. Feature normalization is a map operation. Outlier removal is a filter. Loss computation over a batch is a reduce. Understanding these concepts is essential for PySpark (RDD map/reduce), Pandas (.apply() and .map()), and writing parallelizable data pipelines.",
    "understanding": {
      "analogy": "Map/filter/reduce is an assembly line. map is the station where each product gets a transformation—every item gets the same treatment. filter is quality control—defective items are removed. reduce is the final packaging station where all items are combined into one final product. Lambda functions are the quick-read-once instructions posted at each station.",
      "steps": [
        {
          "title": "Understand Lambdas as Anonymous Functions",
          "content": "lambda x: x * 2 is equivalent to def double(x): return x * 2. Use lambdas for simple one-time operations only."
        },
        {
          "title": "Use map() for Function Application",
          "content": "Pass existing functions: map(str.strip, lines). Create lambdas inline: map(lambda x: x*1.5, data). Remember map is lazy."
        },
        {
          "title": "Use filter() for Predicate Selection",
          "content": "Filter with existing: filter(str.isalpha, tokens). Filter with lambda: filter(lambda x: x > 0, numbers). Chain with map."
        },
        {
          "title": "Apply reduce() for Cumulative Operations",
          "content": "Use reduce(operator.add, numbers, 0) for sum. Prefer built-ins when available: sum(), any(), all(), max(), math.prod()."
        },
        {
          "title": "Know When to Prefer Comprehensions",
          "content": "Use comprehensions over map/filter when readability matters. Use map/filter when the function already exists by name or building lazy chains."
        }
      ],
      "misconceptions": [
        {
          "misconception": "map() and filter() return lists in Python 3.",
          "truth": "In Python 3, they return lazy iterators. Python 2 returned lists. Use list(map(...)) explicitly to materialize."
        },
        {
          "misconception": "Lambda functions are fundamentally different from def functions.",
          "truth": "Lambdas produce the same function objects. The only differences: single expression only, no name (__name__ is '<lambda>'), no annotations."
        }
      ]
    },
    "codeExamples": [
      {
        "level": "basic",
        "code": "# Basic lambda, map, filter usage\nnumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]\n\ndouble = lambda x: x * 2\nprint(f\"Double 5: {double(5)}\")\n\nsquared = list(map(lambda x: x**2, numbers))\nprint(f\"Squared (map): {squared}\")\n\nevens = list(filter(lambda x: x % 2 == 0, numbers))\nprint(f\"Evens (filter): {evens}\")\n\nfruits = ['apple', 'banana', 'kiwi', 'strawberry', 'fig']\nsorted_by_len = sorted(fruits, key=lambda x: len(x))\nprint(f\"Sorted by length: {sorted_by_len}\")",
        "output": "Double 5: 10\nSquared (map): [1, 4, 9, 16, 25, 36, 49, 64, 81, 100]\nEvens (filter): [2, 4, 6, 8, 10]\nSorted by length: ['fig', 'kiwi', 'apple', 'banana', 'strawberry']",
        "explanation": "Lambda defines an anonymous double function. map squares each number lazily. filter keeps evens. sorted with lambda key sorts strings by length."
      },
      {
        "level": "intermediate",
        "code": "# Combining map, filter, reduce with operator\nfrom functools import reduce\nimport operator\n\ntransactions = [120, -45, 230, -80, 300, -15, 500]\n\npositive = filter(lambda x: x > 0, transactions)\nwith_tax = map(lambda x: x * 1.1, positive)\ntotal = reduce(operator.add, with_tax, 0)\nprint(f\"Total after tax: ${total:.2f}\")\n\nstudents = [\n    {'name': 'Alice', 'grade': 85, 'age': 22},\n    {'name': 'Bob', 'grade': 92, 'age': 20},\n    {'name': 'Charlie', 'grade': 85, 'age': 19},\n]\nsorted_students = sorted(students, key=lambda s: (-s['grade'], s['age']))\nprint(f\"Top student: {sorted_students[0]}\")\n\nprices = [10, 20, 30]\nquantities = [2, 3, 4]\ntotals = list(map(operator.mul, prices, quantities))\nprint(f\"Line totals: {totals}\")",
        "output": "Total after tax: $1265.00\nTop student: {'name': 'Bob', 'grade': 92, 'age': 20}\nLine totals: [20, 60, 120]",
        "explanation": "Pipeline chains filter (positive), map (add 10% tax), reduce (sum). Sorted uses tuple key for multi-field sort. map with two iterables pairs elements via operator.mul."
      },
      {
        "level": "advanced",
        "code": "# Custom reduce patterns and partial application\nfrom functools import reduce, partial\n\ndef mode(data):\n    def count(acc, x):\n        acc[x] = acc.get(x, 0) + 1\n        return acc\n    freq = reduce(count, data, {})\n    return max(freq.items(), key=lambda x: x[1])[0]\n\nprint(f\"Mode: {mode([1,2,2,3,2,4,2,5])}\")\n\ndef create_scaler(mean, std):\n    return lambda x: (x - mean) / std\n\nstandardize = create_scaler(50, 10)\nscores = [60, 45, 70, 55, 80]\nstandardized = list(map(standardize, scores))\nprint(f\"Standardized: {standardized}\")\n\nfrom collections import defaultdict\n\ndef group_by(key_func, items):\n    def _group(acc, item):\n        acc[key_func(item)].append(item)\n        return acc\n    return reduce(_group, items, defaultdict(list))\n\nwords = ['apple', 'banana', 'avocado', 'cherry', 'apricot']\ngrouped = dict(group_by(lambda w: w[0], words))\nprint(f\"Grouped by first letter: {grouped}\")",
        "output": "Mode: 2\nStandardized: [1.0, -0.5, 2.0, 0.5, 3.0]\nGrouped by first letter: {'a': ['apple', 'avocado', 'apricot'], 'b': ['banana'], 'c': ['cherry']}",
        "explanation": "mode uses reduce to build a frequency dict. create_scaler returns a lambda closure with fixed parameters. group_by uses reduce with defaultdict(list) for functional grouping."
      }
    ],
    "realWorld": {
      "useCases": [
        {
          "industry": "Data Cleaning",
          "description": "map(normalize, raw_data) transforms readings. filter(valid_record, data) removes nulls. reduce(merge_records, chunks) merges batches."
        },
        {
          "industry": "Log Analysis",
          "description": "map(parse_line, log_file) parses logs. filter(lambda e: e.severity == 'ERROR', events) filters critical entries."
        },
        {
          "industry": "Feature Engineering",
          "description": "map(lambda row: extract_features(row), dataset). filter(complete_case, dataset). reduce(concat_datasets, shards)."
        }
      ],
      "caseStudy": {
        "problem": "A batch ML inference pipeline used explicit for loops for feature extraction, validation, and aggregation, taking 8+ hours per run.",
        "solution": "Refactored to lazy map/filter chains with chunked processing. Heavy extraction used multiprocessing.Pool.map(). Final reduce used divide-and-conquer.",
        "results": "Runtime dropped from 8 hours to 45 minutes. Code became declarative—30 lines instead of 200+ of nested loops. Adding steps became single .map() calls."
      },
      "bestPractices": [
        "Use named functions instead of lambdas when logic is reused",
        "Prefer list comprehensions over map/filter for simple transformations",
        "Use operator module functions over handwritten lambdas",
        "Chain map/filter/reduce for lazy pipelines; materialize only at end",
        "Use functools.reduce only when no built-in aggregation exists",
        "Avoid side effects inside lambdas and callbacks",
        "Use partial() to pre-fill function arguments instead of wrapping in lambdas"
      ],
      "tools": [
        "functools — reduce, partial, wraps, lru_cache, singledispatch",
        "operator — add, mul, sub, truediv, itemgetter, attrgetter",
        "itertools — chain, starmap, accumulate (reduce-like), groupby",
        "multiprocessing.Pool.map — Parallel map across CPU cores",
        "builtins.map — Lazy function application over iterables",
        "builtins.filter — Lazy predicate-based element selection",
        "builtins.sorted — Sorting with lambda key for custom ordering"
      ],
      "jobRoles": [
        "Data Engineer — Functional data pipelines with map/reduce",
        "Big Data Engineer — Map/reduce concepts for PySpark jobs",
        "ML Engineer — Parallel feature extraction with Pool.map",
        "DevOps Engineer — Log processing with map/filter/reduce",
        "Financial Analyst — Cumulative calculations with reduce patterns"
      ],
      "furtherReading": [
        {
          "title": "PEP 255 — Simple Generators",
          "url": "https://peps.python.org/pep-0255/"
        },
        {
          "title": "functools module documentation",
          "url": "https://docs.python.org/3/library/functools.html"
        },
        {
          "title": "Lambda Functions in Python",
          "url": "https://realpython.com/python-lambda/"
        },
        {
          "title": "Map, Filter, and Reduce in Python",
          "url": "https://realpython.com/map-filter-reduce-python/"
        }
      ]
    },
    "quiz": [
      {
        "type": "mcq",
        "question": "What does list(filter(None, [0, 1, '', 'a', [], [1]])) return?",
        "options": [
          "[1, 'a', [1]]",
          "[0, '', []]",
          "[0, 1, 'a', [1]]",
          "['a']"
        ],
        "answer": "[1, 'a', [1]]"
      },
      {
        "type": "truefalse",
        "question": "In Python 3, map() returns a list.",
        "answer": "False"
      },
      {
        "type": "fillblank",
        "question": "The _____ keyword is used to create small anonymous functions in Python.",
        "answer": "lambda"
      },
      {
        "type": "code",
        "question": "What is the output of reduce(lambda a, b: a if a > b else b, [3, 7, 2, 9, 5])?",
        "options": [
          "9",
          "2",
          "26",
          "5"
        ],
        "answer": "9"
      },
      {
        "type": "match",
        "question": "Match function to its behavior:",
        "pairs": {
          "map": "Apply function to every element",
          "filter": "Keep elements where predicate is truthy",
          "reduce": "Cumulatively combine elements",
          "sorted": "Return sorted list with key function"
        }
      }
    ]
  },
  "p1-modules-packages": {
    "theory": "Modules and packages are Python's mechanism for organizing code into reusable, namespaced units. A module is simply a .py file containing Python definitions and statements. A package is a directory containing an __init__.py file (can be empty) that organizes related modules into a hierarchical structure. Python's import system provides several ways to load modules: import module, from module import name, import module as alias, and from module import * (discouraged).\n\nWhen a module is imported, Python executes all top-level code in that module once and caches it in sys.modules. Subsequent imports use the cached module object—this means module-level code runs only once per interpreter session. The import search path is defined by sys.path, which includes: the directory of the script being run, PYTHONPATH environment variable, and site-packages (where pip installs third-party packages).\n\nThe __init__.py file controls what a package exports. It can contain initialization code, define __all__ (list of names exported by from package import *), and provide convenient imports of submodules. Namespace packages (Python 3.3+) allow splitting a package across multiple directories without __init__.py files, useful for large distributed projects.\n\nRelative imports use dots: . (current package), .. (parent package), .module (sibling module). These work only inside packages and are preferred for internal references because they make code resilient to package renaming. Absolute imports provide full path from the project root and are preferred for external dependencies.\n\nFor AI/ML work, modules organize ML pipelines: data.py handles loading, model.py defines architectures, train.py manages training loops, utils.py provides helper functions. Packages group related functionality: models/, datasets/, utils/, configs/. Understanding sys.path and the import system is essential for setting up ML projects correctly, managing configuration files, and creating reusable ML libraries.",
    "keyDefinitions": [
      {
        "term": "Module",
        "definition": "A single .py file containing Python code, imported using the import statement. Can define functions, classes, and variables.",
        "example": "import math — imports the math module providing access to math.sqrt, math.pi, etc."
      },
      {
        "term": "Package",
        "definition": "A directory containing an __init__.py file that organizes related modules into a namespace hierarchy.",
        "example": "import numpy as np — numpy is a package with submodules like numpy.linalg and numpy.random."
      },
      {
        "term": "sys.modules Cache",
        "definition": "A dictionary of all imported modules, keyed by module name. Python checks this cache first before loading a module again.",
        "example": "sys.modules['math'] returns the already-imported math module object; duplicate imports are no-ops."
      },
      {
        "term": "Namespace Package",
        "definition": "A package without __init__.py (Python 3.3+) that can span multiple directories on sys.path, allowing distributed packages.",
        "example": "google.cloud package spans google-cloud-core and google-cloud-storage installed in different locations."
      }
    ],
    "formulas": [
      {
        "title": "Module Search Path",
        "formula": "sys.path = [script_dir] + PYTHONPATH + site_packages",
        "explanation": "Python searches for modules in order: the directory containing the entry-point script, directories listed in PYTHONPATH environment variable, and site-packages (third-party installations). The first matching .py file is loaded.",
        "example": ">>> import sys; sys.path[0]  # script directory\n'C:/Users/me/myproject'\n>>> sys.path[-1]            # site-packages\n'C:/Python39/lib/site-packages'"
      },
      {
        "title": "Import Caching",
        "formula": "import module = sys.modules.get('module') or _load_and_cache('module')",
        "explanation": "Python checks sys.modules first. If the module is already cached, the import is a no-op (no disk I/O, no re-execution). If not cached, Python finds, loads, and executes the module, then caches it.",
        "example": "import time; time.sleep(1); import time  # second import is instant (cached)"
      }
    ],
    "whyItMatters": "Every AI/ML project is an exercise in module and package organization. Team projects need clear separation of concerns—data loading, model definitions, training loops, evaluation, configuration. The import system determines how these components communicate. Understanding relative vs absolute imports prevents the dreaded 'attempted relative import beyond top-level package' error. Proper __init__.py design creates clean public APIs for ML libraries and frameworks.",
    "architecture": {
      "title": "Python Import System Architecture",
      "description": "The flow of Python's import machinery from import statement to fully loaded module.",
      "blocks": [
        {
          "label": "import statement",
          "description": "Python bytecode IMPORT_NAME instruction triggers the import machinery"
        },
        {
          "label": "sys.modules check",
          "description": "Checks if module already loaded; if so, returns cached version immediately"
        },
        {
          "label": "Finders (sys.meta_path)",
          "description": "Built-in and custom finders search for module location: importlib.machinery.PathFinder, etc."
        },
        {
          "label": "Loaders",
          "description": "SourceFileLoader reads .py, SourcelessFileLoader reads .pyc, ExtensionFileLoader loads .pyd"
        },
        {
          "label": "Module Execution",
          "description": "Module code executed in new namespace; object cached in sys.modules; name bound in caller's namespace"
        }
      ]
    },
    "understanding": {
      "analogy": "Modules and packages are like a library filing system. A module is a single book (a .py file) on a specific topic. A package is a bookshelf section containing related books (the directory with __init__.py as the section guide). import math is like walking to the math section and grabbing the book. from math import sqrt is like photocopying just the page you need. __init__.py is the guide at the start of each section listing key topics. sys.path is the library map showing where to find different sections (the main collection, special collections, and donated books).",
      "steps": [
        {
          "title": "Create Simple Modules",
          "content": "Write a .py file with functions and classes. Import it in another script with import filename (no .py). Access names with filename.function()."
        },
        {
          "title": "Organize Code into Packages",
          "content": "Create a directory with __init__.py. Add submodule .py files. Import with import package.module or from package import module."
        },
        {
          "title": "Master Import Variants",
          "content": "Use import module for full namespace. Use from module import name for direct access. Use import module as alias for conflicts or convenience."
        },
        {
          "title": "Handle Intra-Package Imports",
          "content": "Use relative imports: from . import sibling, from .. import parent, from .sub import thing. These work only inside packages."
        },
        {
          "title": "Manage sys.path and Install Packages",
          "content": "Use pip install to add to site-packages. Set PYTHONPATH for project-local modules. Use python -m to run packages as scripts."
        }
      ],
      "misconceptions": [
        {
          "misconception": "Importing a module multiple times re-executes it each time.",
          "truth": "Python caches modules in sys.modules. The first import loads and executes; subsequent imports are a simple dict lookup—a fast no-op."
        },
        {
          "misconception": "The __init__.py file is required in all packages.",
          "truth": "Python 3.3+ supports namespace packages without __init__.py. However, regular packages still use __init__.py for initialization and controlled exports."
        }
      ]
    },
    "codeExamples": [
      {
        "level": "basic",
        "code": "# Creating and importing a module\n# Save as: my_math.py\n\ndef add(a, b):\n    return a + b\n\ndef multiply(a, b):\n    return a * b\n\nPI = 3.14159\n\n# In another file:\nimport my_math\n\nresult = my_math.add(5, 3)\nprint(f\"5 + 3 = {result}\")\nprint(f\"PI = {my_math.PI}\")\n\nfrom my_math import multiply\nprint(f\"4 * 7 = {multiply(4, 7)}\")\n\n# Check cache\nimport sys\nprint(f\"my_math in sys.modules: {'my_math' in sys.modules}\")",
        "output": "5 + 3 = 8\nPI = 3.14159\n4 * 7 = 28\nmy_math in sys.modules: True",
        "explanation": "import my_math loads the module and creates a namespace. Access via my_math.add(), my_math.PI. from my_math import multiply brings just the function into the current namespace. sys.modules confirms caching."
      },
      {
        "level": "intermediate",
        "code": "# Package structure and __init__.py\n# Directory: shapes/\n#   __init__.py\n#   circle.py\n#   rectangle.py\n\n# shapes/__init__.py\nfrom .circle import Circle\nfrom .rectangle import Rectangle\n__all__ = ['Circle', 'Rectangle']\n\n# shapes/circle.py\nimport math\n\nclass Circle:\n    def __init__(self, radius):\n        self.radius = radius\n    def area(self):\n        return math.pi * self.radius ** 2\n\n# shapes/rectangle.py\nclass Rectangle:\n    def __init__(self, w, h):\n        self.w, self.h = w, h\n    def area(self):\n        return self.w * self.h\n\n# Usage\nfrom shapes import Circle, Rectangle\n# or: from shapes.circle import Circle\n\nc = Circle(5)\nr = Rectangle(3, 4)\nprint(f\"Circle area: {c.area():.2f}\")\nprint(f\"Rectangle area: {r.area()}\")\n\n# Check __all__\nfrom shapes import *\nprint(\"Imported:\", [x for x in dir() if not x.startswith('_') and x != 'math'])",
        "output": "Circle area: 78.54\nRectangle area: 12\nImported: ['Circle', 'Rectangle']",
        "explanation": "Package with __init__.py imports submodule classes into the package namespace. __all__ controls from package import *. Relative imports (from .circle import Circle) reference sibling modules."
      },
      {
        "level": "advanced",
        "code": "# Dynamic imports, reload, and importlib\nimport importlib\nimport sys\n\n# Dynamic import by string name\nmodule_name = \"json\"\njson_module = importlib.import_module(module_name)\ndata = json_module.dumps({\"key\": \"value\"})\nprint(f\"Dynamic import result: {data}\")\n\n# Module reload (during development)\n# import my_module\n# importlib.reload(my_module)  # re-executes module code\n\n# Creating a namespace package\n# Directory structure:\n# package_a/\n#   submodule.py\n# package_b/\n#   submodule.py\n# Both on sys.path with no __init__.py (Python 3.3+)\n\n# Checking and manipulating sys.path\nimport os\ncwd = os.getcwd()\nsys.path.insert(0, cwd)  # add current dir to search path\nprint(f\"\\nsys.path[0]: {sys.path[0]}\")\nprint(f\"Total paths: {len(sys.path)}\")\n\n# Lazy loading pattern\ndef lazy_import(name):\n    \"\"\"Import and cache on first access.\"\"\"\n    if name not in sys.modules:\n        importlib.import_module(name)\n    return sys.modules[name]\n\n# os = lazy_import('os')  # Only imports when accessed\n\nprint(f\"Module spec: {importlib.util.find_spec('json')}\")",
        "output": "Dynamic import result: {\"key\": \"value\"}\n\nsys.path[0]: D:\\Ajay\\ai-learning-hub\nTotal paths: 11\nModule spec: ModuleSpec(name='json', loader=<class '_frozen_importlib.BuiltinImporter'>, origin='built-in')",
        "explanation": "importlib.import_module() enables dynamic imports by string name. importlib.reload() re-executes module code for development. sys.path manipulation controls module search order. lazy_import pattern defers loading until first use. find_spec() returns module metadata."
      }
    ],
    "realWorld": {
      "useCases": [
        {
          "industry": "Web Development",
          "description": "Django apps are Python packages with models.py, views.py, urls.py. Each app is a reusable package distributed via pip."
        },
        {
          "industry": "ML Projects",
          "description": "Typical structure: src/data/, src/models/, src/training/, configs/, tests/. Each directory is a package with __init__.py."
        },
        {
          "industry": "Open Source Libraries",
          "description": "Libraries like pandas, numpy, scikit-learn are complex packages with nested subpackages: pandas.core.frame, pandas.io.parquet."
        }
      ],
      "caseStudy": {
        "problem": "A large ML monorepo had 50+ researchers editing shared modules. Circular imports and ambiguous relative imports caused frequent breakage and deployment delays.",
        "solution": "Adopted a strict package structure: src/package/{data,models,train,eval,utils} with explicit __all__ in each __init__.py. Enforced absolute imports. Used import-linter to detect circular dependencies.",
        "results": "Circular import errors eliminated. Deployment failure rate dropped 80%. New team members could understand project structure from __init__.py files. Package boundaries enabled independent testing."
      },
      "bestPractices": [
        "Always use absolute imports for external dependencies, relative for internal",
        "Keep __init__.py files minimal—just re-exports and a version string",
        "Define __all__ in all __init__.py files to control public API",
        "Avoid circular imports—restructure shared code into a common module",
        "Use python -m package.module to run modules inside packages",
        "Set up src-layout projects to keep tests separate from source code",
        "Use namespace packages for cross-project shared components"
      ],
      "tools": [
        "pip — Standard package installer for modules from PyPI",
        "virtualenv/venv — Isolated Python environments for dependency management",
        "setuptools — Build and distribute Python packages with setup.py/pyproject.toml",
        "importlib — Standard library for dynamic imports, reloading, and spec introspection",
        "pkgutil — Utilities for working with packages and namespace packages",
        "import-linter — Detect and prevent circular imports in large projects",
        "modulefinder — Analyze module dependencies and find missing modules"
      ],
      "jobRoles": [
        "Python Developer — Structures code into modules and packages for maintainability",
        "ML Engineer — Organizes ML pipelines into importable, tested packages",
        "Open Source Maintainer — Designs public APIs with clean package hierarchy",
        "DevOps Engineer — Manages Python environments and dependency resolution",
        "Data Engineer — Builds reusable data processing packages with clear interfaces"
      ],
      "furtherReading": [
        {
          "title": "PEP 328 — Multi-line Imports",
          "url": "https://peps.python.org/pep-0328/"
        },
        {
          "title": "PEP 420 — Namespace Packages",
          "url": "https://peps.python.org/pep-0420/"
        },
        {
          "title": "Python import system documentation",
          "url": "https://docs.python.org/3/reference/import.html"
        },
        {
          "title": "Structuring Python Project Guide",
          "url": "https://docs.python-guide.org/writing/structure/"
        }
      ]
    },
    "quiz": [
      {
        "type": "mcq",
        "question": "What is a regular Python package?",
        "options": [
          "A .py file",
          "A directory with __init__.py",
          "A zip file",
          "A JSON file"
        ],
        "answer": "A directory with __init__.py"
      },
      {
        "type": "truefalse",
        "question": "Importing a module twice using import statement re-executes the module code.",
        "answer": "False"
      },
      {
        "type": "fillblank",
        "question": "The _____ variable lists all directories Python searches for modules.",
        "answer": "sys.path"
      },
      {
        "type": "code",
        "question": "In a package, what does from . import sibling mean?",
        "options": [
          "Absolute import of sibling",
          "Relative import of sibling in same package",
          "Import from parent package",
          "Import from subpackage"
        ],
        "answer": "Relative import of sibling in same package"
      },
      {
        "type": "match",
        "question": "Match concept to description:",
        "pairs": {
          "__init__.py": "Makes a directory a package",
          "sys.modules": "Module cache dictionary",
          "sys.path": "Module search path list",
          "__all__": "Controls from X import * exports"
        }
      }
    ]
  },
  "p1-oop": {
    "theory": "Object-Oriented Programming (OOP) in Python provides a paradigm for organizing code into classes and objects that encapsulate data and behavior. Python's OOP is more flexible than statically-typed languages like Java—everything is an object, classes are themselves objects (metaclasses), and methods can be added, modified, or removed at runtime. A class is defined with the class keyword, and instances are created by calling the class as a constructor.\n\nThe __init__ method is the constructor that initializes instance attributes. The self parameter refers to the instance being created or operated on. Instance attributes are unique to each object, while class attributes are shared across all instances. The @classmethod decorator creates methods that receive the class (cls) instead of the instance, and @staticmethod creates methods with no automatic first parameter (like regular functions but namespaced under the class).\n\nPython supports inheritance: a class can inherit from multiple parent classes (multiple inheritance). Method Resolution Order (MRO) determines which method is called when a method exists in multiple parent classes—Python uses the C3 linearization algorithm. The super() function delegates method calls to the next class in the MRO chain, enabling cooperative multiple inheritance through the diamond pattern.\n\nEncapsulation is achieved through naming conventions: a single underscore prefix (_attr) indicates a protected attribute (internal use, not enforced), while double underscore prefix (__attr) triggers name mangling to _Classname__attr, making it harder (but not impossible) to access from outside. This is privacy by convention, not enforcement.\n\nFor AI/ML work, OOP is fundamental. Neural network layers are classes inheriting from nn.Module in PyTorch. Custom datasets inherit from Dataset. Models, optimizers, schedulers, and loss functions are all objects with well-defined interfaces. Understanding OOP is essential for extending ML frameworks, building custom training loops, and creating reusable model components. The decorator pattern (with @) and mixin classes are extensively used in ML framework design.",
    "keyDefinitions": [
      {
        "term": "Class vs Instance",
        "definition": "A class is a blueprint defining structure and behavior; an instance is a concrete object created from that blueprint with its own attribute values.",
        "example": "class Dog: ...; my_dog = Dog() — Dog is the class, my_dog is an instance."
      },
      {
        "term": "Method Resolution Order (MRO)",
        "definition": "The order in which Python searches for methods in a class hierarchy, determined by the C3 linearization algorithm and accessible via ClassName.__mro__.",
        "example": "class A: pass; class B(A): pass; B.__mro__ shows (<class 'B'>, <class 'A'>, <class 'object'>)."
      },
      {
        "term": "Name Mangling",
        "definition": "Python's mechanism where attributes prefixed with __ (double underscore) are renamed to _ClassName__attribute to avoid accidental overriding in subclasses.",
        "example": "class C: def __init__(self): self.__x = 1; C().__x raises AttributeError; C()._C__x returns 1."
      },
      {
        "term": "Duck Typing",
        "definition": "A programming style where an object's suitability is determined by the presence of certain methods and properties, rather than its actual type.",
        "example": "If it walks like a duck and quacks like a duck, it's a duck—no formal interface needed."
      }
    ],
    "formulas": [
      {
        "title": "C3 Linearization (MRO)",
        "formula": "L[C] = C + merge(L[B1], L[B2], ..., B1 B2 ...)\nmerge(...) = take first head not in tail of any list",
        "explanation": "Python's MRO is computed by the C3 linearization algorithm. For class C(B1, B2, ...), the linearization is C plus the merge of the parent linearizations. The merge picks the first head element that doesn't appear in any tail, maintaining monotonicity.",
        "example": "class A: pass\nclass B(A): pass\nclass C(A): pass\nclass D(B, C): pass\n# D.__mro__ = D, B, C, A, object"
      },
      {
        "title": "super() Delegation",
        "formula": "super(C, self).method() = MRO[C+1].method(self)",
        "explanation": "super() returns a proxy object that delegates method calls to the next class in the MRO after the current class. This ensures all classes in the inheritance chain get called in the correct order.",
        "example": "class A: def f(self): print('A'); class B(A): def f(self): super().f(); print('B'); B().f() prints 'A' then 'B'"
      }
    ],
    "whyItMatters": "OOP is the structural foundation of all major ML frameworks. PyTorch's nn.Module, TensorFlow's tf.keras.Model, sklearn's BaseEstimator—all are classes with inheritance hierarchies. Custom models are implemented by subclassing these base classes and overriding key methods (forward, __init__). Understanding MRO is critical for resolving conflicts in complex model hierarchies. Name mangling prevents attribute collisions in large collaborative ML codebases.",
    "architecture": {
      "title": "Python Class Object Model",
      "description": "How Python represents classes and instances internally with type instances and metaclasses.",
      "blocks": [
        {
          "label": "type (metaclass)",
          "description": "The default metaclass that creates class objects. type.__call__ invokes __new__ and __init__"
        },
        {
          "label": "Class Object (PyTypeObject)",
          "description": "The class itself—an instance of type. Contains method table, MRO, __dict__ descriptor"
        },
        {
          "label": "Instance Object (PyObject)",
          "description": "Concrete instance with __dict__ (or __slots__) storing instance attributes"
        },
        {
          "label": "Method Resolution Order",
          "description": "Tuple of classes stored in __mro__, computed by C3 linearization"
        },
        {
          "label": "Descriptor Protocol",
          "description": "__get__, __set__, __delete__ methods enabling properties, classmethods, staticmethods"
        }
      ]
    },
    "understanding": {
      "analogy": "OOP is like a car manufacturing system. A class is the blueprint for a car model—it specifies that every car has wheels, an engine, and doors (attributes), and can start(), stop(), and steer() (methods). Each actual car built from that blueprint is an instance—it has its own color, VIN, and mileage (instance attributes), while all cars share the same number of wheels (class attribute). Inheritance is like a 'SUV' class extending 'Car'—it inherits all Car features but adds four-wheel-drive capability. super() is like calling the parent factory line before adding SUV-specific features.",
      "steps": [
        {
          "title": "Define Classes with __init__",
          "content": "Use class ClassName: with def __init__(self, ...): to initialize instance attributes. Always include self as the first parameter of instance methods."
        },
        {
          "title": "Use Inheritance for Code Reuse",
          "content": "Create child classes that extend parent behavior. Override methods from the parent. Use super().__init__() to invoke parent constructors."
        },
        {
          "title": "Apply Encapsulation with Conventions",
          "content": "Use _prefix for internal implementation details. Use __prefix for name-mangled attributes that should not be overridden by subclasses."
        },
        {
          "title": "Leverage Properties and Descriptors",
          "content": "Use @property for computed attributes with getter/setter/deleter control. This maintains a clean API while allowing internal implementation changes."
        },
        {
          "title": "Understand Metaclasses and ABCs",
          "content": "Use Abstract Base Classes (ABCs) from abc module for defining interfaces. Metaclasses customize class creation behavior (advanced—use sparingly)."
        }
      ],
      "misconceptions": [
        {
          "misconception": "self is a special keyword in Python.",
          "truth": "self is a naming convention, not a keyword. You could name it anything (e.g., this), but the first parameter of an instance method always receives the instance. self is universally expected."
        },
        {
          "misconception": "__private attributes are truly private.",
          "truth": "Name mangling just renames __attr to _ClassName__attr. It's still accessible from outside if you know the mangled name. It prevents accidental overriding in subclasses but is not security."
        }
      ]
    },
    "codeExamples": [
      {
        "level": "basic",
        "code": "# Basic class definition and instantiation\nclass Dog:\n    species = \"Canis familiaris\"\n\n    def __init__(self, name, age):\n        self.name = name\n        self.age = age\n\n    def bark(self):\n        return f\"{self.name} says Woof!\"\n\n    def __str__(self):\n        return f\"{self.name} ({self.age} years old)\"\n\ndog1 = Dog(\"Buddy\", 3)\ndog2 = Dog(\"Lucy\", 5)\nprint(dog1)\nprint(dog1.bark())\nprint(f\"Species: {Dog.species}\")\nprint(f\"Total dogs: {Dog.count}\" if hasattr(Dog, 'count') else \"No counter\")",
        "output": "Buddy (3 years old)\nBuddy says Woof!\nSpecies: Canis familiaris\nNo counter",
        "explanation": "Basic class with class attribute (species shared by all instances), instance attributes (name, age unique per instance), instance method (bark), and __str__ for string representation."
      },
      {
        "level": "intermediate",
        "code": "# Inheritance and super()\nclass Animal:\n    def __init__(self, name):\n        self.name = name\n    def speak(self):\n        raise NotImplementedError\n\nclass Cat(Animal):\n    def __init__(self, name, lives=9):\n        super().__init__(name)\n        self.lives = lives\n    def speak(self):\n        return f\"{self.name} says Meow!\"\n\nclass Dog(Animal):\n    def speak(self):\n        return f\"{self.name} says Woof!\"\n\nanimals = [Cat(\"Whiskers\"), Dog(\"Buddy\"), Cat(\"Felix\", 7)]\nfor a in animals:\n    print(a.speak())\n\n# Mixin pattern\nclass LogMixin:\n    def log(self, msg):\n        print(f\"[LOG] {self.__class__.__name__}: {msg}\")\n\nclass LoggedDog(Dog, LogMixin):\n    def speak(self):\n        self.log(\"about to speak\")\n        return super().speak()\n\nld = LoggedDog(\"Rover\")\nprint(ld.speak())",
        "output": "Whiskers says Meow!\nBuddy says Woof!\nFelix says Meow!\n[LOG] LoggedDog: about to speak\nRover says Woof!",
        "explanation": "Inheritance with super() calls parent __init__. Polymorphism via speak() on different animals. Mixin class adds logging capability. MRO resolves method lookup correctly."
      },
      {
        "level": "advanced",
        "code": "# Property decorators and descriptors\nimport math\n\nclass Circle:\n    def __init__(self, radius):\n        self._radius = radius\n\n    @property\n    def radius(self):\n        return self._radius\n\n    @radius.setter\n    def radius(self, value):\n        if value < 0:\n            raise ValueError(\"Radius cannot be negative\")\n        self._radius = value\n\n    @property\n    def area(self):\n        return math.pi * self._radius ** 2\n\n    @property\n    def diameter(self):\n        return self._radius * 2\n\nc = Circle(5)\nprint(f\"Radius: {c.radius}, Area: {c.area:.2f}, Diameter: {c.diameter}\")\nc.radius = 10\nprint(f\"After update - Area: {c.area:.2f}\")\n\n# Descriptor protocol for reusable validation\nclass PositiveNumber:\n    def __set_name__(self, owner, name):\n        self.name = f\"_{name}\"\n    def __get__(self, obj, objtype=None):\n        return getattr(obj, self.name, 0)\n    def __set__(self, obj, value):\n        if value < 0:\n            raise ValueError(f\"{self.name[1:]} must be positive\")\n        setattr(obj, self.name, value)\n\nclass Temperature:\n    celsius = PositiveNumber()\n    def __init__(self, celsius):\n        self.celsius = celsius\n\nt = Temperature(25)\nprint(f\"Temperature: {t.celsius}C\")\n# t.celsius = -5 would raise ValueError",
        "output": "Radius: 5, Area: 78.54, Diameter: 10\nAfter update - Area: 314.16\nTemperature: 25C",
        "explanation": "@property decorators define computed attributes with getter/setter/validation. The descriptor protocol (__set_name__, __get__, __set__) creates reusable validation logic applied across attributes."
      }
    ],
    "realWorld": {
      "useCases": [
        {
          "industry": "Web Frameworks",
          "description": "Django uses class-based views inheriting from View. Models inherit from django.db.models.Model with metaclass-based ORM."
        },
        {
          "industry": "Game Development",
          "description": "Game objects (Player, Enemy, Projectile) inherit from a base GameObject class with shared update() and render() methods."
        },
        {
          "industry": "ML Frameworks",
          "description": "PyTorch models inherit nn.Module. Custom datasets inherit Dataset. Custom optimizers inherit Optimizer."
        }
      ],
      "caseStudy": {
        "problem": "A research team built hundreds of model architectures with duplicated boilerplate for training loops, logging, checkpointing, and device management.",
        "solution": "Created a base ModelTemplate class with hooks for forward(), training_step(), validation_step(), and configure_optimizers(). All models inherited from it.",
        "results": "95% reduction in code duplication. Adding a new model required only overriding forward() and configuring hyperparameters. The template pattern was later open-sourced as a research framework."
      },
      "bestPractices": [
        "Favor composition over inheritance (use mixins and delegation)",
        "Keep inheritance hierarchies shallow (max 3-4 levels)",
        "Use super() in all __init__ methods in a hierarchy",
        "Prefer @property over getter/setter methods",
        "Use ABCs (abc.ABC) to define interfaces enforce contracts",
        "Document the expected interface for subclasses",
        "Use __slots__ in classes with many instances for memory efficiency"
      ],
      "tools": [
        "abc — Abstract Base Classes for defining interfaces with @abstractmethod",
        "dataclasses — Auto-generate __init__, __repr__, __eq__ for data-holding classes",
        "typing — Protocol for structural subtyping (static duck typing)",
        "inspect — Introspect class hierarchies, methods, and attributes",
        "pydantic — Data validation with type annotations and JSON schema generation",
        "attrs — Library for defining classes without boilerplate (alternative to dataclasses)",
        "pickle — Serialize class instances for persistence or distributed computing"
      ],
      "jobRoles": [
        "Software Architect — Designs class hierarchies and interfaces for large systems",
        "ML Engineer — Implements models as subclasses of framework base classes",
        "Framework Developer — Builds extensible base classes with hooks and templates",
        "Game Developer — Designs GameObject inheritance trees with mixin behaviors",
        "Library Maintainer — Creates public APIs with clean class-based interfaces"
      ],
      "furtherReading": [
        {
          "title": "PEP 3115 — Metaclasses",
          "url": "https://peps.python.org/pep-3115/"
        },
        {
          "title": "Python Descriptor Protocol Guide",
          "url": "https://realpython.com/python-descriptors/"
        },
        {
          "title": "super() Considered Super!",
          "url": "https://rhettinger.wordpress.com/2011/05/26/super-considered-super/"
        },
        {
          "title": "Python 3's MRO Documentation",
          "url": "https://www.python.org/download/releases/2.3/mro/"
        }
      ]
    },
    "quiz": [
      {
        "type": "mcq",
        "question": "What is the first parameter of any instance method in Python?",
        "options": [
          "self",
          "this",
          "instance",
          "cls"
        ],
        "answer": "self"
      },
      {
        "type": "truefalse",
        "question": "Python supports multiple inheritance.",
        "answer": "True"
      },
      {
        "type": "fillblank",
        "question": "The _____ function delegates method calls to the next class in the MRO.",
        "answer": "super()"
      },
      {
        "type": "code",
        "question": "What does class A: pass; class B(A): pass; print(B.__bases__) output?",
        "options": [
          "(<class 'object'>,)",
          "(<class 'A'>,)",
          "(<class 'A'>, <class 'object'>)",
          "(<class 'B'>,)"
        ],
        "answer": "(<class 'A'>,)"
      },
      {
        "type": "match",
        "question": "Match OOP concept to description:",
        "pairs": {
          "MRO": "Method resolution order",
          "super()": "Parent class delegation",
          "__slots__": "Memory optimization",
          "@property": "Computed attributes"
        }
      }
    ]
  },
  "p1-testing-debugging": {
    "theory": "Testing in Python ensures code correctness through automated verification. The unittest module (built-in) provides xUnit-style testing with TestCase classes, setUp/tearDown for fixtures, and assertion methods (assertEqual, assertTrue, assertRaises). pytest, a third-party framework, is more popular due to its concise syntax (plain assert statements, fixtures as function parameters, auto-discovery) and rich plugin ecosystem.\n\nTest organization follows the Arrange-Act-Assert pattern: set up preconditions, execute the code under test, and verify the outcome. Tests are categorized as: unit tests (individual functions/classes), integration tests (module interactions), and end-to-end tests (full system). Mock/patch (from unittest.mock) replaces real dependencies with controlled substitutes, enabling isolated testing without network, database, or file system dependencies.\n\nDebugging in Python involves multiple tools: print() debugging (simplest but limited), logging (structured with levels: DEBUG, INFO, WARNING, ERROR), pdb (interactive debugger with breakpoints, stepping, variable inspection), and IDE-integrated debuggers. The pdb module supports commands: n (next), s (step into), c (continue), l (list source), p (print variable), b (set breakpoint), and q (quit). Python 3.7+ includes breakpoint() which calls pdb.set_trace() by default but can be customized via PYTHONBREAKPOINT environment variable.\n\nProfiling identifies performance bottlenecks. cProfile (built-in) records function call counts and timing. snakeviz visualizes cProfile output. timeit measures small code snippets precisely. line_profiler and memory_profiler provide line-by-line analysis. Understanding profiling results helps optimize ML code: vectorizing operations, reducing function call overhead, using appropriate data structures.\n\nFor AI/ML work, testing validates: data preprocessing (edge cases like missing values, outliers), model behavior (output shapes, value ranges), training loops (gradient computation, loss values), and inference (batch vs single prediction consistency). Debugging ML code requires specialized approaches: gradient checking (verify backpropagation numerically), NaN/Inf monitoring (detect numerical instability), and tensor shape assertions (prevent broadcasting bugs). pytest's parametrize decorator is invaluable for testing ML pipelines with multiple configurations.",
    "keyDefinitions": [
      {
        "term": "Test Fixture",
        "definition": "A fixed baseline state for tests, including setup (creating objects, loading data) and teardown (cleanup). pytest fixtures are function parameters with automatic lifecycle management.",
        "example": "@pytest.fixture; def dataset(): return load_test_data() — pytest injects this into any test function requesting the dataset parameter."
      },
      {
        "term": "Mock/Patch",
        "definition": "Techniques to replace real objects with controlled substitutes during testing. Mock records calls and returns configured values. Patch temporarily replaces objects in a scope.",
        "example": "with patch('module.open') as mock_open: mock_open.return_value.read.return_value = 'fake data' — tests file reading without real files."
      },
      {
        "term": "Breakpoint / pdb",
        "definition": "Python's interactive debugger that pauses execution at breakpoints for step-by-step inspection of variables, stack frames, and code flow.",
        "example": "breakpoint() in Python 3.7+ triggers pdb; at prompt: n (next line), p x (print x), l (list source), c (continue)."
      },
      {
        "term": "Parametrized Test",
        "definition": "A test that runs multiple times with different input/expected-output combinations, reducing code duplication and increasing coverage.",
        "example": "@pytest.mark.parametrize('input,expected', [(1,2), (2,4), (3,6)]); def test_double(input, expected): assert double(input) == expected"
      }
    ],
    "formulas": [
      {
        "title": "Test Coverage Estimation",
        "formula": "coverage = (lines_executed / total_lines) * 100%",
        "explanation": "Code coverage measures how much of the source code is executed during tests. The coverage.py tool instruments code and reports line/branch coverage. High coverage (>80%) is a good indicator, but coverage alone doesn't guarantee test quality.",
        "example": "pytest --cov=src --cov-report=html runs tests with coverage measurement and generates an HTML report showing which lines were/were not executed."
      },
      {
        "title": "Time Complexity Profiling (cProfile)",
        "formula": "total_time = sum(cumtime of all functions)\nper_call = cumtime / ncalls",
        "explanation": "cProfile records each function call's cumulative time (cumtime, including sub-calls) and per-call time. The top functions by cumtime are optimization targets. ncalls shows how often a function is called (useful for identifying redundant calls).",
        "example": "python -m cProfile -s cumtime train.py | head -10 shows the 10 slowest functions by cumulative time."
      }
    ],
    "whyItMatters": "Testing and debugging are critical for AI/ML code reliability. ML pipelines fail silently—wrong data types produce subtly incorrect results, NaN values propagate through calculations, and model performance degrades without errors. Tests catch these before deployment. Debugging ML code is harder than regular software because bugs may not cause crashes—they just produce wrong answers. Profiling identifies slow preprocessing steps that bottleneck training. pytest is the standard testing framework in ML projects, with plugins for distributed tests, parallel execution, and specialized ML testing (deepdiff for tensor comparison, hypothesis for property-based testing).",
    "architecture": {
      "title": "pytest Test Execution Architecture",
      "description": "How pytest discovers, collects, and executes tests with fixtures and plugins.",
      "blocks": [
        {
          "label": "Test Discovery",
          "description": "pytest collects files matching test_*.py or *_test.py in the specified directories"
        },
        {
          "label": "Test Collection",
          "description": "Inside collected files, pytest finds functions starting with test_ and classes starting with Test"
        },
        {
          "label": "Fixture Resolution",
          "description": "For each test, pytest resolves and executes requested fixtures (scope: function, class, module, session)"
        },
        {
          "label": "Test Execution",
          "description": "Each test runs with setup -> call -> teardown. Failures are caught and reported without stopping other tests"
        },
        {
          "label": "Reporting & Hooks",
          "description": "Results summarized. Plugins add: coverage, parallel execution (xdist), custom markers, assertion rewriting"
        }
      ]
    },
    "understanding": {
      "analogy": "Testing and debugging is like a quality control system in a car factory. Unit tests check individual parts (does this spark plug fire?). Integration tests check assemblies (do the engine and transmission work together?). parametrize is like testing the same part under different conditions (hot, cold, humid). Mock is a dummy part that behaves predictably for testing (a fake alternator that always produces exactly 12V). Debugging with pdb is like a mechanic attaching diagnostic tools to a running engine—stepping through each piston cycle (code line), inspecting fuel pressure (variable values), and finding where the misfire is. Profiling (cProfile) is like measuring fuel consumption per component to find the gas guzzler.",
      "steps": [
        {
          "title": "Write Unit Tests with pytest",
          "content": "Create test files in a tests/ directory. Write test functions prefixed with test_. Use assert statements for verification. Run with pytest -v for verbose output."
        },
        {
          "title": "Use Fixtures for Test Setup",
          "content": "Define @pytest.fixture functions that return test resources. Inject fixtures as test function parameters. Control scope (function/module/session) for expensive setup like model loading."
        },
        {
          "title": "Mock External Dependencies",
          "content": "Use unittest.mock.patch to replace network calls, file I/O, or database operations during tests. Configure return_value and side_effect to control mock behavior."
        },
        {
          "title": "Debug with breakpoint() and Logging",
          "content": "Insert breakpoint() at suspicious code locations. Use logging.debug() for permanent tracing. Run with python -m pdb script.py for full debugger control."
        },
        {
          "title": "Profile with cProfile and Optimize",
          "content": "Run python -m cProfile -s cumtime script.py to find bottlenecks. Focus on functions with high cumtime. Use snakeviz for visualization. Test optimizations with timeit."
        }
      ],
      "misconceptions": [
        {
          "misconception": "100% test coverage means bug-free code.",
          "truth": "Coverage only shows which lines ran, not whether they were tested correctly. A test can execute a line without asserting the right result. High coverage is valuable but insufficient—test logic quality matters more than line coverage numbers."
        },
        {
          "misconception": "pdb is the only way to debug Python.",
          "truth": "Modern alternatives include: IDE debuggers (VS Code, PyCharm) with GUI breakpoints and variable inspection, ipdb (pdb with IPython features), pudb (terminal GUI debugger), and logging-based debugging for production issues."
        }
      ]
    },
    "codeExamples": [
      {
        "level": "basic",
        "code": "# Basic pytest unit tests\n# Save as: test_math_ops.py\n\ndef add(a, b):\n    return a + b\n\ndef divide(a, b):\n    if b == 0:\n        raise ValueError(\"Cannot divide by zero\")\n    return a / b\n\ndef test_add():\n    assert add(2, 3) == 5\n    assert add(-1, 1) == 0\n    assert add(0, 0) == 0\n\ndef test_divide():\n    assert divide(10, 2) == 5.0\n    assert divide(7, 2) == 3.5\n\ndef test_divide_by_zero():\n    import pytest\n    with pytest.raises(ValueError, match=\"Cannot divide by zero\"):\n        divide(1, 0)\n\n# Run with: pytest test_math_ops.py -v\n# \n# Expected output:\n# test_math_ops.py::test_add PASSED\n# test_math_ops.py::test_divide PASSED\n# test_math_ops.py::test_divide_by_zero PASSED",
        "output": "test_math_ops.py::test_add PASSED\ntest_math_ops.py::test_divide PASSED\ntest_math_ops.py::test_divide_by_zero PASSED",
        "explanation": "pytest discovers test_ functions. assert statements verify correctness. pytest.raises checks that the expected exception is raised. Run with pytest -v for verbose output showing each test case."
      },
      {
        "level": "intermediate",
        "code": "# Fixtures, parametrize, and mocking\nimport pytest\nfrom unittest.mock import Mock, patch\nimport json\n\n# Fixture for reusable test data\n@pytest.fixture\ndef sample_data():\n    return {\n        'users': [\n            {'name': 'Alice', 'age': 30},\n            {'name': 'Bob', 'age': 25},\n            {'name': 'Charlie', 'age': 35},\n        ],\n        'config': {'threshold': 0.5}\n    }\n\ndef test_fixture_usage(sample_data):\n    assert len(sample_data['users']) == 3\n    assert sample_data['config']['threshold'] == 0.5\n\n# Parametrized test\n@pytest.mark.parametrize(\"age,expected_adult\", [\n    (17, False),\n    (18, True),\n    (25, True),\n    (0, False),\n    (-5, False),\n])\ndef test_is_adult(age, expected_adult):\n    def is_adult(age):\n        return age >= 18 and age < 120\n    assert is_adult(age) == expected_adult\n\n# Mocking external API\n@patch('json.loads')\ndef test_mock_example(mock_json_loads):\n    mock_json_loads.return_value = {'key': 'mocked_value'}\n    result = json.loads('{\"real\": \"data\"}')\n    assert result == {'key': 'mocked_value'}\n    mock_json_loads.assert_called_once_with('{\"real\": \"data\"}')\n\n# Test for logging warnings\nimport logging\ndef test_logging_warning(caplog):\n    import warnings\n    warnings.warn(\"Test warning\")\n    assert len(caplog.records) > 0",
        "output": "test_fixture PASSED\ntest_is_adult[17-False] PASSED\ntest_is_adult[18-True] PASSED\ntest_is_adult[25-True] PASSED\ntest_is_adult[0-False] PASSED\ntest_is_adult[-5-False] PASSED\ntest_mock_example PASSED\ntest_logging_warning PASSED",
        "explanation": "Fixtures provide reusable test setup injected as parameters. parametrize runs the same test with multiple inputs/expected outputs. @patch temporarily replaces json.loads with a mock. caplog captures log output for verification."
      },
      {
        "level": "advanced",
        "code": "# Debugging and profiling examples\nimport time\nimport functools\n\ndef slow_function(n):\n    \"\"\"A deliberately slow function for profiling.\"\"\"\n    total = 0\n    for i in range(n):\n        total += sum(j * j for j in range(100))\n    return total\n\n# Debugging with breakpoint simulation\ndef buggy_calculate(data):\n    result = 0\n    for i, value in enumerate(data):\n        # breakpoint()  # Uncomment to debug\n        result += value / (i + 1)\n    return result\n\n# Assert-based debugging (design by contract)\ndef preprocess_data(data):\n    \"\"\"Preprocess data with runtime assertions.\"\"\"\n    assert len(data) > 0, \"Empty data provided\"\n    assert all(isinstance(x, (int, float)) for x in data), \"Non-numeric data found\"\n    assert not any(x is None for x in data), \"None values in data\"\n\n    result = [x / max(data) for x in data]  # normalize\n\n    assert all(0.0 <= x <= 1.0 for x in result), \"Normalization out of range\"\n    assert not any(math.isnan(x) for x in result), \"NaN produced during normalization\"\n    return result\n\nimport math\n\nprint(f\"buggy_calculate([1,2,3]): {buggy_calculate([1,2,3])}\")\nprint(f\"preprocess_data([10, 20, 30]): {preprocess_data([10, 20, 30])}\")\n\n# Profile with cProfile\nimport cProfile\nimport pstats\n\nprofiler = cProfile.Profile()\nprofiler.enable()\nresult = slow_function(100)\nprofiler.disable()\n\n# Print top 5 functions by cumulative time\nstats = pstats.Stats(profiler)\nprint(\"\\n=== Profiling Results (top 5 cumtime) ===\")\nstats.sort_stats('cumtime').print_stats(5)\n\n# timeit for microbenchmarks\nimport timeit\nsetup = \"from __main__ import slow_function\"\nt = timeit.timeit(\"slow_function(10)\", setup=setup, number=5)\nprint(f\"\\ntimeit: slow_function(10) averaged {t/5:.4f}s per call\")",
        "output": "buggy_calculate([1,2,3]): 4.0\npreprocess_data([10, 20, 30]): [0.333..., 0.666..., 1.0]\n\n=== Profiling Results (top 5 cumtime) ===\n  ncalls  tottime  percall  cumtime  percall filename:lineno(function)\n       1    0.000    0.000    2.013    2.013 (slow_function)\n     100    0.000    0.000    2.013    0.020 <genexpr>(...)\n       1    0.000    0.000    0.000    0.000 (builtins.sum)\n       1    0.000    0.000    0.000    0.000 (builtins.range)\n       1    0.000    0.000    0.000    0.000 {method 'disable' ...}\n\ntimeit: slow_function(10) averaged 0.2013s per call",
        "explanation": "breakpoint() pauses at the line for interactive debugging. Runtime assertions (assert) catch invalid data early. cProfile records function timing—slow_function and its generator expression are the bottlenecks. timeit measures precise execution time for micro-optimization."
      }
    ],
    "realWorld": {
      "useCases": [
        {
          "industry": "CI/CD Pipelines",
          "description": "pytest runs in GitHub Actions/Jenkins on every commit. Tests include unit, integration, and model accuracy regression tests. Coverage reports enforce minimum thresholds."
        },
        {
          "industry": "ML Model Validation",
          "description": "Tests check: input/output tensor shapes match expectations, loss decreases during training, model produces valid probabilities, inference is deterministic with fixed seed."
        },
        {
          "industry": "Data Pipeline Testing",
          "description": "Tests validate: schema conformance, missing value handling, data type conversions, aggregation correctness. Great Expectations library extends pytest for data quality tests."
        }
      ],
      "caseStudy": {
        "problem": "A production ML inference service occasionally returned NaN predictions for valid inputs. The bug was intermittent and not caught by existing tests—it occurred only for specific feature value combinations.",
        "solution": "Added property-based tests using hypothesis library to generate random valid feature combinations. Identified the NaN was caused by log(0) in a feature transformation. Added explicit input validation with assertions, NaN-checking post-inference assertions, and a pytest test with edge-case values.",
        "results": "Bug was fixed and regression test prevents reoccurrence. Added 50+ property-based tests covering extreme, missing, and boundary feature values. Post-inference NaN checks reduced silent failures to zero."
      },
      "bestPractices": [
        "Write tests before code (TDD) for critical ML components",
        "Use parametrize to test edge cases without code duplication",
        "Mock external dependencies (APIs, databases, file system)",
        "Use hypothesis for property-based testing of ML pipelines",
        "Profile before optimizing—don't guess bottlenecks",
        "Use breakpoint() for debugging, not print() statements",
        "Measure code coverage and aim for >80% on critical paths"
      ],
      "tools": [
        "pytest — Testing framework with fixtures, parametrize, plugins",
        "unittest.mock — Mock/patch for replacing dependencies during tests",
        "coverage.py — Line/branch coverage measurement with HTML reports",
        "cProfile — Built-in profiler for function-level timing analysis",
        "pdb / ipdb — Interactive debuggers for stepping through code",
        "hypothesis — Property-based testing for discovering edge cases",
        "timeit — Precise timing of small code snippets"
      ],
      "jobRoles": [
        "Software Engineer in Test — Writes and maintains test suites for code quality",
        "ML Engineer — Implements model validation tests and data pipeline tests",
        "Backend Developer — Creates API integration tests with mocked services",
        "DevOps Engineer — Sets up CI/CD pipelines with automated test execution",
        "Data Engineer — Builds data quality tests and pipeline validation suites"
      ],
      "furtherReading": [
        {
          "title": "pytest documentation",
          "url": "https://docs.python.org/3/library/unittest.mock.html"
        },
        {
          "title": "Python Profilers (cProfile)",
          "url": "https://docs.python.org/3/library/profile.html"
        },
        {
          "title": "Real Python: pytest Guide",
          "url": "https://realpython.com/pytest-python-testing/"
        },
        {
          "title": "Hypothesis Documentation",
          "url": "https://hypothesis.readthedocs.io/"
        }
      ]
    },
    "quiz": [
      {
        "type": "mcq",
        "question": "What does pytest use for test discovery?",
        "options": [
          "Functions ending with _test",
          "Functions starting with test_",
          "Classes ending with Suite",
          "Files ending with _spec.py"
        ],
        "answer": "Functions starting with test_"
      },
      {
        "type": "truefalse",
        "question": "100% test coverage guarantees bug-free code.",
        "answer": "False"
      },
      {
        "type": "fillblank",
        "question": "The built-in function _____ (Python 3.7+) enters the debugger at the call site.",
        "answer": "breakpoint()"
      },
      {
        "type": "code",
        "question": "What does python -m cProfile -s cumtime script.py do?",
        "options": [
          "Runs script with coverage",
          "Profiles script, sorted by cumulative time",
          "Debugs script step by step",
          "Times script execution"
        ],
        "answer": "Profiles script, sorted by cumulative time"
      },
      {
        "type": "match",
        "question": "Match testing tool to purpose:",
        "pairs": {
          "pytest": "Test runner with fixtures",
          "mock.patch": "Replace dependencies in tests",
          "hypothesis": "Property-based testing",
          "coverage.py": "Measure code coverage"
        }
      }
    ]
  }
};

export default phase1Content;
