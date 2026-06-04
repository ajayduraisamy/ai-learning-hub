import { registerContent } from '@/content/index'
import { getTopicContent } from '@/data/topicContent'

registerContent('p1-data-types', () => getTopicContent('p1-data-types'))

export {}
