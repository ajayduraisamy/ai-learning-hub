import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, Search, FlaskConical } from 'lucide-react'

export default function NotFound() {
  const navigate = useNavigate()
  const [hover, setHover] = useState(false)

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] gap-6 p-8">
      <motion.div
        animate={{ rotate: hover ? [0, -10, 10, -10, 0] : 0 }}
        transition={{ duration: 0.5 }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        className="text-8xl font-black text-gray-200 dark:text-gray-800 select-none"
      >
        404
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-center"
      >
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Page not found
        </h1>
        <p className="text-gray-500 dark:text-gray-400 max-w-md">
          This topic doesn't exist yet — maybe it's in a future phase?
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex flex-wrap gap-3 justify-center"
      >
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 transition-colors"
        >
          <Home size={16} />
          Go Home
        </button>
        <button
          onClick={() => navigate('/search')}
          className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <Search size={16} />
          Search Topics
        </button>
        <button
          onClick={() => navigate('/playground')}
          className="flex items-center gap-2 px-5 py-2.5 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-xl text-sm font-semibold hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
        >
          <FlaskConical size={16} />
          ML Playground
        </button>
      </motion.div>
    </div>
  )
}
