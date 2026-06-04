import { registerContent } from '@/content/index'
import { getTopicContent } from '@/data/topicContent'

registerContent('p2-linear-algebra', () => getTopicContent('p2-linear-algebra'))

export {}
