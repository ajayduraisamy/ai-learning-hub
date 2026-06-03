import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Bookmark, ArrowRight, BookmarkX } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { getAllTopics } from '@/data/sidebarData'

export default function Bookmarks() {
  const navigate = useNavigate()
  const { bookmarkedTopics, toggleBookmark, setCurrentTopic } = useStore()

  const allTopics = getAllTopics()
  const bookmarked = allTopics.filter((t) => bookmarkedTopics.includes(t.id))

  const handleClick = (topicId: string) => {
    setCurrentTopic(topicId)
    navigate(`/topic/${topicId}`)
  }

  const grouped = bookmarked.reduce<Record<string, typeof bookmarked>>((acc, topic) => {
    if (!acc[topic.phaseTitle]) acc[topic.phaseTitle] = []
    acc[topic.phaseTitle].push(topic)
    return acc
  }, {})

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-6">
          <Bookmark size={24} className="text-accent-500" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Bookmarks</h1>
          <span className="text-sm text-gray-400">({bookmarked.length} topics)</span>
        </div>

        {bookmarked.length === 0 ? (
          <div className="text-center py-20">
            <BookmarkX size={48} className="text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No bookmarks yet</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Click the bookmark icon on any topic to save it here for quick access.
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              Browse Topics
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(grouped).map(([phaseTitle, topics]) => (
              <div key={phaseTitle}>
                <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                  {phaseTitle}
                </h2>
                <div className="space-y-1">
                  {topics.map((topic) => (
                    <div
                      key={topic.id}
                      className="flex items-center gap-2 p-3 rounded-lg hover:bg-white dark:hover:bg-gray-800/50 transition-colors group border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
                    >
                      <button
                        onClick={() => handleClick(topic.id)}
                        className="flex-1 flex items-center justify-between text-left"
                      >
                        <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                          {topic.title}
                        </span>
                        <ArrowRight size={14} className="text-gray-300 group-hover:text-primary-500 transition-colors" />
                      </button>
                      <button
                        onClick={() => toggleBookmark(topic.id)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        title="Remove bookmark"
                      >
                        <Bookmark size={14} className="text-accent-500 fill-accent-500" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}
