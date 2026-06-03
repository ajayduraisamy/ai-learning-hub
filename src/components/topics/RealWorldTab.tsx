import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Building2, Briefcase, CheckSquare, Wrench, Users,
  BookOpen, TrendingUp, Lightbulb, Play,
  RefreshCw, ExternalLink, BarChart3, Globe,
  Video, FileText, GraduationCap, Cpu, ExternalLink as LinkIcon
} from 'lucide-react'

interface RealWorldTabProps {
  useCases: { industry: string; description: string }[]
  caseStudy: { problem: string; solution: string; results: string }
  bestPractices: string[]
  tools: string[]
  jobRoles: string[]
  furtherReading: string[]
}

const companyLogos: Record<string, { icon: any; color: string; bg: string }> = {
  Technology: { icon: Cpu, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/30' },
  Healthcare: { icon: BarChart3, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900/30' },
  Finance: { icon: TrendingUp, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/30' },
  'E-commerce': { icon: Globe, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-100 dark:bg-purple-900/30' },
}

const readingLinks: Record<string, { icon: typeof FileText; label: string; url: string }> = {
  'Original paper and foundational research': { icon: FileText, label: 'Original Paper', url: 'https://arxiv.org' },
  'Official documentation and tutorials': { icon: BookOpen, label: 'Documentation', url: 'https://pytorch.org/docs' },
  'Community blog posts and case studies': { icon: Globe, label: 'Blog Posts', url: 'https://towardsdatascience.com' },
  'Online courses and certification programs': { icon: GraduationCap, label: 'Courses', url: 'https://www.coursera.org' },
  'Video tutorials and lectures': { icon: Video, label: 'Video Tutorials', url: 'https://www.youtube.com' },
  'GitHub repositories and code examples': { icon: LinkIcon, label: 'GitHub Examples', url: 'https://github.com' },
}

function InteractiveDemo() {
  const [isRunning, setIsRunning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState<number[]>([])

  const handleToggle = () => {
    if (isRunning) {
      setIsRunning(false)
      return
    }
    setIsRunning(true)
    setProgress(0)
    setResults([])

    const interval = setInterval(() => {
      setProgress((p) => {
        const next = p + 10
        if (next >= 100) {
          clearInterval(interval)
          setIsRunning(false)
          setResults([0.92, 0.87, 0.95, 0.89, 0.93])
          return 100
        }
        setResults((r) => [...r, Math.random() * 0.3 + 0.6])
        return next
      })
    }, 300)
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
      <div className="flex items-center gap-2 mb-4">
        <Cpu size={16} className="text-primary-500" />
        <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Interactive Demo (Simulated)</h3>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <button
          onClick={handleToggle}
          disabled={isRunning}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            isRunning
              ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
              : 'bg-primary-500 text-white hover:bg-primary-600'
          }`}
        >
          {isRunning ? <RefreshCw size={14} className="animate-spin" /> : <Play size={14} />}
          {isRunning ? 'Training...' : 'Run Training'}
        </button>
        {results.length > 0 && !isRunning && (
          <button
            onClick={() => { setResults([]); setProgress(0) }}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
          >
            <RefreshCw size={14} />
            Reset
          </button>
        )}
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
          <span>Training Progress</span>
          <span>{progress}%</span>
        </div>
        <div className="h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Results chart */}
      <AnimatePresence>
        {results.length > 0 && !isRunning && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              Validation Accuracy per Epoch
            </div>
            <div className="flex items-end gap-1.5 h-20">
              {results.map((val, i) => (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${val * 100}%` }}
                  transition={{ duration: 0.5, delay: i * 0.05 }}
                  className="flex-1 rounded-t bg-primary-400 dark:bg-primary-600 hover:bg-primary-500 transition-colors relative group"
                >
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-medium text-gray-500 dark:text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    {(val * 100).toFixed(1)}%
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="text-center text-[10px] text-gray-400 mt-1">Epochs</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
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
          {useCases.map((uc, i) => {
            const logo = companyLogos[uc.industry] || companyLogos.Technology
            const Icon = logo.icon
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow group"
              >
                <div className={`w-10 h-10 rounded-xl ${logo.bg} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <Icon size={20} className={logo.color} />
                </div>
                <div className="text-xs font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wider mb-2">
                  {uc.industry}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {uc.description}
                </p>
              </motion.div>
            )
          })}
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
          <div className="p-4 rounded-xl bg-gradient-to-r from-secondary-50 to-green-50 dark:from-secondary-900/20 dark:to-green-900/20 border border-secondary-200 dark:border-secondary-800">
            <div className="flex items-center gap-1.5 mb-1">
              <BarChart3 size={14} className="text-secondary-600 dark:text-secondary-400" />
              <span className="text-xs font-semibold text-secondary-600 dark:text-secondary-400 uppercase">Results</span>
            </div>
            <p className="text-sm text-secondary-700 dark:text-secondary-300 leading-relaxed">{caseStudy.results}</p>
          </div>
        </div>
      </div>

      {/* Interactive Demo */}
      <InteractiveDemo />

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

      {/* Tools & Libraries + Job Roles */}
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
                className="px-2.5 py-1 rounded-lg bg-accent-50 dark:bg-accent-900/20 text-accent-700 dark:text-accent-300 text-xs font-medium border border-accent-200 dark:border-accent-800 hover:bg-accent-100 dark:hover:bg-accent-900/40 transition-colors cursor-default"
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {furtherReading.map((item, i) => {
            const link = readingLinks[item]
            const Icon = link?.icon || FileText
            return (
              <a
                key={i}
                href={link?.url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 hover:underline underline-offset-2 transition-colors p-2 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20"
              >
                <Icon size={14} />
                <span className="flex-1">{link?.label || item}</span>
                <ExternalLink size={12} className="text-gray-300 dark:text-gray-600" />
              </a>
            )
          })}
        </div>
      </div>
    </motion.div>
  )
}
