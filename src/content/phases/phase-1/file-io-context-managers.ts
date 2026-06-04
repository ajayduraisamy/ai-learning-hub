import { registerContent } from '@/content/index'
import { getTopicContent } from '@/data/topicContent'

registerContent('p1-file-io', () => getTopicContent('p1-file-io'))

export {}
