import { registerContent } from '@/content/index'
import { getTopicContent } from '@/data/topicContent'

registerContent('p3-visualization', () => getTopicContent('p3-visualization'))

export {}
