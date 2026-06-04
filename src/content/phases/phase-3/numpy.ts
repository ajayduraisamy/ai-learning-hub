import { registerContent } from '@/content/index'
import { getTopicContent } from '@/data/topicContent'

registerContent('p3-numpy', () => getTopicContent('p3-numpy'))

export {}
