import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Lightbulb, Info, Target, ChevronRight, BookOpen } from 'lucide-react'

interface TheoryTabProps {
  theory: string
  objectives: string[]
  prerequisites: string[]
}

export default function TheoryTab({ theory, objectives, prerequisites }: TheoryTabProps) {
  const navigate = useNavigate()

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Learning Objectives */}
      <div className="bg-gradient-to-r from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20 rounded-xl border border-primary-200 dark:border-primary-800 p-5">
        <div className="flex items-center gap-2 mb-3">
          <Target size={18} className="text-primary-600 dark:text-primary-400" />
          <h3 className="font-semibold text-primary-800 dark:text-primary-300 text-sm">Learning Objectives</h3>
        </div>
        <ul className="space-y-1.5">
          {objectives.map((obj, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-primary-700 dark:text-primary-300/80">
              <ChevronRight size={14} className="mt-0.5 shrink-0 text-primary-400" />
              {obj}
            </li>
          ))}
        </ul>
      </div>

      {/* Prerequisites with links */}
      {prerequisites.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-xl px-4 py-3 border border-gray-100 dark:border-gray-700">
          <BookOpen size={14} className="shrink-0" />
          <span className="font-medium text-gray-600 dark:text-gray-300">Prerequisites:</span>
          {prerequisites.map((prereq, i) => (
            <span key={prereq} className="flex items-center gap-1">
              <button
                onClick={() => navigate(`/topic/${prereq}`)}
                className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 hover:underline underline-offset-2 font-medium transition-colors"
              >
                {prereq}
              </button>
              {i < prerequisites.length - 1 && <span className="text-gray-300 dark:text-gray-600">,</span>}
            </span>
          ))}
        </div>
      )}

      {/* Why This Matters */}
      <div className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-xl border border-amber-200 dark:border-amber-800 p-5">
        <div className="flex items-start gap-3">
          <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/30 shrink-0">
            <Lightbulb size={18} className="text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h3 className="font-semibold text-amber-800 dark:text-amber-300 text-sm mb-1">Why This Matters</h3>
            <p className="text-sm text-amber-700 dark:text-amber-300/70 leading-relaxed">
              Understanding these concepts is crucial for building modern AI systems. They form the
              foundation for advanced topics and are directly applicable to real-world problems in
              industry. Mastery here will make subsequent phases significantly easier.
            </p>
          </div>
        </div>
      </div>

      {/* Key Definitions */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
        <div className="flex items-center gap-2 mb-3">
          <Info size={16} className="text-primary-500" />
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Key Definitions</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { term: 'Supervised Learning', def: 'Model learns from labeled training data to predict outputs for new inputs' },
            { term: 'Unsupervised Learning', def: 'Model finds patterns in unlabeled data without explicit guidance' },
            { term: 'Feature Engineering', def: 'Process of selecting and transforming variables for better model performance' },
            { term: 'Gradient Descent', def: 'Optimization algorithm that iteratively minimizes the loss function' },
          ].map((item) => (
            <div key={item.term} className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
              <div className="text-xs font-bold text-primary-600 dark:text-primary-400 uppercase mb-1">{item.term}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{item.def}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Markdown Theory Content */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="prose prose-gray dark:prose-invert max-w-none prose-headings:font-semibold prose-headings:text-gray-900 dark:prose-headings:text-white prose-a:text-primary-600 dark:prose-a:text-primary-400 prose-code:text-sm prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:font-mono prose-pre:bg-gray-900 dark:prose-pre:bg-gray-950 prose-pre:text-gray-100">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeKatex]}
          >
            {theory}
          </ReactMarkdown>
        </div>
      </div>
    </motion.div>
  )
}
