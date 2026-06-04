import { registerContent } from '@/content/index'
import { getTopicContent } from '@/data/topicContent'

registerContent('p2-probability-stats', () => getTopicContent('p2-probability-stats'))

export {}
