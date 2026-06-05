import { registerContent } from '@/content/index'

registerContent('p1-intro-python', () => ({
  difficulty: 'Beginner' as const,
  estimatedTime: '30 minutes',
  prerequisites: ['p0-setup-dev-env'],
  tags: ['Python Deep Dive', 'Beginner', 'Topic'],
  overview: 'Introduction to Python is an important topic in Phase 1: Python Deep Dive. This section introduces the essential concepts, techniques, and practical approaches you need to understand and apply this topic effectively.',
  keyConcepts: [
    { title: 'Variable Assignment & Dynamic Typing', description: 'The foundation of Introduction to Python rests on understanding variable assignment & dynamic typing. This concept is central to how Introduction to Python works in practice. Spend time building intuition through both study and hands-on experimentation.' },
    { title: 'print(), input() & Basic I/O Operations', description: 'print(), input() & Basic I/O Operations complements the core foundation. Understanding this will help you write more efficient and maintainable solutions. It is a common area where beginners and experienced practitioners differentiate themselves.' },
    { title: 'Script vs REPL — Execution Modes', description: 'Mastering script vs repl ensures your work is robust, scalable, and production-ready. Industry professionals rely on these techniques to deliver reliable systems.' },
  ],
  practicalApplication: 'The best way to learn Introduction to Python is through practice. Start with small, focused exercises that isolate specific concepts, then combine them to solve more complex problems. Build a portfolio of working examples that demonstrate your understanding.',
  commonPitfalls: [
    { title: 'Skipping fundamentals', description: 'Rushing to advanced topics without solid foundations leads to confusion and wasted time.' },
    { title: 'Copying without understanding', description: 'Using code from tutorials without understanding why it works prevents you from adapting solutions to new problems.' },
    { title: 'Ignoring edge cases', description: 'Real-world data rarely matches textbook examples perfectly. Always test with diverse inputs.' },
    { title: 'Not testing assumptions', description: 'Verify your understanding by testing with simple cases before tackling complex problems.' },
  ],
  summary: 'Introduction to Python is an essential topic in Phase 1: Python Deep Dive. Master the basics, practice consistently, and build increasingly complex projects. This foundation will serve you well as you progress to more advanced topics.',
}))

export {}
