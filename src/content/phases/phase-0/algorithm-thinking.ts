import { registerContent } from '@/content/index'

registerContent('p0-algorithm-thinking', () => ({
  difficulty: 'Beginner',
  estimatedTime: '30 minutes',
  prerequisites: [],
  tags: ['Phase 0', 'Beginner', 'Topic'],
  objectives: [
    'Understand what algorithms are and why they matter',
    'Learn to break complex problems into smaller steps',
    'Practice algorithmic thinking with everyday examples',
    'Understand pseudocode as a planning tool',
  ],
  theory: `# Algorithmic Thinking

## What is an Algorithm?

An **algorithm** is a step-by-step procedure for solving a problem or accomplishing a task. Every computer program is built on algorithms — from sorting a list to training a neural network.

### Key Properties of Good Algorithms

1. **Finitely described**: Steps are clearly defined
2. **Effective**: Each step is doable
3. **Terminating**: The algorithm finishes in finite time
4. **Deterministic**: Same inputs always produce same outputs

## The Problem-Solving Mindset

### 1. Understand the Problem
Before writing any code, ask:
- What are the inputs?
- What are the outputs?
- What are the constraints?
- Can I solve a small example manually?

### 2. Break It Down
Divide the problem into smaller, manageable pieces. This is called **decomposition**. Each piece should handle one specific task.

### 3. Identify Patterns
Look for similarities to problems you've solved before. Recognizing patterns lets you reuse proven solutions.

### 4. Abstract Away Details
Focus on the essential structure, ignoring irrelevant details. **Abstraction** lets you see the big picture without getting lost in specifics.

### 5. Design Steps
Write out the solution as a sequence of steps. This is **algorithm design**. Use pseudocode or flowcharts to plan.

## Pseudocode

Pseudocode is a way to describe algorithms using plain language mixed with programming concepts. It's not real code, but it's structured enough to translate easily.

### Example: Find the largest number in a list

\\begin{verbatim}
SET largest = first element
FOR each remaining element:
    IF element > largest:
        SET largest = element
RETURN largest
\\end{verbatim}

## Algorithm Complexity

**Big O notation** describes how an algorithm's runtime grows with input size:

| Notation | Name | Example |
|----------|------|---------|
| $O(1)$ | Constant | Access array element |
| $O(\\log n)$ | Logarithmic | Binary search |
| $O(n)$ | Linear | Find max in list |
| $O(n \\log n)$ | Linearithmic | Merge sort |
| $O(n^2)$ | Quadratic | Bubble sort |
| $O(2^n)$ | Exponential | Brute-force subset |`,
  understanding: {
    analogy: 'Algorithmic thinking is like following a recipe. A recipe specifies ingredients (inputs), steps (process), and the final dish (output). A good recipe is precise enough that any cook can follow it and get the same result. When you encounter a new dish you want to cook, you don\'t just start adding ingredients — you find or write a recipe first. Similarly, when solving programming problems, design your algorithm before writing code.',
    steps: [
      { title: 'Understand the Problem', content: 'Read the problem carefully. Identify inputs, outputs, and constraints. Try solving a small example with pen and paper before thinking about code.' },
      { title: 'Decompose', content: 'Break the problem into sub-problems. Each sub-problem should be independently solvable. For example, "sort students by grade" decomposes into "compare two grades" and "arrange items in order".' },
      { title: 'Recognize Patterns', content: 'Does this problem resemble one you\'ve seen before? Many problems share underlying patterns — searching, sorting, grouping, transforming. Use existing patterns rather than reinventing solutions.' },
      { title: 'Design the Steps', content: 'Write pseudocode outlining your solution. Focus on the logic, not syntax. Flowcharts help visualize branching and loops.' },
      { title: 'Test and Refine', content: 'Walk through your algorithm with test inputs. Check edge cases (empty input, single item, duplicates). Optimize only after correctness is confirmed.' },
    ],
    misconceptions: [
      { misconception: 'Algorithms are only for math and computer science', truth: 'Algorithms are everywhere — cooking recipes, driving directions, tax forms, and even how you sort your laundry. Algorithmic thinking is a universal problem-solving skill.' },
      { misconception: 'Writing code is the hardest part of programming', truth: 'Designing the algorithm is usually harder than writing the actual code. Good programmers spend most of their time planning and thinking, not typing.' },
    ],
    comparisons: [
      { label: 'Approach', methodA: 'Algorithmic: Plan then code', methodB: 'Brute Force: Code then fix' },
      { label: 'Efficiency', methodA: 'Algorithmic: Optimized from design', methodB: 'Brute Force: Often inefficient' },
      { label: 'Reliability', methodA: 'Algorithmic: Higher — design catches issues early', methodB: 'Brute Force: Lower — bugs are found late' },
    ],
  },
  codeExamples: [
    {
      level: 'basic',
      code: `# Algorithm: Find the largest number in a list

def find_max(numbers):
    """Return the largest number in a list."""
    if not numbers:
        return None
    
    largest = numbers[0]  # Start with first element
    for num in numbers[1:]:  # Check each remaining element
        if num > largest:
            largest = num  # Update if we find a larger one
    return largest

# Test the algorithm
test_lists = [
    [3, 7, 2, 9, 1],
    [-5, -2, -8, -1],
    [42],
    [],
]

for lst in test_lists:
    result = find_max(lst)
    print(f"Max of {lst} = {result}")`,
      output: `Max of [3, 7, 2, 9, 1] = 9
Max of [-5, -2, -8, -1] = -1
Max of [42] = 42
Max of [] = None`,
      explanation: 'This linear search algorithm has O(n) complexity — it checks each element once. The algorithm is simple, correct, and handles edge cases like empty and single-element lists.',
    },
    {
      level: 'intermediate',
      code: `# Algorithm: Binary Search (divide and conquer)
from typing import List, Optional

def binary_search(arr: List[int], target: int) -> Optional[int]:
    """
    Find target in sorted array using binary search.
    Returns index of target, or None if not found.
    """
    left, right = 0, len(arr) - 1
    
    while left <= right:
        mid = (left + right) // 2
        guess = arr[mid]
        
        if guess == target:
            return mid  # Found it!
        elif guess > target:
            right = mid - 1  # Search left half
        else:
            left = mid + 1   # Search right half
    
    return None  # Not found

# Test binary search
data = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19]
targets = [7, 20, 1, 19, 3]

print(f"Array: {data}\\n")
for target in targets:
    idx = binary_search(data, target)
    if idx is not None:
        print(f"Found {target} at index {idx}")
    else:
        print(f"{target} not found")`,
      output: `Array: [1, 3, 5, 7, 9, 11, 13, 15, 17, 19]

Found 7 at index 3
20 not found
Found 1 at index 0
Found 19 at index 9
Found 3 at index 1`,
      explanation: 'Binary search is O(log n) — much faster than linear search O(n) for large datasets. It works by repeatedly dividing the search space in half. But it requires the input to be sorted, a trade-off between preparation and search speed.',
    },
    {
      level: 'advanced',
      code: `# Algorithm: Merge Sort (divide and conquer sorting)

def merge_sort(arr):
    """Sort an array using the merge sort algorithm."""
    if len(arr) <= 1:
        return arr
    
    # Divide: split the array in half
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    
    # Conquer: merge the sorted halves
    return merge(left, right)

def merge(left, right):
    """Merge two sorted lists into one sorted list."""
    result = []
    i = j = 0
    
    # Compare elements from both lists
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1
    
    # Add remaining elements (if any)
    result.extend(left[i:])
    result.extend(right[j:])
    return result

# Test with various cases
test_cases = [
    [38, 27, 43, 3, 9, 82, 10],
    [1],
    [],
    [5, 4, 3, 2, 1],
    [3, 1, 4, 1, 5, 9, 2, 6],
]

print("=== Merge Sort Demonstration ===\\n")
for case in test_cases:
    sorted_case = merge_sort(case)
    print(f"Before: {case}")
    print(f"After:  {sorted_case}\\n")`,
      output: `=== Merge Sort Demonstration ===

Before: [38, 27, 43, 3, 9, 82, 10]
After:  [3, 9, 10, 27, 38, 43, 82]

Before: [1]
After:  [1]

Before: []
After:  []

Before: [5, 4, 3, 2, 1]
After:  [1, 2, 3, 4, 5]

Before: [3, 1, 4, 1, 5, 9, 2, 6]
After:  [1, 1, 2, 3, 4, 5, 6, 9]`,
      explanation: 'Merge sort is O(n log n) in all cases. It uses divide-and-conquer: split the list in half recursively until you have single elements, then merge pairs back together in sorted order. This algorithm demonstrates the power of algorithmic thinking — breaking a hard problem (sorting) into manageable sub-problems (merging two sorted lists).',
    },
  ],
  realWorld: {
    useCases: [
      { industry: 'Software Engineering', description: 'Google Maps uses Dijkstra\'s algorithm to find the shortest route. Every time you search for directions, an algorithm efficiently explores millions of possible paths to find the optimal one in milliseconds.' },
      { industry: 'Machine Learning', description: 'Gradient descent is an algorithm that finds the minimum of a loss function by iteratively moving in the direction of steepest descent. Every neural network relies on this algorithmic approach to learning.' },
    ],
    caseStudy: {
      problem: 'A streaming service with 200 million users needed to recommend content in real-time. Brute-force comparison of every user against every movie took over 30 seconds — far too slow for a responsive experience.',
      solution: 'They redesigned their recommendation system using algorithmic thinking: decompose the problem into (1) find similar users using approximate nearest neighbor (ANN) algorithms, (2) rank candidate items using a scoring function. This reduced the problem from O(n×m) to O(log n + k).',
      results: 'Recommendations now generate in under 100 milliseconds. The algorithmic approach reduced server costs by 70% while improving recommendation quality. Users watched 40% more content.',
    },
    bestPractices: [
      'Always plan before coding — write pseudocode or draw a flowchart first',
      'Test with small, simple cases before handling complex scenarios',
      'Check edge cases: empty input, single item, duplicates, unsorted data',
      'Consider time and space complexity trade-offs',
      'Reuse well-known algorithms (search, sort, graph) rather than reinventing them',
    ],
    tools: ['Pseudocode', 'Flowcharts', 'Python', 'Algorithm visualization tools', 'Big O complexity analyzers'],
    jobRoles: ['Software Engineer', 'Data Scientist', 'Algorithm Engineer', 'Competitive Programmer'],
    furtherReading: [
      'Original paper and foundational research',
      'Official documentation and tutorials',
      'Community blog posts and case studies',
      'Online courses and certification programs',
    ],
  },
  quiz: [
    {
      id: 'at-1', type: 'truefalse',
      question: 'An algorithm must always produce the same output for the same input.',
      correctAnswer: 'True',
      explanation: 'Determinism is a key property of algorithms — given the same inputs, a correct algorithm will always produce the same outputs.',
    },
    {
      id: 'at-2', type: 'mcq',
      question: 'What does "decomposition" mean in algorithmic thinking?',
      options: [
        'Destroying the problem entirely',
        'Breaking a complex problem into smaller, manageable pieces',
        'Writing code without planning',
        'Making the problem more complex',
      ],
      correctAnswer: 'Breaking a complex problem into smaller, manageable pieces',
      explanation: 'Decomposition is the process of dividing a complex problem into smaller sub-problems that are easier to solve independently.',
    },
    {
      id: 'at-3', type: 'fillblank',
      question: 'The ___ of an algorithm describes how its runtime grows as the input size increases.',
      correctAnswer: 'complexity',
      explanation: 'Algorithm complexity (measured with Big O notation) describes the relationship between input size and the time or space required by the algorithm.',
    },
    {
      id: 'at-4', type: 'code',
      question: 'What is the time complexity of this algorithm?',
      code: `def find_duplicates(arr):
    for i in range(len(arr)):
        for j in range(i + 1, len(arr)):
            if arr[i] == arr[j]:
                return True
    return False`,
      options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(2ⁿ)'],
      correctAnswer: 'O(n²)',
      explanation: 'The nested loops cause the algorithm to compare each element with every other element, resulting in ~n²/2 comparisons — O(n²) complexity.',
    },
    {
      id: 'at-5', type: 'match',
      question: 'Match each Big O notation with its growth rate:',
      pairs: [
        { left: 'O(1)', right: 'Constant time — doesn\'t depend on input size' },
        { left: 'O(n)', right: 'Linear time — grows proportionally to input' },
        { left: 'O(n²)', right: 'Quadratic time — grows with the square of input' },
        { left: 'O(log n)', right: 'Logarithmic time — grows very slowly' },
      ],
      correctAnswer: 'All matched correctly',
      explanation: 'Big O notation helps compare algorithm efficiency. O(1) is fastest, followed by O(log n), O(n), O(n log n), O(n²), and O(2ⁿ).',
    },
  ],
}))

export {}
