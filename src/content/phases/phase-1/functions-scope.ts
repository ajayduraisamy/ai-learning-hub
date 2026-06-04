import { registerContent } from '@/content/index'
import { getTopicContent } from '@/data/topicContent'

registerContent('p1-functions', () => getTopicContent('p1-functions'))

export {}
