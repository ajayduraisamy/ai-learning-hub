import { registerContent } from '@/content/index'

registerContent('p5-numerical-features', () => ({
  difficulty: 'Intermediate' as const,
  estimatedTime: '45 minutes',
  prerequisites: ['p4-data-drift'],
  tags: ['Feature Engineering', 'Intermediate', 'Topic'],
  overview: 'Numerical Feature Engineering is an important topic in Phase 5: Feature Engineering. This section introduces the essential concepts, techniques, and practical approaches you need to understand and apply this topic effectively.',
  keyConcepts: [
    { title: 'Log Transform, Polynomial Features & Binning', description: 'The foundation of Numerical Feature Engineering rests on understanding log transform, polynomial features & binning. This concept is central to how Numerical Feature Engineering works in practice. Spend time building intuition through both study and hands-on experimentation.' },
    { title: 'Interaction Features & Ratio Features', description: 'Interaction Features & Ratio Features complements the core foundation. Understanding this will help you write more efficient and maintainable solutions. It is a common area where beginners and experienced practitioners differentiate themselves.' },
    { title: 'Power Transform (Box-Cox, Yeo-Johnson)', description: 'Mastering power transform (box-cox, yeo-johnson) ensures your work is robust, scalable, and production-ready. Industry professionals rely on these techniques to deliver reliable systems.' },
  ],
  practicalApplication: 'The best way to learn Numerical Feature Engineering is through practice. Start with small, focused exercises that isolate specific concepts, then combine them to solve more complex problems. Build a portfolio of working examples that demonstrate your understanding.',
  commonPitfalls: [
    { title: 'Skipping fundamentals', description: 'Rushing to advanced topics without solid foundations leads to confusion and wasted time.' },
    { title: 'Copying without understanding', description: 'Using code from tutorials without understanding why it works prevents you from adapting solutions to new problems.' },
    { title: 'Ignoring edge cases', description: 'Real-world data rarely matches textbook examples perfectly. Always test with diverse inputs.' },
    { title: 'Not testing assumptions', description: 'Verify your understanding by testing with simple cases before tackling complex problems.' },
  ],
  summary: 'Numerical Feature Engineering is an essential topic in Phase 5: Feature Engineering. Master the basics, practice consistently, and build increasingly complex projects. This foundation will serve you well as you progress to more advanced topics.',
}))

export {}
