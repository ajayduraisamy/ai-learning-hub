import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  CheckCircle, Circle, Bookmark, ArrowLeft, ArrowRight,
  Share2, FileText, List
} from 'lucide-react'
import { useStore } from '@/store/useStore'
import { phases, getTopicById } from '@/data/sidebarData'

export default function TopicPage() {
  const { topicId } = useParams<{ topicId: string }>()
  const navigate = useNavigate()
  const { completedTopics, bookmarkedTopics, toggleComplete, toggleBookmark } = useStore()

  const topicInfo = topicId ? getTopicById(topicId) : undefined

  if (!topicInfo) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <FileText size={48} className="text-gray-300 dark:text-gray-600 mb-4" />
        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">Topic not found</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-4">The topic you're looking for doesn't exist.</p>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
        >
          Back to Home
        </button>
      </div>
    )
  }

  const isCompleted = completedTopics.includes(topicId!)
  const isBookmarked = bookmarkedTopics.includes(topicId!)

  const allTopics = phases.flatMap((p) =>
    p.topics.map((t) => ({ ...t, phaseTitle: p.title, phaseId: p.id }))
  )
  const currentIndex = allTopics.findIndex((t) => t.id === topicId)
  const prevTopic = currentIndex > 0 ? allTopics[currentIndex - 1] : null
  const nextTopic = currentIndex < allTopics.length - 1 ? allTopics[currentIndex + 1] : null

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-start justify-between mb-6">
          <div>
            <span className="text-xs font-medium text-primary-600 dark:text-primary-400 uppercase tracking-wider">
              {topicInfo.phaseTitle}
            </span>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {topicInfo.title}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleComplete(topicId!)}
              className={`p-2 rounded-lg transition-colors ${
                isCompleted
                  ? 'bg-secondary-50 dark:bg-secondary-900/20 text-secondary-600'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-400 hover:text-secondary-500'
              }`}
              title={isCompleted ? 'Mark incomplete' : 'Mark complete'}
            >
              {isCompleted ? <CheckCircle size={20} /> : <Circle size={20} />}
            </button>
            <button
              onClick={() => toggleBookmark(topicId!)}
              className={`p-2 rounded-lg transition-colors ${
                isBookmarked
                  ? 'bg-accent-50 dark:bg-accent-900/20 text-accent-600'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-400 hover:text-accent-500'
              }`}
              title={isBookmarked ? 'Remove bookmark' : 'Bookmark'}
            >
              <Bookmark size={20} className={isBookmarked ? 'fill-accent-500' : ''} />
            </button>
            <button className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-400 hover:text-primary-500 transition-colors" title="Share">
              <Share2 size={20} />
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="prose prose-gray dark:prose-invert max-w-none">
            <h2>Overview</h2>
            <p>
              Welcome to <strong>{topicInfo.title}</strong>. This topic is part of{' '}
              {topicInfo.phaseTitle}. Use the resources below to master this subject.
            </p>

            <h2>Learning Objectives</h2>
            <ul>
              <li>Understand the core concepts of {topicInfo.title}</li>
              <li>Implement practical examples and exercises</li>
              <li>Apply best practices in real-world scenarios</li>
              <li>Evaluate and optimize your implementations</li>
            </ul>

            <h2>Key Concepts</h2>
            <p>
              This section covers the fundamental ideas and techniques you need to know.
              Each concept builds upon the previous ones, so follow along in order.
            </p>

            <h2>Resources</h2>
            <ul>
              <li>Official documentation and references</li>
              <li>Interactive notebooks and code examples</li>
              <li>Video tutorials and lectures</li>
              <li>Practice exercises with solutions</li>
            </ul>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <List size={18} className="text-primary-500" />
            Topic Contents
          </h2>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-sm font-semibold text-primary-600 dark:text-primary-400">
                  {i}
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Section {i}: Learning Module
                  </div>
                  <div className="text-xs text-gray-400">
                    ~{10 + i * 5} minutes
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between">
          {prevTopic ? (
            <button
              onClick={() => navigate(`/topic/${prevTopic.id}`)}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              <ArrowLeft size={16} />
              {prevTopic.title}
            </button>
          ) : <div />}
          {nextTopic ? (
            <button
              onClick={() => navigate(`/topic/${nextTopic.id}`)}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              {nextTopic.title}
              <ArrowRight size={16} />
            </button>
          ) : <div />}
        </div>
      </motion.div>
    </div>
  )
}
