import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Lightbulb, Info, Target, ChevronRight, BookOpen, Sigma, Blocks, ArrowRight, ArrowDown } from 'lucide-react'
import type { KeyDefinition, FormulaCard, ArchitectureDiagram, ArchitectureBlock } from '@/data/topicContent'

interface TheoryTabProps {
  theory: string
  objectives: string[]
  prerequisites: string[]
  keyDefinitions: KeyDefinition[]
  formulas: FormulaCard[]
  whyItMatters: string
  architecture?: ArchitectureDiagram
}

function ArchitectureBlockView({ block, depth = 0 }: { block: ArchitectureBlock; depth?: number }) {
  return (
    <div className={`${depth > 0 ? 'ml-6 mt-2' : ''}`}>
      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
        <div className="text-xs font-bold text-primary-600 dark:text-primary-400 uppercase">{block.label}</div>
        <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{block.description}</div>
      </div>
      {block.subBlocks && block.subBlocks.length > 0 && (
        <div className="flex flex-col items-center">
          <ArrowDown size={14} className="text-slate-300 dark:text-slate-600 my-1" />
          <div className="space-y-2 w-full">
            {block.subBlocks.map((sb, i) => (
              <ArchitectureBlockView key={i} block={sb} depth={depth + 1} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function TheoryTab({ theory, objectives, prerequisites, keyDefinitions, formulas, whyItMatters, architecture }: TheoryTabProps) {
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
        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-xl px-4 py-3 border border-slate-100 dark:border-slate-700">
          <BookOpen size={14} className="shrink-0" />
          <span className="font-medium text-slate-600 dark:text-slate-300">Prerequisites:</span>
          {prerequisites.map((prereq, i) => (
            <span key={prereq} className="flex items-center gap-1">
              <button
                onClick={() => navigate(`/topic/${prereq}`)}
                className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 hover:underline underline-offset-2 font-medium transition-colors"
              >
                {prereq}
              </button>
              {i < prerequisites.length - 1 && <span className="text-slate-300 dark:text-slate-600">,</span>}
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
            <p className="text-sm text-amber-700 dark:text-amber-300/70 leading-relaxed">{whyItMatters}</p>
          </div>
        </div>
      </div>

      {/* Key Definitions */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Info size={16} className="text-primary-500" />
          <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Key Definitions</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {keyDefinitions.map((item) => (
            <div key={item.term} className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="text-xs font-bold text-primary-600 dark:text-primary-400 uppercase mb-1">{item.term}</div>
              <div className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{item.definition}</div>
              {item.example && (
                <div className="mt-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-500 dark:text-slate-400 font-mono">
                  {item.example}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Formula Cards */}
      {formulas.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Sigma size={16} className="text-primary-500" />
            <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Key Formulas</h3>
          </div>
          <div className="space-y-3">
            {formulas.map((f, i) => (
              <div key={i} className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-2">{f.title}</div>
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 mb-3 font-mono text-sm text-slate-700 dark:text-slate-300 text-center">
                  {f.formula}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{f.explanation}</div>
                {f.example && (
                  <div className="mt-2 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400 font-mono whitespace-pre-wrap">
                    {f.example}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Architecture Diagram */}
      {architecture && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Blocks size={16} className="text-primary-500" />
            <h3 className="font-semibold text-slate-900 dark:text-white text-sm">{architecture.title}</h3>
          </div>
          <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex flex-col items-center gap-2">
              {architecture.blocks.map((block, i) => (
                <div key={i} className="w-full">
                  <ArchitectureBlockView block={block} />
                  {i < architecture.blocks.length - 1 && (
                    <div className="flex justify-center my-1">
                      <ArrowDown size={14} className="text-slate-300 dark:text-slate-600" />
                    </div>
                  )}
                </div>
              ))}
            </div>
            {architecture.description && (
              <div className="mt-3 text-xs text-slate-500 dark:text-slate-400 text-center">{architecture.description}</div>
            )}
          </div>
        </div>
      )}

      {/* Markdown Theory Content */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-semibold prose-headings:text-slate-900 dark:prose-headings:text-white prose-a:text-primary-600 dark:prose-a:text-primary-400 prose-code:text-sm prose-code:bg-slate-100 dark:prose-code:bg-slate-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:font-mono prose-pre:bg-slate-900 dark:prose-pre:bg-slate-950 prose-pre:text-slate-100">
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
