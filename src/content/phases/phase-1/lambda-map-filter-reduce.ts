import { registerContent } from '@/content/index'
import { getTopicContent } from '@/data/topicContent'

registerContent('p1-lambda-map-filter', () => getTopicContent('p1-lambda-map-filter'))

export {}
