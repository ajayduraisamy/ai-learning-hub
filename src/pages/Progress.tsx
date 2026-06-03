import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BarChart3, Award, Target, TrendingUp, CheckCircle, Circle } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { phases } from '@/data/sidebarData'

export default function Progress() {
  const navigate = useNavigate()
  const { completedTopics, setCurrentTopic } = useStore()

  const totalTopics = phases.reduce((a, p) => a + p.topics.length, 0)
  const overallProgress = totalTopics > 0 ? Math.round((completedTopics.length / totalTopics) * 100) : 0

  const phaseStats = phases.map((phase) => {
    const completed = phase.topics.filter((t) => completedTopics.includes(t.id)).length
    const total = phase.topics.length
    return {
      ...phase,
      completed,
      total,
      progress: total > 0 ? Math.round((completed / total) * 100) : 0,
    }
  })

  const completedPhases = phaseStats.filter((p) => p.completed === p.total).length
  const inProgressPhases = phaseStats.filter((p) => p.completed > 0 && p.completed < p.total).length

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-6">
          <BarChart3 size={24} className="text-primary-500" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Progress Dashboard</h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <div className="flex items-center gap-3 mb-3">
              <Target size={20} className="text-primary-500" />
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Overall Progress</span>
            </div>
            <div className="flex items-end gap-3">
              <span className="text-3xl font-bold text-gray-900 dark:text-white">{overallProgress}%</span>
              <div className="flex-1 h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-1">
                <div
                  className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full transition-all duration-500"
                  style={{ width: `${overallProgress}%` }}
                />
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-2">{completedTopics.length} of {totalTopics} topics completed</p>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <div className="flex items-center gap-3 mb-3">
              <Award size={20} className="text-secondary-500" />
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Completed</span>
            </div>
            <span className="text-3xl font-bold text-gray-900 dark:text-white">{completedPhases}</span>
            <p className="text-xs text-gray-400 mt-1">phases fully completed</p>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <div className="flex items-center gap-3 mb-3">
              <TrendingUp size={20} className="text-accent-500" />
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">In Progress</span>
            </div>
            <span className="text-3xl font-bold text-gray-900 dark:text-white">{inProgressPhases}</span>
            <p className="text-xs text-gray-400 mt-1">phases partially completed</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Phase Breakdown</h2>
          <div className="space-y-4">
            {phaseStats.map((phase) => (
              <div key={phase.id}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    {phase.completed === phase.total ? (
                      <CheckCircle size={16} className="text-secondary-500 shrink-0" />
                    ) : (
                      <Circle size={16} className="text-gray-300 dark:text-gray-600 shrink-0" />
                    )}
                    <button
                      onClick={() => {
                        const firstTopic = phase.topics[0]
                        if (firstTopic) {
                          setCurrentTopic(firstTopic.id)
                          navigate(`/topic/${firstTopic.id}`)
                        }
                      }}
                      className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors truncate"
                    >
                      {phase.title}
                    </button>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400 shrink-0 ml-2">
                    {phase.completed}/{phase.total}
                  </span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      phase.completed === phase.total
                        ? 'bg-secondary-500'
                        : phase.completed > 0
                        ? 'bg-primary-500'
                        : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                    style={{ width: `${phase.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
