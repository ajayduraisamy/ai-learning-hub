import { registerContent } from '@/content/index'
import { getTopicContent } from '@/data/topicContent'

registerContent('p1-control-flow', () => getTopicContent('p1-control-flow'))

export {}
