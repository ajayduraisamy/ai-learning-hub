import { registerContent } from '@/content/index'
import { getTopicContent } from '@/data/topicContent'

registerContent('p1-intro-python', () => getTopicContent('p1-intro-python'))

export {}
