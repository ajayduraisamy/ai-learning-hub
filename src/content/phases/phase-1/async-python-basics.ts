import { registerContent } from '@/content/index'
import { getTopicContent } from '@/data/topicContent'

registerContent('p1-async-python', () => getTopicContent('p1-async-python'))

export {}
