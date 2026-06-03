import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import {
  Play, Copy, Download, CheckCircle, AlertCircle,
  Code2, Terminal
} from 'lucide-react'
import type { CodeExample } from '@/data/topicContent'

interface CodeTabProps {
  examples: CodeExample[]
}

const levelOrder: CodeExample['level'][] = ['basic', 'intermediate', 'advanced']
const levelLabels: Record<string, string> = { basic: 'Basic', intermediate: 'Intermediate', advanced: 'Advanced' }
const levelColors: Record<string, string> = {
  basic: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800',
  intermediate: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
  advanced: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800',
}

export default function CodeTab({ examples }: CodeTabProps) {
  const sorted = [...examples].sort((a, b) => levelOrder.indexOf(a.level) - levelOrder.indexOf(b.level))
  const [activeIndex, setActiveIndex] = useState(0)
  const [copied, setCopied] = useState(false)
  const [showOutput, setShowOutput] = useState(false)
  const active = sorted[activeIndex]

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(active.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [active])

  const handleDownload = useCallback(() => {
    const blob = new Blob([active.code], { type: 'text/x-python' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `example_${active.level}.py`
    a.click()
    URL.revokeObjectURL(url)
  }, [active])

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Difficulty tabs */}
      <div className="flex items-center gap-2">
        {sorted.map((ex, i) => (
          <button
            key={ex.level}
            onClick={() => { setActiveIndex(i); setShowOutput(false) }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              i === activeIndex
                ? levelColors[ex.level] + ' shadow-sm'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-transparent hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {levelLabels[ex.level]}
          </button>
        ))}
      </div>

      {/* Code Block */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Code2 size={14} className="text-primary-500" />
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              {active.level === 'basic' ? 'basic_example.py' : active.level === 'intermediate' ? 'intermediate_example.py' : 'advanced_example.py'}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleCopy}
              className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              title="Copy code"
            >
              {copied ? <CheckCircle size={14} className="text-secondary-500" /> : <Copy size={14} className="text-gray-400" />}
            </button>
            <button
              onClick={handleDownload}
              className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              title="Download as .py"
            >
              <Download size={14} className="text-gray-400" />
            </button>
          </div>
        </div>

        {/* Code */}
        <SyntaxHighlighter
          language="python"
          style={oneDark}
          customStyle={{ margin: 0, borderRadius: 0, fontSize: '13px', lineHeight: '1.6' }}
          showLineNumbers
        >
          {active.code}
        </SyntaxHighlighter>
      </div>

      {/* Run / Output controls */}
      <button
        onClick={() => setShowOutput(!showOutput)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900 dark:bg-gray-800 text-white hover:bg-gray-800 dark:hover:bg-gray-700 transition-colors text-sm font-medium w-fit"
      >
        <Play size={14} />
        {showOutput ? 'Hide Output' : 'Run Code'}
      </button>

      <AnimatePresence>
        {showOutput && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="bg-gray-950 rounded-xl border border-gray-800 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-900 border-b border-gray-800">
                <Terminal size={14} className="text-gray-400" />
                <span className="text-xs font-medium text-gray-400">Terminal Output</span>
              </div>
              <pre className="p-4 text-sm font-mono text-green-400 leading-relaxed overflow-x-auto whitespace-pre-wrap">
                {active.output}
              </pre>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Explanation */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-start gap-2">
          <AlertCircle size={14} className="text-primary-500 mt-0.5 shrink-0" />
          <div>
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Explanation</span>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">{active.explanation}</p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
