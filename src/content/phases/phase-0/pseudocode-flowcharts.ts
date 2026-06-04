import { registerContent } from '@/content/index'
import { getTopicContent } from '@/data/topicContent'

registerContent('p0-pseudocode', () => getTopicContent('p0-pseudocode'))

export {}
