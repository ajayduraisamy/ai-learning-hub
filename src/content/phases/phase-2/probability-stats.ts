import { registerContent } from '@/content/index'

registerContent('p2-probability-stats', () => ({
  difficulty: 'Intermediate' as const,
  estimatedTime: '60 minutes',
  prerequisites: ['p2-calculus'],
  tags: ['Math for ML', 'Intermediate', 'Topic'],
  overview: 'Probability & Statistics is an important topic in Phase 2: Math for ML. This section introduces the essential concepts, techniques, and practical approaches you need to understand and apply this topic effectively.',
  keyConcepts: [
    { title: 'Probability Distributions & Bayes Theorem', description: 'The foundation of Probability & Statistics rests on understanding probability distributions & bayes theorem. This concept is central to how Probability & Statistics works in practice. Spend time building intuition through both study and hands-on experimentation.' },
    { title: 'Expected Value, Variance & Covariance', description: 'Expected Value, Variance & Covariance complements the core foundation. Understanding this will help you write more efficient and maintainable solutions. It is a common area where beginners and experienced practitioners differentiate themselves.' },
    { title: 'Central Limit Theorem & Law of Large Numbers', description: 'Mastering central limit theorem & law of large numbers ensures your work is robust, scalable, and production-ready. Industry professionals rely on these techniques to deliver reliable systems.' },
  ],
  codeExamples: [
    {
      title: 'probability stats — Basic Example',
      description: 'A hands-on example demonstrating probability stats.',
      code: `# probability stats — getting started
import numpy as np

# Matrix operations example
A = np.array([[1, 2], [3, 4]])
B = np.array([[5, 6], [7, 8]])
C = A @ B  # Matrix multiplication
print(f"A @ B = \n{C}")`,
      language: 'python',
      output: 'See output above',
    },
    {
      title: 'probability stats — Practical Usage',
      description: 'Apply probability stats to a typical problem.',
      code: `# Practical probability stats example
Apply mathematical concepts.

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
      scenario: 'Probability & Statistics is widely used in mathematical modeling. Companies apply this concept to build robust, scalable systems that solve real business problems efficiently.',
      keyTakeaway: 'Mastering Probability & Statistics helps you build production-grade solutions that are maintainable, testable, and performant.',
    },
    {
      title: 'Learning Path Integration',
      scenario: 'Probability & Statistics connects to multiple topics in this curriculum. Understanding it well makes advanced concepts easier to grasp and helps you see the bigger picture of AI/ML development.',
      keyTakeaway: 'Practice Probability & Statistics regularly and experiment with variations to deepen your understanding across the full curriculum.',
    },
  ],
  practicalApplication: 'The best way to learn Probability & Statistics is through practice. Start with small, focused exercises that isolate specific concepts, then combine them to solve more complex problems. Build a portfolio of working examples that demonstrate your understanding.',
  commonPitfalls: [
    { title: 'Skipping fundamentals', description: 'Rushing to advanced topics without solid foundations leads to confusion and wasted time.' },
    { title: 'Copying without understanding', description: 'Using code from tutorials without understanding why it works prevents you from adapting solutions to new problems.' },
    { title: 'Ignoring edge cases', description: 'Real-world data rarely matches textbook examples perfectly. Always test with diverse inputs.' },
    { title: 'Not testing assumptions', description: 'Verify your understanding by testing with simple cases before tackling complex problems.' },
  ],
  tryItYourself: {
    instructions: 'Open your Python environment and implement Probability & Statistics from scratch. Start with the basic example, then extend it to handle edge cases and larger inputs.',
    initialCode: `# Probability & Statistics — Try It Yourself
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
  summary: 'Probability & Statistics is an essential topic in Phase 2: Math for ML. Master the basics, practice consistently, and build increasingly complex projects. This foundation will serve you well as you progress to more advanced topics.',
}))
