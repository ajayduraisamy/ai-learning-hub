import { registerContent } from '@/content/index'
import { getTopicContent } from '@/data/topicContent'

registerContent('p1-decorators', () => getTopicContent('p1-decorators'))

export {}
