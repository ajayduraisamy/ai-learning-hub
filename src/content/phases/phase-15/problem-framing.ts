import { registerContent } from '@/content/index'

registerContent('p15-problem-framing', () => ({
  difficulty: 'Beginner' as const,
  estimatedTime: '30 minutes',
  prerequisites: ['p14-multi-armed-bandits'],
  tags: ['Training Pipeline', 'Beginner', 'Topic'],
  overview: 'Problem Framing (Business → ML) is an important topic in Phase 15: Training Pipeline. This section introduces the essential concepts, techniques, and practical approaches you need to understand and apply this topic effectively.',
  keyConcepts: [
    { title: 'ML Task Taxonomy — Regression, Classification, Ranking', description: 'The foundation of Problem Framing (Business → ML) rests on understanding ml task taxonomy. This concept is central to how Problem Framing (Business → ML) works in practice. Spend time building intuition through both study and hands-on experimentation.' },
    { title: 'Evaluation Metrics aligned with Business Goals', description: 'Evaluation Metrics aligned with Business Goals complements the core foundation. Understanding this will help you write more efficient and maintainable solutions. It is a common area where beginners and experienced practitioners differentiate themselves.' },
    { title: 'Success Metrics & OKRs for ML Projects', description: 'Mastering success metrics & okrs for ml projects ensures your work is robust, scalable, and production-ready. Industry professionals rely on these techniques to deliver reliable systems.' },
  ],
  practicalApplication: 'The best way to learn Problem Framing (Business → ML) is through practice. Start with small, focused exercises that isolate specific concepts, then combine them to solve more complex problems. Build a portfolio of working examples that demonstrate your understanding.',
  commonPitfalls: [
    { title: 'Skipping fundamentals', description: 'Rushing to advanced topics without solid foundations leads to confusion and wasted time.' },
    { title: 'Copying without understanding', description: 'Using code from tutorials without understanding why it works prevents you from adapting solutions to new problems.' },
    { title: 'Ignoring edge cases', description: 'Real-world data rarely matches textbook examples perfectly. Always test with diverse inputs.' },
    { title: 'Not testing assumptions', description: 'Verify your understanding by testing with simple cases before tackling complex problems.' },
  ],
  summary: 'Problem Framing (Business → ML) is an essential topic in Phase 15: Training Pipeline. Master the basics, practice consistently, and build increasingly complex projects. This foundation will serve you well as you progress to more advanced topics.',
}))

export {}
