import { registerContent } from '@/content/index'
import { getTopicContent } from '@/data/topicContent'

registerContent('p1-oop', () => getTopicContent('p1-oop'))

export {}
