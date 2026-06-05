import { registerContent } from '@/content/index'

registerContent('p1-intro-python', () => ({
  difficulty: 'Beginner' as const,
  estimatedTime: '30 minutes',
  prerequisites: ['p0-setup-dev-env'],
  tags: ['Python Deep Dive', 'Beginner', 'Topic'],
  overview: 'Introduction to Python is an important topic in Phase 1: Python Deep Dive. This section introduces the essential concepts, techniques, and practical approaches you need to understand and apply this topic effectively.',
  keyConcepts: [
    { title: 'Variable Assignment & Dynamic Typing', description: 'The foundation of Introduction to Python rests on understanding variable assignment & dynamic typing. This concept is central to how Introduction to Python works in practice. Spend time building intuition through both study and hands-on experimentation.' },
    { title: 'print(), input() & Basic I/O Operations', description: 'Print(), input() & Basic I/O Operations complements the core foundation. Understanding this will help you write more efficient and maintainable solutions. It is a common area where beginners and experienced practitioners differentiate themselves.' },
    { title: 'Script vs REPL — Execution Modes', description: 'Mastering script vs repl ensures your work is robust, scalable, and production-ready. Industry professionals rely on these techniques to deliver reliable systems.' },
  ],
  codeExamples: [
    {
      title: 'intro python — Basic Example',
      description: 'A hands-on example demonstrating intro python.',
      code: `# intro python — getting started
def greet(name):
    """Simple function to demonstrate Python basics."""
    return f"Hello, {name}!"

print(greet("World"))`,
      language: 'python',
      output: 'See output above',
    },
    {
      title: 'intro python — Practical Usage',
      description: 'Apply intro python to a typical problem.',
      code: `# Practical intro python example
Write clean Python code.

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
      scenario: 'Introduction to Python is widely used in software development. Companies apply this concept to build robust, scalable systems that solve real business problems efficiently.',
      keyTakeaway: 'Mastering Introduction to Python helps you build production-grade solutions that are maintainable, testable, and performant.',
    },
    {
      title: 'Learning Path Integration',
      scenario: 'Introduction to Python connects to multiple topics in this curriculum. Understanding it well makes advanced concepts easier to grasp and helps you see the bigger picture of AI/ML development.',
      keyTakeaway: 'Practice Introduction to Python regularly and experiment with variations to deepen your understanding across the full curriculum.',
    },
  ],
  practicalApplication: 'The best way to learn Introduction to Python is through practice. Start with small, focused exercises that isolate specific concepts, then combine them to solve more complex problems. Build a portfolio of working examples that demonstrate your understanding.',
  commonPitfalls: [
    { title: 'Skipping fundamentals', description: 'Rushing to advanced topics without solid foundations leads to confusion and wasted time.' },
    { title: 'Copying without understanding', description: 'Using code from tutorials without understanding why it works prevents you from adapting solutions to new problems.' },
    { title: 'Ignoring edge cases', description: 'Real-world data rarely matches textbook examples perfectly. Always test with diverse inputs.' },
    { title: 'Not testing assumptions', description: 'Verify your understanding by testing with simple cases before tackling complex problems.' },
  ],
  tryItYourself: {
    instructions: 'Open your Python environment and implement Introduction to Python from scratch. Start with the basic example, then extend it to handle edge cases and larger inputs.',
    initialCode: `# Introduction to Python — Try It Yourself
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
  summary: 'Introduction to Python is an essential topic in Phase 1: Python Deep Dive. Master the basics, practice consistently, and build increasingly complex projects. This foundation will serve you well as you progress to more advanced topics.',
}))
