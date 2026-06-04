import { registerContent } from '@/content/index'
import { getTopicContent } from '@/data/topicContent'

registerContent('p3-pandas', () => getTopicContent('p3-pandas'))

export {}
