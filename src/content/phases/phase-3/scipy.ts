import { registerContent } from '@/content/index'
import { getTopicContent } from '@/data/topicContent'

registerContent('p3-scipy', () => getTopicContent('p3-scipy'))

export {}
