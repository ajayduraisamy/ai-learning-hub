import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, ArrowRight } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { getAllTopics } from '@/data/sidebarData'

export default function SearchResults() {
  const navigate = useNavigate()
  const { searchQuery, setCurrentTopic } = useStore()

  const allTopics = getAllTopics()
  const results = searchQuery
    ? allTopics.filter(
        (t) =>
          t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.phaseTitle.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allTopics

  const handleClick = (topicId: string) => {
    setCurrentTopic(topicId)
    navigate(`/topic/${topicId}`)
  }

  const grouped = results.reduce<Record<string, typeof results>>((acc, topic) => {
    if (!acc[topic.phaseTitle]) acc[topic.phaseTitle] = []
    acc[topic.phaseTitle].push(topic)
    return acc
  }, {})

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-6">
          <Search size={24} className="text-primary-500" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {searchQuery ? `Results for "${searchQuery}"` : 'All Topics'}
          </h1>
          <span className="text-sm text-gray-400">({results.length} topics)</span>
        </div>

        {results.length === 0 ? (
          <div className="text-center py-20">
            <Search size={48} className="text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No results found</h2>
            <p className="text-gray-500 dark:text-gray-400">
              Try different keywords or browse all topics from the sidebar.
            </p>
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
                    <button
                      key={topic.id}
                      onClick={() => handleClick(topic.id)}
                      className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-white dark:hover:bg-gray-800/50 transition-colors group border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
                    >
                      <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        {topic.title}
                      </span>
                      <ArrowRight size={14} className="text-gray-300 group-hover:text-primary-500 transition-colors" />
                    </button>
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
