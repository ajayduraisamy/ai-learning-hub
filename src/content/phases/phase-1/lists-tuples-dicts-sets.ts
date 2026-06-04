import { registerContent } from '@/content/index'
import { getTopicContent } from '@/data/topicContent'

registerContent('p1-data-structures', () => getTopicContent('p1-data-structures'))

export {}
