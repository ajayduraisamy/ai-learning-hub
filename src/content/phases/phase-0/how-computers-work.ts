import { registerContent } from '@/content/index'

registerContent('p0-how-computers-work', () => ({
  difficulty: 'Beginner' as const,
  estimatedTime: '30 minutes',
  prerequisites: [],
  tags: ['Pre-Programming Basics', 'Beginner', 'Topic'],
  overview: 'How Computers Work is an important topic in Phase 0: Pre-Programming Basics. This section introduces the essential concepts, techniques, and practical approaches you need to understand and apply this topic effectively.',
  keyConcepts: [
    { title: 'CPU, Memory, Storage, I/O', description: 'The foundation of How Computers Work rests on understanding cpu, memory, storage, i/o. This concept is central to how How Computers Work works in practice. Spend time building intuition through both study and hands-on experimentation.' },
    { title: 'Fetch-Decode-Execute Cycle — CPU Operation', description: 'Fetch-Decode-Execute Cycle complements the core foundation. Understanding this will help you write more efficient and maintainable solutions. It is a common area where beginners and experienced practitioners differentiate themselves.' },
    { title: 'Program Execution — From Source to Running Process', description: 'Mastering program execution ensures your work is robust, scalable, and production-ready. Industry professionals rely on these techniques to deliver reliable systems.' },
  ],
  codeExamples: [
    {
      title: 'how computers work — Basic Example',
      description: 'A hands-on example demonstrating how computers work.',
      code: `# how computers work — getting started
# Computer architecture basics
print("CPU executes instructions")
print("Memory stores data")
print("I/O handles input/output")`,
      language: 'python',
      output: 'See output above',
    },
    {
      title: 'how computers work — Practical Usage',
      description: 'Apply how computers work to a typical problem.',
      code: `# Practical how computers work example
Understand the hardware layer.

# Try modifying this code to explore
# different aspects of the concept
print("Practice makes perfect!")`,
      language: 'python',
      output: 'Practice makes perfect!',
    },
  ],
  realWorldUseCases: [
    {
      title: 'Industry Application',
      scenario: 'How Computers Work is widely used in computer systems. Companies apply this concept to build robust, scalable systems that solve real business problems efficiently.',
      keyTakeaway: 'Mastering How Computers Work helps you build production-grade solutions that are maintainable, testable, and performant.',
    },
    {
      title: 'Learning Path Integration',
      scenario: 'How Computers Work connects to multiple topics in this curriculum. Understanding it well makes advanced concepts easier to grasp and helps you see the bigger picture of AI/ML development.',
      keyTakeaway: 'Practice How Computers Work regularly and experiment with variations to deepen your understanding across the full curriculum.',
    },
  ],
  practicalApplication: 'The best way to learn How Computers Work is through practice. Start with small, focused exercises that isolate specific concepts, then combine them to solve more complex problems. Build a portfolio of working examples that demonstrate your understanding.',
  commonPitfalls: [
    { title: 'Skipping fundamentals', description: 'Rushing to advanced topics without solid foundations leads to confusion and wasted time.' },
    { title: 'Copying without understanding', description: 'Using code from tutorials without understanding why it works prevents you from adapting solutions to new problems.' },
    { title: 'Ignoring edge cases', description: 'Real-world data rarely matches textbook examples perfectly. Always test with diverse inputs.' },
    { title: 'Not testing assumptions', description: 'Verify your understanding by testing with simple cases before tackling complex problems.' },
  ],
  tryItYourself: {
    instructions: 'Open your Python environment and implement How Computers Work from scratch. Start with the basic example, then extend it to handle edge cases and larger inputs.',
    initialCode: `# How Computers Work — Try It Yourself
# TODO: Implement the concept

def my_solution(data):
    """Your implementation here."""
    pass  # Replace with your code

# Test your solution
test_data = [1, 2, 3]
result = my_solution(test_data)
print(result)`,
    language: 'python',
    expectedOutput: 'Your implementation output',
    hint: 'Break the problem into small steps. Test each step before moving to the next.',
  },
  summary: 'How Computers Work is an essential topic in Phase 0: Pre-Programming Basics. Master the basics, practice consistently, and build increasingly complex projects. This foundation will serve you well as you progress to more advanced topics.',
}))
