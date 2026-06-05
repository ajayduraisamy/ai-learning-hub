import { registerContent } from '@/content/index'

registerContent('p4-handling-missing-data', () => ({
  difficulty: 'Intermediate' as const,
  estimatedTime: '45 minutes',
  prerequisites: ['p4-eda'],
  tags: ['Data Quality', 'Intermediate', 'Topic'],
  overview: 'Handling Missing Data is an important topic in Phase 4: Data Quality. This section introduces the essential concepts, techniques, and practical approaches you need to understand and apply this topic effectively.',
  keyConcepts: [
    { title: 'Missing Data Mechanisms (MCAR, MAR, MNAR)', description: 'The foundation of Handling Missing Data rests on understanding missing data mechanisms (mcar, mar, mnar). This concept is central to how Handling Missing Data works in practice. Spend time building intuition through both study and hands-on experimentation.' },
    { title: 'Imputation Strategies (Mean, Median, KNN)', description: 'Imputation Strategies (Mean, Median, KNN) complements the core foundation. Understanding this will help you write more efficient and maintainable solutions. It is a common area where beginners and experienced practitioners differentiate themselves.' },
    { title: 'Missing Indicator Variables & Additive Imputation', description: 'Mastering missing indicator variables & additive imputation ensures your work is robust, scalable, and production-ready. Industry professionals rely on these techniques to deliver reliable systems.' },
  ],
  codeExamples: [
    {
      title: 'handling missing data — Basic Example',
      description: 'A hands-on example demonstrating handling missing data.',
      code: `# handling missing data — getting started
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
      title: 'handling missing data — Practical Usage',
      description: 'Apply handling missing data to a typical problem.',
      code: `# Practical handling missing data example
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
      scenario: 'Handling Missing Data is widely used in data quality engineering. Companies apply this concept to build robust, scalable systems that solve real business problems efficiently.',
      keyTakeaway: 'Mastering Handling Missing Data helps you build production-grade solutions that are maintainable, testable, and performant.',
    },
    {
      title: 'Learning Path Integration',
      scenario: 'Handling Missing Data connects to multiple topics in this curriculum. Understanding it well makes advanced concepts easier to grasp and helps you see the bigger picture of AI/ML development.',
      keyTakeaway: 'Practice Handling Missing Data regularly and experiment with variations to deepen your understanding across the full curriculum.',
    },
  ],
  practicalApplication: 'The best way to learn Handling Missing Data is through practice. Start with small, focused exercises that isolate specific concepts, then combine them to solve more complex problems. Build a portfolio of working examples that demonstrate your understanding.',
  commonPitfalls: [
    { title: 'Skipping fundamentals', description: 'Rushing to advanced topics without solid foundations leads to confusion and wasted time.' },
    { title: 'Copying without understanding', description: 'Using code from tutorials without understanding why it works prevents you from adapting solutions to new problems.' },
    { title: 'Ignoring edge cases', description: 'Real-world data rarely matches textbook examples perfectly. Always test with diverse inputs.' },
    { title: 'Not testing assumptions', description: 'Verify your understanding by testing with simple cases before tackling complex problems.' },
  ],
  tryItYourself: {
    instructions: 'Open your Python environment and implement Handling Missing Data from scratch. Start with the basic example, then extend it to handle edge cases and larger inputs.',
    initialCode: `# Handling Missing Data — Try It Yourself
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
  summary: 'Handling Missing Data is an essential topic in Phase 4: Data Quality. Master the basics, practice consistently, and build increasingly complex projects. This foundation will serve you well as you progress to more advanced topics.',
}))
