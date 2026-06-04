import { registerContent } from '@/content/index'
import { getTopicContent } from '@/data/topicContent'

registerContent('p1-modules-packages', () => getTopicContent('p1-modules-packages'))

export {}
