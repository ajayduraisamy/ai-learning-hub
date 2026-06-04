import { registerContent } from '@/content/index'
import { getTopicContent } from '@/data/topicContent'

registerContent('p2-calculus', () => getTopicContent('p2-calculus'))

export {}
