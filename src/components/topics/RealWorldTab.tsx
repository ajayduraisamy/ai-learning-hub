import { motion } from 'framer-motion'
import {
  Building2, Briefcase, CheckSquare, Wrench, Users,
  BookOpen, TrendingUp, Lightbulb
} from 'lucide-react'

interface RealWorldTabProps {
  useCases: { industry: string; description: string }[]
  caseStudy: { problem: string; solution: string; results: string }
  bestPractices: string[]
  tools: string[]
  jobRoles: string[]
  furtherReading: string[]
}

export default function RealWorldTab({
  useCases, caseStudy, bestPractices, tools, jobRoles, furtherReading,
}: RealWorldTabProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Industry Use Cases */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Building2 size={16} className="text-primary-500" />
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Industry Use Cases</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {useCases.map((uc, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700"
            >
              <div className="text-xs font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wider mb-2">
                {uc.industry}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {uc.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Case Study */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20 border-b border-primary-200 dark:border-primary-900/30">
          <Briefcase size={16} className="text-primary-600 dark:text-primary-400" />
          <h3 className="font-semibold text-primary-800 dark:text-primary-300 text-sm">Case Study</h3>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <Lightbulb size={14} className="text-orange-500" />
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Problem</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{caseStudy.problem}</p>
          </div>
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingUp size={14} className="text-primary-500" />
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Solution</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{caseStudy.solution}</p>
          </div>
          <div className="p-3 rounded-lg bg-secondary-50 dark:bg-secondary-900/20 border border-secondary-200 dark:border-secondary-800">
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingUp size={14} className="text-secondary-600 dark:text-secondary-400" />
              <span className="text-xs font-semibold text-secondary-600 dark:text-secondary-400 uppercase">Results</span>
            </div>
            <p className="text-sm text-secondary-700 dark:text-secondary-300 leading-relaxed">{caseStudy.results}</p>
          </div>
        </div>
      </div>

      {/* Best Practices */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-2 mb-4">
          <CheckSquare size={16} className="text-secondary-500" />
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Best Practices</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {bestPractices.map((bp, i) => (
            <div key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
              <CheckSquare size={14} className="text-secondary-500 mt-0.5 shrink-0" />
              {bp}
            </div>
          ))}
        </div>
      </div>

      {/* Tools & Libraries */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Wrench size={16} className="text-accent-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Tools & Libraries</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {tools.map((tool) => (
              <span
                key={tool}
                className="px-2.5 py-1 rounded-lg bg-accent-50 dark:bg-accent-900/20 text-accent-700 dark:text-accent-300 text-xs font-medium border border-accent-200 dark:border-accent-800"
              >
                {tool}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Users size={16} className="text-cyan-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Related Job Roles</h3>
          </div>
          <div className="space-y-1.5">
            {jobRoles.map((role) => (
              <div key={role} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                {role}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Further Reading */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen size={16} className="text-primary-500" />
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Further Reading</h3>
        </div>
        <div className="space-y-2">
          {furtherReading.map((item, i) => (
            <a
              key={i}
              href="#"
              className="flex items-center gap-2 text-sm text-primary-600 dark:text-primary-400 hover:underline"
            >
              <BookOpen size={12} />
              {item}
            </a>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
