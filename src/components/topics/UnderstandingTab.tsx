import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AlertTriangle, Table, ChevronDown, ChevronRight,
  StepForward, Beaker, ArrowRight
} from 'lucide-react'

interface UnderstandingTabProps {
  analogy: string
  steps: { title: string; content: string; diagram?: string }[]
  misconceptions: { misconception: string; truth: string }[]
  comparisons?: { label: string; methodA: string; methodB: string }[]
}

export default function UnderstandingTab({
  analogy, steps, misconceptions, comparisons,
}: UnderstandingTabProps) {
  const [misconceptionsOpen, setMisconceptionsOpen] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Analogy Box */}
      <div className="bg-gradient-to-r from-accent-50 to-purple-50 dark:from-accent-900/20 dark:to-purple-900/20 rounded-xl border border-accent-200 dark:border-accent-800 p-5">
        <div className="flex items-start gap-3">
          <div className="p-1.5 rounded-lg bg-accent-100 dark:bg-accent-900/30 shrink-0">
            <Beaker size={18} className="text-accent-600 dark:text-accent-400" />
          </div>
          <div>
            <h3 className="font-semibold text-accent-800 dark:text-accent-300 text-sm mb-1">
              Think of it like this...
            </h3>
            <p className="text-sm text-accent-700 dark:text-accent-300/70 leading-relaxed italic">
              &ldquo;{analogy}&rdquo;
            </p>
          </div>
        </div>
      </div>

      {/* Step-by-Step Walkthrough */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-2 mb-5">
          <StepForward size={16} className="text-primary-500" />
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Step-by-Step Walkthrough</h3>
        </div>
        <div className="space-y-4">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="relative pl-8"
            >
              <div className="absolute left-0 top-0 w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                <span className="text-xs font-bold text-primary-600 dark:text-primary-400">{i + 1}</span>
              </div>
              {i < steps.length - 1 && (
                <div className="absolute left-[11px] top-6 bottom-0 w-0.5 bg-primary-100 dark:bg-primary-900/30" />
              )}
              <div>
                <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">{step.title}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{step.content}</p>
                {step.diagram && (
                  <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-xs font-mono text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
                    {step.diagram}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Comparison Table */}
      {comparisons && comparisons.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Table size={16} className="text-secondary-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Comparison</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-2 pr-4 text-gray-500 dark:text-gray-400 font-medium text-xs uppercase tracking-wider">Aspect</th>
                  <th className="text-left py-2 pr-4 text-primary-600 dark:text-primary-400 font-semibold text-xs uppercase tracking-wider">Transformers</th>
                  <th className="text-left py-2 text-secondary-600 dark:text-secondary-400 font-semibold text-xs uppercase tracking-wider">RNNs</th>
                </tr>
              </thead>
              <tbody>
                {comparisons.map((comp, i) => (
                  <tr key={i} className="border-b border-gray-100 dark:border-gray-800 last:border-0">
                    <td className="py-2.5 pr-4 text-gray-700 dark:text-gray-300 font-medium whitespace-nowrap">{comp.label}</td>
                    <td className="py-2.5 pr-4 text-gray-600 dark:text-gray-400 text-xs leading-relaxed">{comp.methodA}</td>
                    <td className="py-2.5 text-gray-600 dark:text-gray-400 text-xs leading-relaxed">{comp.methodB}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Common Misconceptions */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <button
          onClick={() => setMisconceptionsOpen(!misconceptionsOpen)}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-orange-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
              Common Misconceptions
            </h3>
            <span className="text-xs text-gray-400">({misconceptions.length})</span>
          </div>
          {misconceptionsOpen ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronRight size={16} className="text-gray-400" />}
        </button>
        <AnimatePresence>
          {misconceptionsOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="px-4 pb-4 space-y-3">
                {misconceptions.map((m, i) => (
                  <div key={i} className="p-3 rounded-lg bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-900/30">
                    <div className="flex items-start gap-2 mb-1">
                      <ArrowRight size={12} className="mt-1 shrink-0 text-orange-500" />
                      <span className="text-xs font-medium text-orange-700 dark:text-orange-300">
                        Misconception: {m.misconception}
                      </span>
                    </div>
                    <p className="text-xs text-orange-600 dark:text-orange-400/80 ml-5">{m.truth}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
