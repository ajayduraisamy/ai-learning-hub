import { registerContent } from '@/content/index'

registerContent('p0-binary-logic', () => ({
  difficulty: 'Beginner' as const,
  estimatedTime: '30 minutes',
  prerequisites: ['p0-how-computers-work'],
  tags: ['Pre-Programming Basics', 'Beginner', 'Topic'],
  overview: 'Binary & Logic Gates is an important topic in Phase 0: Pre-Programming Basics. This section introduces the essential concepts, techniques, and practical approaches you need to understand and apply this topic effectively.',
  keyConcepts: [
    { title: 'Logic Gates (AND, OR, NOT, NAND, NOR, XOR)', description: 'The foundation of Binary & Logic Gates rests on understanding logic gates (and, or, not, nand, nor, xor). This concept is central to how Binary & Logic Gates works in practice. Spend time building intuition through both study and hands-on experimentation.' },
    { title: 'Binary Number System & Positional Notation', description: 'Binary Number System & Positional Notation complements the core foundation. Understanding this will help you write more efficient and maintainable solutions. It is a common area where beginners and experienced practitioners differentiate themselves.' },
    { title: 'Truth Tables & Boolean Algebra Simplification', description: 'Mastering truth tables & boolean algebra simplification ensures your work is robust, scalable, and production-ready. Industry professionals rely on these techniques to deliver reliable systems.' },
  ],
  codeExamples: [
    {
      title: 'binary logic — Basic Example',
      description: 'A hands-on example demonstrating binary logic.',
      code: `# binary logic — getting started
# Computer architecture basics
print("CPU executes instructions")
print("Memory stores data")
print("I/O handles input/output")`,
      language: 'python',
      output: 'See output above',
    },
    {
      title: 'binary logic — Practical Usage',
      description: 'Apply binary logic to a typical problem.',
      code: `# Practical binary logic example
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
      scenario: 'Binary & Logic Gates is widely used in computer systems. Companies apply this concept to build robust, scalable systems that solve real business problems efficiently.',
      keyTakeaway: 'Mastering Binary & Logic Gates helps you build production-grade solutions that are maintainable, testable, and performant.',
    },
    {
      title: 'Learning Path Integration',
      scenario: 'Binary & Logic Gates connects to multiple topics in this curriculum. Understanding it well makes advanced concepts easier to grasp and helps you see the bigger picture of AI/ML development.',
      keyTakeaway: 'Practice Binary & Logic Gates regularly and experiment with variations to deepen your understanding across the full curriculum.',
    },
  ],
  practicalApplication: 'The best way to learn Binary & Logic Gates is through practice. Start with small, focused exercises that isolate specific concepts, then combine them to solve more complex problems. Build a portfolio of working examples that demonstrate your understanding.',
  commonPitfalls: [
    { title: 'Skipping fundamentals', description: 'Rushing to advanced topics without solid foundations leads to confusion and wasted time.' },
    { title: 'Copying without understanding', description: 'Using code from tutorials without understanding why it works prevents you from adapting solutions to new problems.' },
    { title: 'Ignoring edge cases', description: 'Real-world data rarely matches textbook examples perfectly. Always test with diverse inputs.' },
    { title: 'Not testing assumptions', description: 'Verify your understanding by testing with simple cases before tackling complex problems.' },
  ],
  tryItYourself: {
    instructions: 'Open your Python environment and implement Binary & Logic Gates from scratch. Start with the basic example, then extend it to handle edge cases and larger inputs.',
    initialCode: `# Binary & Logic Gates — Try It Yourself
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
  summary: 'Binary & Logic Gates is an essential topic in Phase 0: Pre-Programming Basics. Master the basics, practice consistently, and build increasingly complex projects. This foundation will serve you well as you progress to more advanced topics.',
}))
