import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home } from 'lucide-react'

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col items-center justify-center py-20">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <div className="text-8xl font-bold text-primary-500 dark:text-primary-400 mb-4">404</div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Page Not Found</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium"
        >
          <Home size={18} />
          Back to Home
        </button>
      </motion.div>
    </div>
  )
}
