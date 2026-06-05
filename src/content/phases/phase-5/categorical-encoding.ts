import { registerContent } from '@/content/index'

registerContent('p5-categorical-encoding', () => ({
  difficulty: 'Intermediate' as const,
  estimatedTime: '45 minutes',
  prerequisites: ['p5-numerical-features'],
  tags: ['Feature Engineering', 'Intermediate', 'Topic'],
  overview: 'Categorical Encoding is an important topic in Phase 5: Feature Engineering. This section introduces the essential concepts, techniques, and practical approaches you need to understand and apply this topic effectively.',
  keyConcepts: [
    { title: 'One-Hot Encoding & Target Encoding', description: 'The foundation of Categorical Encoding rests on understanding one-hot encoding & target encoding. This concept is central to how Categorical Encoding works in practice. Spend time building intuition through both study and hands-on experimentation.' },
    { title: 'Frequency Encoding & Ordinal Encoding', description: 'Frequency Encoding & Ordinal Encoding complements the core foundation. Understanding this will help you write more efficient and maintainable solutions. It is a common area where beginners and experienced practitioners differentiate themselves.' },
    { title: 'Feature Hashing & Embedding Encoding', description: 'Mastering feature hashing & embedding encoding ensures your work is robust, scalable, and production-ready. Industry professionals rely on these techniques to deliver reliable systems.' },
  ],
  codeExamples: [
    {
      title: 'categorical encoding — Basic Example',
      description: 'A hands-on example demonstrating categorical encoding.',
      code: `# categorical encoding — getting started
# Implementation with sklearn
# Add your specific code here

def train_model(X, y):
    """Train and evaluate the model."""
    from sklearn.model_selection import train_test_split
    X_train, X_test, y_train, y_test = train_test_split(X, y)
    return X_train.shape, X_test.shape

print("Data split complete!")`,
      language: 'python',
      output: 'See output above',
    },
    {
      title: 'categorical encoding — Practical Usage',
      description: 'Apply categorical encoding to a typical problem.',
      code: `# Practical categorical encoding example
Apply this ML/AI concept.

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
      scenario: 'Categorical Encoding is widely used in feature engineering. Companies apply this concept to build robust, scalable systems that solve real business problems efficiently.',
      keyTakeaway: 'Mastering Categorical Encoding helps you build production-grade solutions that are maintainable, testable, and performant.',
    },
    {
      title: 'Learning Path Integration',
      scenario: 'Categorical Encoding connects to multiple topics in this curriculum. Understanding it well makes advanced concepts easier to grasp and helps you see the bigger picture of AI/ML development.',
      keyTakeaway: 'Practice Categorical Encoding regularly and experiment with variations to deepen your understanding across the full curriculum.',
    },
  ],
  practicalApplication: 'The best way to learn Categorical Encoding is through practice. Start with small, focused exercises that isolate specific concepts, then combine them to solve more complex problems. Build a portfolio of working examples that demonstrate your understanding.',
  commonPitfalls: [
    { title: 'Skipping fundamentals', description: 'Rushing to advanced topics without solid foundations leads to confusion and wasted time.' },
    { title: 'Copying without understanding', description: 'Using code from tutorials without understanding why it works prevents you from adapting solutions to new problems.' },
    { title: 'Ignoring edge cases', description: 'Real-world data rarely matches textbook examples perfectly. Always test with diverse inputs.' },
    { title: 'Not testing assumptions', description: 'Verify your understanding by testing with simple cases before tackling complex problems.' },
  ],
  tryItYourself: {
    instructions: 'Open your Python environment and implement Categorical Encoding from scratch. Start with the basic example, then extend it to handle edge cases and larger inputs.',
    initialCode: `# Categorical Encoding — Try It Yourself
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
  summary: 'Categorical Encoding is an essential topic in Phase 5: Feature Engineering. Master the basics, practice consistently, and build increasingly complex projects. This foundation will serve you well as you progress to more advanced topics.',
}))
