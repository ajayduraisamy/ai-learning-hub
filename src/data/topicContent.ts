import { phases } from './sidebarData'

export interface TopicContent {
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  estimatedTime: string
  prerequisites: string[]
  tags: string[]
  overview: string
  keyConcepts: { title: string; description: string }[]
  practicalApplication: string
  commonPitfalls: { title: string; description: string }[]
  summary: string
}

function getPhaseForTopic(topicId: string) {
  for (const phase of phases) {
    for (const topic of phase.topics) {
      if (topic.id === topicId) return phase
    }
  }
  return phases[0]
}

export function getDifficulty(topicId: string): 'Beginner' | 'Intermediate' | 'Advanced' {
  const id = topicId.toLowerCase()
  if (id.startsWith('p0') || id.startsWith('p1') || id === 'p2-linear-algebra' || id === 'p2-calculus') return 'Beginner'
  if (id.startsWith('p15') || id.startsWith('p16') || id.startsWith('p17') || id.startsWith('p18') || id.startsWith('p19') || id.startsWith('p20') || id.startsWith('p21')) return 'Advanced'
  if (id.includes('transformer') || id.includes('fine-tuning') || id.includes('gan') || id.includes('diffusion') || id.includes('agent')) return 'Advanced'
  if (id.startsWith('p2') || id.startsWith('p3') || id.startsWith('p4') || id.startsWith('p5') || id.startsWith('p6') || id.startsWith('p7')) return 'Intermediate'
  return 'Intermediate'
}

export function getEstimatedTime(topicId: string): string {
  const id = topicId.toLowerCase()
  if (id.startsWith('p0') || id.startsWith('p1')) return '30 minutes'
  if (id.startsWith('p2')) return '60 minutes'
  if (id.includes('transformer') || id.includes('fine-tuning')) return '90 minutes'
  if (id.startsWith('p21')) return '120 minutes'
  return '45 minutes'
}

export function getTopicContent(topicId: string): TopicContent {
  const phase = getPhaseForTopic(topicId)
  const topic = phase.topics.find((t) => t.id === topicId)
  const title = topic?.title || topicId
  const phaseTitle = phase.title
  const difficulty = getDifficulty(topicId)
  const estimatedTime = getEstimatedTime(topicId)

  const prerequisites: string[] = []
  const allTopicIds = phases.flatMap((p) => p.topics.map((t) => t.id))
  const idx = allTopicIds.indexOf(topicId)
  if (idx > 0) prerequisites.push(allTopicIds[idx - 1])

  const tags = [
    phaseTitle.replace(/Phase \d+: /, ''),
    difficulty,
    topicId.startsWith('p21') ? 'Project' : 'Topic',
  ]

  return {
    difficulty,
    estimatedTime,
    prerequisites,
    tags,
    overview: `${title} is an important topic in ${phaseTitle}. This section introduces the essential concepts, techniques, and practical approaches you need to understand and apply this topic effectively.`,
    keyConcepts: [
      { title: 'Core Principles', description: `The foundation of ${title} rests on understanding its core principles. This concept is central to how ${title} works in practice. Spend time building intuition through both study and hands-on experimentation.` },
      { title: 'Practical Implementation', description: `Practical implementation complements the core foundation. Understanding this will help you write more efficient and maintainable solutions. It's a common area where beginners and experienced practitioners differentiate themselves.` },
      { title: 'Advanced Techniques', description: `Following advanced techniques ensures your work is robust, scalable, and production-ready. Industry professionals rely on these techniques to deliver reliable systems.` },
    ],
    practicalApplication: `The best way to learn ${title} is through practice. Start with small, focused exercises that isolate specific concepts, then combine them to solve more complex problems. Build a portfolio of working examples that demonstrate your understanding.`,
    commonPitfalls: [
      { title: 'Skipping fundamentals', description: 'Rushing to advanced topics without solid foundations leads to confusion and wasted time.' },
      { title: 'Copying without understanding', description: 'Using code from tutorials without understanding why it works prevents you from adapting solutions to new problems.' },
      { title: 'Ignoring edge cases', description: 'Real-world data rarely matches textbook examples perfectly. Always test with diverse inputs.' },
      { title: 'Not testing assumptions', description: 'Verify your understanding by testing with simple cases before tackling complex problems.' },
    ],
    summary: `${title} is an essential topic in ${phaseTitle}. Master the basics, practice consistently, and build increasingly complex projects. This foundation will serve you well as you progress to more advanced topics.`,
  }
}
