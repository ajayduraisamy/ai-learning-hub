import { registerContent } from '@/content/index'
import { getTopicContent } from '@/data/topicContent'

registerContent('p0-setup-dev-env', () => getTopicContent('p0-setup-dev-env'))

export {}
