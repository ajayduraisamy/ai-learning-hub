import { registerContent } from '@/content/index'

registerContent('p13-prophet', () => ({
  difficulty: 'Beginner' as const,
  estimatedTime: '30 minutes',
  prerequisites: ['p13-arima'],
  tags: ['Time Series', 'Beginner', 'Topic'],
  overview: 'Prophet is an important topic in Phase 13: Time Series. This section introduces the essential concepts, techniques, and practical approaches you need to understand and apply this topic effectively.',
  keyConcepts: [
    { title: 'Additive Seasonality & Changepoint Detection', description: 'The foundation of Prophet rests on understanding additive seasonality & changepoint detection. This concept is central to how Prophet works in practice. Spend time building intuition through both study and hands-on experimentation.' },
    { title: 'Holiday Effects & Regressor Integration', description: 'Holiday Effects & Regressor Integration complements the core foundation. Understanding this will help you write more efficient and maintainable solutions. It is a common area where beginners and experienced practitioners differentiate themselves.' },
    { title: 'Uncertainty Intervals & Forecast Evaluation', description: 'Mastering uncertainty intervals & forecast evaluation ensures your work is robust, scalable, and production-ready. Industry professionals rely on these techniques to deliver reliable systems.' },
  ],
  practicalApplication: 'The best way to learn Prophet is through practice. Start with small, focused exercises that isolate specific concepts, then combine them to solve more complex problems. Build a portfolio of working examples that demonstrate your understanding.',
  commonPitfalls: [
    { title: 'Skipping fundamentals', description: 'Rushing to advanced topics without solid foundations leads to confusion and wasted time.' },
    { title: 'Copying without understanding', description: 'Using code from tutorials without understanding why it works prevents you from adapting solutions to new problems.' },
    { title: 'Ignoring edge cases', description: 'Real-world data rarely matches textbook examples perfectly. Always test with diverse inputs.' },
    { title: 'Not testing assumptions', description: 'Verify your understanding by testing with simple cases before tackling complex problems.' },
  ],
  summary: 'Prophet is an essential topic in Phase 13: Time Series. Master the basics, practice consistently, and build increasingly complex projects. This foundation will serve you well as you progress to more advanced topics.',
}))

export {}
