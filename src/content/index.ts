import type { TopicContent } from '@/data/topicContent'

const contentRegistry = new Map<string, () => TopicContent>()

export function registerContent(topicId: string, loader: () => TopicContent) {
  contentRegistry.set(topicId, loader)
}

export function getContent(topicId: string): TopicContent | undefined {
  const loader = contentRegistry.get(topicId)
  if (!loader) return undefined
  return loader()
}

export { phases } from '@/data/sidebarData'
