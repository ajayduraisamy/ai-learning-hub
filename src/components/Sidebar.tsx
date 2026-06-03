import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ChevronDown, ChevronRight, CheckCircle, Circle, Bookmark, ChevronLeft, Brain } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '@/store/useStore'
import { phases } from '@/data/sidebarData'

export default function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { sidebarCollapsed, toggleSidebar, currentTopic, setCurrentTopic, completedTopics, bookmarkedTopics, toggleComplete, toggleBookmark } = useStore()
  const [expandedPhases, setExpandedPhases] = useState<string[]>([...phases.map((p) => p.id)])

  const totalTopics = phases.reduce((acc, p) => acc + p.topics.length, 0)
  const progress = totalTopics > 0 ? Math.round((completedTopics.length / totalTopics) * 100) : 0

  const togglePhase = (phaseId: string) => {
    setExpandedPhases((prev) =>
      prev.includes(phaseId)
        ? prev.filter((id) => id !== phaseId)
        : [...prev, phaseId]
    )
  }

  const handleTopicClick = (topicId: string) => {
    setCurrentTopic(topicId)
    navigate(`/topic/${topicId}`)
  }

  const isActive = (topicId: string) =>
    location.pathname === `/topic/${topicId}` || currentTopic === topicId

  return (
    <aside
      className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 z-40 flex flex-col ${
        sidebarCollapsed ? 'w-[60px]' : 'w-[280px]'
      }`}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        {!sidebarCollapsed && (
          <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
            Learning Path
          </span>
        )}
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Toggle sidebar"
        >
          <ChevronLeft
            size={18}
            className={`text-gray-500 transition-transform duration-300 ${
              sidebarCollapsed ? 'rotate-180' : ''
            }`}
          />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {phases.map((phase) => {
          const isExpanded = expandedPhases.includes(phase.id)
          const phaseProgress = Math.round(
            (phase.topics.filter((t) => completedTopics.includes(t.id)).length /
              phase.topics.length) *
              100
          )

          return (
            <div key={phase.id}>
              <button
                onClick={() => !sidebarCollapsed && togglePhase(phase.id)}
                className={`w-full flex items-center gap-2 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${
                  sidebarCollapsed ? 'justify-center' : ''
                }`}
                title={sidebarCollapsed ? phase.title : undefined}
              >
                {sidebarCollapsed ? (
                  <Brain size={18} className="text-gray-400" />
                ) : (
                  <>
                    {isExpanded ? (
                      <ChevronDown size={16} className="text-gray-400 shrink-0" />
                    ) : (
                      <ChevronRight size={16} className="text-gray-400 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                        {phase.title}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <div className="flex-1 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary-500 rounded-full transition-all duration-300"
                            style={{ width: `${phaseProgress}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-400">{phaseProgress}%</span>
                      </div>
                    </div>
                  </>
                )}
              </button>

              <AnimatePresence initial={false}>
                {isExpanded && !sidebarCollapsed && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    {phase.topics.map((topic) => {
                      const active = isActive(topic.id)
                      const completed = completedTopics.includes(topic.id)
                      const bookmarked = bookmarkedTopics.includes(topic.id)

                      return (
                        <div
                          key={topic.id}
                          className={`flex items-center gap-1 pl-10 pr-2 py-1.5 cursor-pointer group transition-colors ${
                            active
                              ? 'bg-primary-50 dark:bg-primary-900/20 border-r-2 border-primary-500'
                              : 'hover:bg-gray-50 dark:hover:bg-gray-800/30'
                          }`}
                        >
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleComplete(topic.id); }}
                            className="shrink-0"
                            title={completed ? 'Mark incomplete' : 'Mark complete'}
                          >
                            {completed ? (
                              <CheckCircle size={14} className="text-secondary-500" />
                            ) : (
                              <Circle size={14} className="text-gray-300 dark:text-gray-600 group-hover:text-gray-400 transition-colors" />
                            )}
                          </button>

                          <button
                            onClick={() => handleTopicClick(topic.id)}
                            className="flex-1 text-left"
                          >
                            <span
                              className={`text-xs truncate block ${
                                active
                                  ? 'text-primary-700 dark:text-primary-300 font-medium'
                                  : completed
                                  ? 'text-gray-500 dark:text-gray-400 line-through'
                                  : 'text-gray-600 dark:text-gray-400'
                              }`}
                            >
                              {topic.title}
                            </span>
                          </button>

                          <button
                            onClick={(e) => { e.stopPropagation(); toggleBookmark(topic.id); }}
                            className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            title={bookmarked ? 'Remove bookmark' : 'Bookmark'}
                          >
                            <Bookmark
                              size={12}
                              className={
                                bookmarked
                                  ? 'text-accent-500 fill-accent-500'
                                  : 'text-gray-300 dark:text-gray-600'
                              }
                            />
                          </button>
                        </div>
                      )
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>

      {!sidebarCollapsed && (
        <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-3">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-gray-500 dark:text-gray-400">Total Progress</span>
            <span className="font-semibold text-primary-600 dark:text-primary-400">{progress}%</span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-xs text-gray-400 mt-1 text-center">
            {completedTopics.length} / {totalTopics} topics
          </div>
        </div>
      )}
    </aside>
  )
}
