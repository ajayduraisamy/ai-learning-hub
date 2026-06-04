import { registerContent } from '@/content/index'
import { getTopicContent } from '@/data/topicContent'

registerContent('p1-testing-debugging', () => getTopicContent('p1-testing-debugging'))

export {}
