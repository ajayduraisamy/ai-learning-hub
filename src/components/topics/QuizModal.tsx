import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle, XCircle, HelpCircle, ArrowRight, RotateCcw, ChevronDown, ChevronUp, BookOpen } from 'lucide-react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import type { QuizQuestion } from '@/data/topicContent'
import { useStore } from '@/store/useStore'
import { getAllTopics } from '@/data/sidebarData'

interface QuizModalProps {
  questions: QuizQuestion[]
  topicId: string
  topicTitle: string
  onClose: () => void
}

const typeBadges: Record<string, { label: string; color: string }> = {
  mcq: { label: 'Multiple Choice', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  truefalse: { label: 'True / False', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
  code: { label: 'Code Output', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  fillblank: { label: 'Fill in the Blank', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  match: { label: 'Match the Pairs', color: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400' },
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function QuestionMCQ({ q, selected, onSelect, answered }: { q: QuizQuestion; selected: string | null; onSelect: (a: string) => void; answered: boolean }) {
  return (
    <div className="space-y-2.5">
      {(q.options || []).map((opt) => {
        const isSelected = selected === opt
        const isCorrect = q.correctAnswer === opt
        const showResult = answered && isSelected
        const showCorrect = answered && isCorrect && !isSelected
        return (
          <button
            key={opt}
            onClick={() => onSelect(opt)}
            disabled={answered}
            className={`w-full text-left p-3.5 rounded-xl border text-sm transition-all ${
              showResult
                ? isCorrect
                  ? 'border-secondary-500 bg-secondary-50 dark:bg-secondary-900/20 text-secondary-700 dark:text-secondary-300'
                  : 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                : showCorrect
                ? 'border-secondary-500 bg-secondary-50 dark:bg-secondary-900/20 text-secondary-700 dark:text-secondary-300'
                : isSelected
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                : 'border-gray-200 dark:border-gray-600 hover:border-primary-300 dark:hover:border-primary-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span>{opt}</span>
              {showResult && (isCorrect ? <CheckCircle size={16} className="text-secondary-500 shrink-0" /> : <XCircle size={16} className="text-red-500 shrink-0" />)}
              {showCorrect && <CheckCircle size={16} className="text-secondary-500 shrink-0" />}
            </div>
          </button>
        )
      })}
    </div>
  )
}

function QuestionTrueFalse({ q, selected, onSelect, answered }: { q: QuizQuestion; selected: string | null; onSelect: (a: string) => void; answered: boolean }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {['True', 'False'].map((opt) => {
        const isSelected = selected === opt
        const isCorrect = q.correctAnswer === opt
        const showResult = answered && isSelected
        return (
          <button
            key={opt}
            onClick={() => onSelect(opt)}
            disabled={answered}
            className={`flex items-center justify-center p-6 rounded-xl border-2 text-lg font-bold transition-all ${
              showResult
                ? isCorrect
                  ? 'border-secondary-500 bg-secondary-50 dark:bg-secondary-900/20 text-secondary-600 dark:text-secondary-400'
                  : 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                : isSelected
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                : 'border-gray-200 dark:border-gray-600 hover:border-primary-300 dark:hover:border-primary-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-600 dark:text-gray-400'
            }`}
          >
            {opt}
          </button>
        )
      })}
    </div>
  )
}

function QuestionCode({ q, selected, onSelect, answered }: { q: QuizQuestion; selected: string | null; onSelect: (a: string) => void; answered: boolean }) {
  return (
    <div>
      <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-600 mb-4 max-h-[200px] overflow-y-auto">
        <SyntaxHighlighter language="python" style={oneDark} customStyle={{ margin: 0, borderRadius: 0, fontSize: '0.8rem' }}>
          {q.code || ''}
        </SyntaxHighlighter>
      </div>
      <div className="space-y-2.5">
        {(q.options || []).map((opt) => {
          const isSelected = selected === opt
          const isCorrect = q.correctAnswer === opt
          const showResult = answered && isSelected
          const showCorrect = answered && isCorrect && !isSelected
          return (
            <button
              key={opt}
              onClick={() => onSelect(opt)}
              disabled={answered}
              className={`w-full text-left p-3.5 rounded-xl border text-sm transition-all ${
                showResult
                  ? isCorrect
                    ? 'border-secondary-500 bg-secondary-50 dark:bg-secondary-900/20 text-secondary-700 dark:text-secondary-300'
                    : 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                  : showCorrect
                  ? 'border-secondary-500 bg-secondary-50 dark:bg-secondary-900/20 text-secondary-700 dark:text-secondary-300'
                  : isSelected
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-gray-200 dark:border-gray-600 hover:border-primary-300 dark:hover:border-primary-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs">{opt}</span>
                {showResult && (isCorrect ? <CheckCircle size={16} className="text-secondary-500 shrink-0" /> : <XCircle size={16} className="text-red-500 shrink-0" />)}
                {showCorrect && <CheckCircle size={16} className="text-secondary-500 shrink-0" />}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function QuestionFillBlank({ q, inputValue, onInputChange, answered }: { q: QuizQuestion; inputValue: string; onInputChange: (v: string) => void; answered: boolean }) {
  const parts = q.question.split('___')
  const isCorrect = answered && inputValue.trim().toLowerCase() === q.correctAnswer.toLowerCase()
  const isWrong = answered && !isCorrect
  return (
    <div>
      <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
        {parts[0]}
        <span className={`inline-block min-w-[100px] border-b-2 mx-1 px-2 py-0.5 font-semibold ${
          answered
            ? isCorrect
              ? 'border-secondary-500 text-secondary-600 dark:text-secondary-400'
              : 'border-red-500 text-red-600 dark:text-red-400'
            : 'border-gray-400 dark:border-gray-500 text-gray-800 dark:text-gray-200'
        }`}>
          {inputValue || (answered ? '(blank)' : '')}
        </span>
        {parts[1]}
      </p>
      {!answered && (
        <input
          autoFocus
          type="text"
          value={inputValue}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder="Type your answer..."
          className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && inputValue.trim()) {
              onInputChange(inputValue)
            }
          }}
        />
      )}
      {isWrong && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Correct answer: <span className="font-semibold text-secondary-600 dark:text-secondary-400">{q.correctAnswer}</span>
        </p>
      )}
    </div>
  )
}

function QuestionMatch({ q, userMatch, onMatch, answered, setAnswered }: { q: QuizQuestion; userMatch: Record<string, string>; onMatch: (key: string, value: string) => void; answered: boolean; setAnswered: (v: boolean) => void }) {
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null)
  const shuffledRight = useMemo(() => {
    return shuffleArray((q.pairs || []).map(p => p.right))
  }, [q.pairs])

  const matchedLeftItems = Object.keys(userMatch)
  const allMatched = q.pairs ? matchedLeftItems.length === q.pairs.length : false

  const handleLeftClick = (left: string) => {
    if (answered) return
    if (userMatch[left]) {
      onMatch(left, '__remove__')
      return
    }
    setSelectedLeft(left)
  }

  const handleRightClick = (right: string) => {
    if (answered || !selectedLeft) return
    if (Object.values(userMatch).includes(right)) {
      const existing = Object.entries(userMatch).find(([, v]) => v === right)
      if (existing) onMatch(existing[0], '__remove__')
    }
    onMatch(selectedLeft, right)
    setSelectedLeft(null)
  }

  const handleSubmit = useCallback(() => {
    setAnswered(true)
  }, [setAnswered])

  const rightUsed = Object.values(userMatch)
  const isCorrect = answered && q.pairs && q.pairs.every(p => userMatch[p.left] === p.right)

  return (
    <div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Concepts</p>
          {(q.pairs || []).map((p) => {
            const isLeftSelected = selectedLeft === p.left
            const isMatched = !!userMatch[p.left]
            return (
              <button
                key={p.left}
                onClick={() => handleLeftClick(p.left)}
                disabled={answered}
                className={`w-full text-left p-2.5 rounded-lg border text-xs font-medium transition-all ${
                  isLeftSelected
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 ring-2 ring-primary-300 dark:ring-primary-700'
                    : isMatched
                    ? 'border-secondary-300 dark:border-secondary-700 bg-secondary-50 dark:bg-secondary-900/20 text-gray-700 dark:text-gray-300'
                    : 'border-gray-200 dark:border-gray-600 hover:border-primary-300 dark:hover:border-primary-700 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{p.left}</span>
                  {isMatched && <CheckCircle size={12} className="text-secondary-500" />}
                </div>
              </button>
            )
          })}
        </div>
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Descriptions</p>
          {shuffledRight.map((right) => {
            const isUsed = rightUsed.includes(right)
            const isSelected = false
            return (
              <button
                key={right}
                onClick={() => handleRightClick(right)}
                disabled={answered || !selectedLeft}
                className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all ${
                  isSelected
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : isUsed
                    ? 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-default'
                    : selectedLeft
                    ? 'border-primary-300 dark:border-primary-700 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 cursor-pointer'
                    : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-default'
                }`}
              >
                {right}
              </button>
            )
          })}
        </div>
      </div>
      {allMatched && !answered && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <button
            onClick={handleSubmit}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors text-sm font-semibold"
          >
            Submit Matches
            <ArrowRight size={16} />
          </button>
        </motion.div>
      )}
      {answered && (
        <div className={`p-3 rounded-xl text-sm ${
          isCorrect
            ? 'bg-secondary-50 dark:bg-secondary-900/20 border border-secondary-200 dark:border-secondary-800 text-secondary-700 dark:text-secondary-300'
            : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
        }`}>
          <div className="flex items-center gap-2 mb-2 font-medium">
            {isCorrect ? <CheckCircle size={16} /> : <XCircle size={16} />}
            {isCorrect ? 'All pairs matched correctly!' : 'Some pairs are incorrect'}
          </div>
          {q.pairs && q.pairs.map((p) => (
            <div key={p.left} className="flex items-center justify-between text-xs py-1 border-b border-gray-200 dark:border-gray-700 last:border-0">
              <span className="font-medium">{p.left}</span>
              <span className="text-gray-400 mx-2">→</span>
              <span className={userMatch[p.left] === p.right ? 'text-secondary-600 dark:text-secondary-400' : 'text-red-500'}>
                {userMatch[p.left] || '(not matched)'}
                {userMatch[p.left] !== p.right && <span className="text-gray-400 ml-1">(correct: {p.right})</span>}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function CircularScore({ percentage }: { percentage: number }) {
  const r = 56
  const circumference = 2 * Math.PI * r
  const offset = circumference - (percentage / 100) * circumference
  return (
    <svg width="140" height="140" viewBox="0 0 140 140" className="transform -rotate-90">
      <circle cx="70" cy="70" r={r} fill="none" stroke="currentColor" strokeWidth="8" className="text-gray-200 dark:text-gray-700" />
      <circle
        cx="70" cy="70" r={r} fill="none" strokeWidth="8"
        strokeLinecap="round"
        className={percentage >= 60 ? 'text-secondary-500' : 'text-red-500'}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
      />
      <text x="70" y="70" textAnchor="middle" dominantBaseline="central" className="fill-gray-900 dark:fill-white text-2xl font-bold" transform="rotate(90, 70, 70)">
        {percentage}%
      </text>
    </svg>
  )
}

function ResultsScreen({ questions, userAnswers, onRetry, onClose, topicId }: { questions: QuizQuestion[]; userAnswers: Map<string, string>; onRetry: () => void; onClose: () => void; topicId: string }) {
  const navigate = useNavigate()
  const { setCurrentTopic } = useStore()
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  const total = questions.length
  const correct = questions.filter((q) => {
    const ua = userAnswers.get(q.id)
    if (!ua) return false
    if (q.type === 'match') {
      const userMatch: Record<string, string> = {}
      ua.split('|||').forEach(pair => {
        const [k, v] = pair.split(':::')
        if (k && v) userMatch[k] = v
      })
      return q.pairs && q.pairs.every(p => userMatch[p.left] === p.right)
    }
    if (q.type === 'fillblank') {
      return ua.trim().toLowerCase() === q.correctAnswer.toLowerCase()
    }
    return ua === q.correctAnswer
  }).length

  const percentage = total > 0 ? Math.round((correct / total) * 100) : 0
  const passed = percentage >= 60

  const allTopics = useMemo(() => getAllTopics(), [])
  const currentIndex = allTopics.findIndex((t) => t.id === topicId)
  const nextTopic = currentIndex >= 0 && currentIndex < allTopics.length - 1 ? allTopics[currentIndex + 1] : null

  const handleNextTopic = () => {
    if (nextTopic) {
      setCurrentTopic(nextTopic.id)
      navigate(`/topic/${nextTopic.id}`)
      onClose()
    }
  }

  const toggleExpand = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <div className="p-6 overflow-y-auto max-h-[80vh]">
      <div className="text-center mb-6">
        <CircularScore percentage={percentage} />
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-3 mb-1">Quiz Complete!</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          You got <span className="font-bold text-gray-800 dark:text-gray-200">{correct}</span> of <span className="font-bold">{total}</span> correct
        </p>
        <div className={`inline-block mt-3 px-4 py-1.5 rounded-full text-sm font-semibold ${
          passed
            ? 'bg-secondary-100 dark:bg-secondary-900/30 text-secondary-700 dark:text-secondary-300'
            : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
        }`}>
          {passed ? 'Great job! 🎉' : 'Keep learning! 💪'}
        </div>
      </div>

      {/* Per-question review */}
      <div className="space-y-2 mb-6">
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Review Answers</p>
        {questions.map((q, i) => {
          const ua = userAnswers.get(q.id)
          let isCorrect = false
          if (ua) {
            if (q.type === 'match') {
              const userMatch: Record<string, string> = {}
              ua.split('|||').forEach(pair => {
                const [k, v] = pair.split(':::')
                if (k && v) userMatch[k] = v
              })
              isCorrect = q.pairs ? q.pairs.every(p => userMatch[p.left] === p.right) : false
            } else if (q.type === 'fillblank') {
              isCorrect = ua.trim().toLowerCase() === q.correctAnswer.toLowerCase()
            } else {
              isCorrect = ua === q.correctAnswer
            }
          }

          const isExpanded = expanded[q.id]
          const badge = typeBadges[q.type]

          return (
            <div key={q.id} className={`border rounded-xl overflow-hidden transition-colors ${
              isCorrect
                ? 'border-secondary-200 dark:border-secondary-800'
                : 'border-red-200 dark:border-red-800'
            }`}>
              <button
                onClick={() => toggleExpand(q.id)}
                className="w-full flex items-center gap-3 p-3 text-left bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                  isCorrect ? 'bg-secondary-100 dark:bg-secondary-900/30' : 'bg-red-100 dark:bg-red-900/30'
                }`}>
                  {isCorrect ? <CheckCircle size={14} className="text-secondary-600 dark:text-secondary-400" /> : <XCircle size={14} className="text-red-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${badge.color}`}>{badge.label}</span>
                    <span className="text-xs text-gray-400">Q{i + 1}</span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 truncate mt-0.5">{q.question}</p>
                </div>
                {isExpanded ? <ChevronUp size={16} className="text-gray-400 shrink-0" /> : <ChevronDown size={16} className="text-gray-400 shrink-0" />}
              </button>
              {isExpanded && (
                <div className="px-3 pb-3 pt-0 bg-white dark:bg-gray-800">
                  <div className="text-xs space-y-1.5 pl-10">
                    {ua && (
                      <div className={`flex items-center gap-2 ${isCorrect ? 'text-secondary-600 dark:text-secondary-400' : 'text-red-500'}`}>
                        <span className="font-medium">Your answer:</span>
                        <span>{ua.replace(/\|\|\|/g, ', ').replace(/:::/g, ' → ')}</span>
                      </div>
                    )}
                    {!isCorrect && (
                      <div className="text-secondary-600 dark:text-secondary-400 flex items-center gap-2">
                        <span className="font-medium">Correct answer:</span>
                        <span>{q.correctAnswer}</span>
                      </div>
                    )}
                    {q.explanation && (
                      <div className="text-gray-500 dark:text-gray-400 mt-1 pt-1 border-t border-gray-100 dark:border-gray-700">
                        {q.explanation}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Action buttons */}
      <div className="flex flex-col gap-2">
        <button
          onClick={onRetry}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors text-sm font-semibold"
        >
          <RotateCcw size={16} />
          Retry Quiz
        </button>
        {nextTopic && (
          <button
            onClick={handleNextTopic}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-secondary-500 text-white rounded-xl hover:bg-secondary-600 transition-colors text-sm font-semibold"
          >
            <ArrowRight size={16} />
            Next Topic: {nextTopic.title}
          </button>
        )}
        <button
          onClick={onClose}
          className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-semibold"
        >
          <BookOpen size={16} />
          Back to Topic
        </button>
      </div>
    </div>
  )
}

export default function QuizModal({ questions, topicId, topicTitle, onClose }: QuizModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<Map<string, string>>(new Map())
  const [answered, setAnswered] = useState(false)
  const [finished, setFinished] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [matchPairs, setMatchPairs] = useState<Record<string, string>>({})
  const modalRef = useRef<HTMLDivElement>(null)

  const q = questions[currentIndex]

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [onClose])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  const handleAnswer = (answer: string) => {
    if (answered || finished) return
    const newAnswers = new Map(userAnswers)
    newAnswers.set(q.id, answer)
    setUserAnswers(newAnswers)
    setAnswered(true)
  }

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1)
      setAnswered(false)
      setInputValue('')
      setMatchPairs({})
    } else {
      setFinished(true)
    }
  }

  const handleRetry = () => {
    setCurrentIndex(0)
    setUserAnswers(new Map())
    setAnswered(false)
    setFinished(false)
    setInputValue('')
    setMatchPairs({})
  }

  if (!q) {
    return (
      <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4">
        <div className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 text-center">
          <p className="text-gray-500 dark:text-gray-400">No quiz questions available.</p>
          <button onClick={onClose} className="mt-4 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm">Close</button>
        </div>
      </div>
    )
  }


  const badge = typeBadges[q.type]

  return (
    <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4">
      <AnimatePresence>
        <motion.div
          ref={modalRef}
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 min-w-0">
              <HelpCircle size={18} className="text-primary-500 shrink-0" />
              <span className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                {finished ? 'Quiz Complete' : topicTitle ? `${topicTitle} Quiz` : 'Quiz'}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shrink-0"
            >
              <X size={16} className="text-gray-400" />
            </button>
          </div>

          {!finished ? (
            <div className="p-5">
              {/* Progress bar */}
              <div className="flex gap-1.5 mb-4">
                {questions.map((_, i) => (
                  <div
                    key={i}
                    className={`flex-1 h-1.5 rounded-full transition-colors ${
                      i < currentIndex ? 'bg-secondary-500' : i === currentIndex ? 'bg-primary-500' : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  />
                ))}
              </div>

              {/* Question type badge */}
              <div className="flex items-center gap-2 mb-3">
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${badge.color}`}>
                  {badge.label}
                </span>
                <span className="text-xs text-gray-400">Question {currentIndex + 1} of {questions.length}</span>
              </div>

              {/* Question text */}
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4 leading-relaxed">
                {q.type === 'fillblank' ? q.question.replace('___', '______') : q.question}
              </h3>

              {/* Answer area */}
              {q.type === 'mcq' && (
                <QuestionMCQ q={q} selected={userAnswers.get(q.id) || null} onSelect={handleAnswer} answered={answered} />
              )}
              {q.type === 'truefalse' && (
                <QuestionTrueFalse q={q} selected={userAnswers.get(q.id) || null} onSelect={handleAnswer} answered={answered} />
              )}
              {q.type === 'code' && (
                <QuestionCode q={q} selected={userAnswers.get(q.id) || null} onSelect={handleAnswer} answered={answered} />
              )}
              {q.type === 'fillblank' && (
                <QuestionFillBlank q={q} inputValue={inputValue} onInputChange={(v) => {
                  setInputValue(v)
                  if (v.trim()) handleAnswer(v)
                }} answered={answered} />
              )}
              {q.type === 'match' && (
                <QuestionMatch q={q} userMatch={matchPairs} onMatch={(key, value) => {
                  const newPairs = { ...matchPairs }
                  if (value === '__remove__') {
                    delete newPairs[key]
                  } else {
                    newPairs[key] = value
                  }
                  setMatchPairs(newPairs)
                  const newAnswers = new Map(userAnswers)
                  const serialized = Object.entries(newPairs).map(([k, v]) => `${k}:::${v}`).join('|||')
                  newAnswers.set(q.id, serialized)
                  setUserAnswers(newAnswers)
                }} answered={answered} setAnswered={setAnswered} />
              )}

              {/* Explanation */}
              {answered && q.type !== 'match' && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-3 rounded-xl text-sm mt-4 ${
                    (q.type === 'fillblank'
                      ? userAnswers.get(q.id)?.trim().toLowerCase() === q.correctAnswer.toLowerCase()
                      : userAnswers.get(q.id) === q.correctAnswer)
                      ? 'bg-secondary-50 dark:bg-secondary-900/20 border border-secondary-200 dark:border-secondary-800 text-secondary-700 dark:text-secondary-300'
                      : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
                  }`}
                >
                  {q.explanation}
                </motion.div>
              )}

              {/* Next button */}
              {answered && q.type !== 'match' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-4"
                >
                  <button
                    onClick={handleNext}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors text-sm font-semibold"
                  >
                    {currentIndex < questions.length - 1 ? 'Next Question' : 'See Results'}
                    <ArrowRight size={16} />
                  </button>
                </motion.div>
              )}
            </div>
          ) : (
            <ResultsScreen
              questions={questions}
              userAnswers={userAnswers}
              onRetry={handleRetry}
              onClose={onClose}
              topicId={topicId}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
