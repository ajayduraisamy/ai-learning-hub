import { registerContent } from '@/content/index'
import { getTopicContent } from '@/data/topicContent'

registerContent('p1-comprehensions', () => getTopicContent('p1-comprehensions'))

export {}
