import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle, XCircle, HelpCircle, ArrowRight, Award } from 'lucide-react'

interface QuizQuestion {
  question: string
  options: string[]
  correctIndex: number
  explanation: string
}

interface QuizModalProps {
  questions: QuizQuestion[]
  onClose: () => void
}

export default function QuizModal({ questions, onClose }: QuizModalProps) {
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [answered, setAnswered] = useState(false)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)

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

  const handleSelect = (index: number) => {
    if (answered || finished) return
    setSelected(index)
    setAnswered(true)
    if (index === questions[current].correctIndex) {
      setScore((s) => s + 1)
    }
  }

  const handleNext = () => {
    if (current < questions.length - 1) {
      setCurrent((c) => c + 1)
      setSelected(null)
      setAnswered(false)
    } else {
      setFinished(true)
    }
  }

  const q = questions[current]
  const percentage = finished ? Math.round((score / questions.length) * 100) : 0

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
            <div className="flex items-center gap-2">
              <HelpCircle size={18} className="text-primary-500" />
              <span className="font-semibold text-gray-900 dark:text-white text-sm">
                {finished ? 'Quiz Complete' : `Question ${current + 1} of ${questions.length}`}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X size={16} className="text-gray-400" />
            </button>
          </div>

          {!finished ? (
            <div className="p-5">
              {/* Progress dots */}
              <div className="flex gap-1.5 mb-5">
                {questions.map((_, i) => (
                  <div
                    key={i}
                    className={`flex-1 h-1.5 rounded-full transition-colors ${
                      i < current ? 'bg-secondary-500' : i === current ? 'bg-primary-500' : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  />
                ))}
              </div>

              {/* Question */}
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">{q.question}</h3>

              {/* Options */}
              <div className="space-y-2.5 mb-5">
                {q.options.map((option, i) => {
                  const isSelected = selected === i
                  const isCorrect = q.correctIndex === i
                  const showResult = answered && isSelected
                  const showCorrect = answered && isCorrect && !isSelected

                  return (
                    <button
                      key={i}
                      onClick={() => handleSelect(i)}
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
                        <span>{option}</span>
                        {showResult && (isCorrect ? <CheckCircle size={16} className="text-secondary-500 shrink-0" /> : <XCircle size={16} className="text-red-500 shrink-0" />)}
                        {showCorrect && <CheckCircle size={16} className="text-secondary-500 shrink-0" />}
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* Explanation */}
              {answered && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-3 rounded-xl text-sm mb-4 ${
                    selected === q.correctIndex
                      ? 'bg-secondary-50 dark:bg-secondary-900/20 border border-secondary-200 dark:border-secondary-800 text-secondary-700 dark:text-secondary-300'
                      : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
                  }`}
                >
                  {q.explanation}
                </motion.div>
              )}

              {/* Next button */}
              {answered && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <button
                    onClick={handleNext}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors text-sm font-semibold"
                  >
                    {current < questions.length - 1 ? 'Next Question' : 'See Results'}
                    <ArrowRight size={16} />
                  </button>
                </motion.div>
              )}
            </div>
          ) : (
            /* Results */
            <div className="p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mx-auto mb-4">
                <Award size={28} className="text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Quiz Complete!</h3>
              <div className="text-5xl font-extrabold text-primary-600 dark:text-primary-400 mb-2">{percentage}%</div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                You got {score} of {questions.length} correct
              </p>
              <p className="text-sm text-gray-400 mb-6">
                {percentage === 100
                  ? 'Perfect score! Excellent understanding!'
                  : percentage >= 60
                  ? 'Good job! Review the explanations for any missed questions.'
                  : 'Keep studying! Review the topic and try again.'}
              </p>
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors text-sm font-semibold"
              >
                Close
              </button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
