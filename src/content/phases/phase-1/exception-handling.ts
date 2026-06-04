import { registerContent } from '@/content/index'
import { getTopicContent } from '@/data/topicContent'

registerContent('p1-exception-handling', () => getTopicContent('p1-exception-handling'))

export {}
