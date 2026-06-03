import { useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '@/store/useStore'
import { getTopicById } from '@/data/sidebarData'

interface MainContentProps {
  children: React.ReactNode
}

export default function MainContent({ children }: MainContentProps) {
  const location = useLocation()
  const { sidebarCollapsed } = useStore()
  const currentTopicId = location.pathname.startsWith('/topic/')
    ? location.pathname.replace('/topic/', '')
    : ''

  const topicInfo = currentTopicId ? getTopicById(currentTopicId) : null

  return (
    <main
      className={`pt-16 min-h-screen bg-gray-50 dark:bg-gray-950 transition-all duration-300 ${
        sidebarCollapsed ? 'ml-[60px]' : 'ml-[280px]'
      }`}
    >
      {topicInfo && (
        <div className="px-6 py-3 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
          <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <a href="/" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
              Home
            </a>
            <span>/</span>
            <span className="text-gray-700 dark:text-gray-300 truncate max-w-[300px]">
              {topicInfo.phaseTitle}
            </span>
            <span>/</span>
            <span className="text-primary-600 dark:text-primary-400 font-medium truncate max-w-[300px]">
              {topicInfo.title}
            </span>
          </nav>
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="p-6"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </main>
  )
}
