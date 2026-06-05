import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  CheckCircle, Circle, Bookmark, ArrowLeft, ArrowRight,
  Share2, FileText,
  Clock, ChevronRight, Home,
  BarChart3,
} from 'lucide-react'
import { useStore } from '@/store/useStore'
import { phases, getTopicById } from '@/data/sidebarData'
import { getTopicContent } from '@/data/topicContent'

const difficultyColors: Record<string, string> = {
  Beginner: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  Intermediate: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  Advanced: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

export default function TopicPage() {
  const { topicId } = useParams<{ topicId: string }>()
  const navigate = useNavigate()
  const { completedTopics, bookmarkedTopics, toggleComplete, toggleBookmark, setCurrentTopic, feedback, submitFeedback } = useStore()

  const [showConfetti, setShowConfetti] = useState(false)
  const [justCompleted, setJustCompleted] = useState(false)
  const [feedbackText, setFeedbackText] = useState('')
  const [showFeedbackInput, setShowFeedbackInput] = useState(false)

  const topicInfo = topicId ? getTopicById(topicId) : undefined
  const content = topicId ? getTopicContent(topicId) : undefined
  const isCompleted = topicId ? completedTopics.includes(topicId) : false
  const isBookmarked = topicId ? bookmarkedTopics.includes(topicId) : false

  const allTopics = phases.flatMap((p) =>
    p.topics.map((t) => ({ ...t, phaseTitle: p.title, phaseId: p.id }))
  )
  const currentIndex = allTopics.findIndex((t) => t.id === topicId)
  const prevTopic = currentIndex > 0 ? allTopics[currentIndex - 1] : null
  const nextTopic = currentIndex < allTopics.length - 1 ? allTopics[currentIndex + 1] : null

  const phase = topicId ? phases.find((p) => p.topics.some((t) => t.id === topicId)) : undefined
  const phaseCompleted = phase
    ? phase.topics.filter((t) => completedTopics.includes(t.id)).length
    : 0
  const phaseTotal = phase?.topics.length || 0
  const phaseProgress = phaseTotal > 0 ? Math.round((phaseCompleted / phaseTotal) * 100) : 0

  const handleComplete = useCallback(() => {
    if (!topicId) return
    const nowCompleted = !completedTopics.includes(topicId)
    toggleComplete(topicId)
    if (nowCompleted) {
      setShowConfetti(true)
      setJustCompleted(true)
      setTimeout(() => setShowConfetti(false), 2500)
    } else {
      setJustCompleted(false)
    }
  }, [topicId, completedTopics, toggleComplete])

  useEffect(() => {
    setJustCompleted(false)
    setShowConfetti(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [topicId])

  if (!topicInfo || !content || !topicId) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <FileText size={48} className="text-gray-300 dark:text-gray-600 mb-4" />
        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">Topic not found</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-4">The topic you're looking for doesn't exist.</p>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
        >
          Back to Home
        </button>
      </div>
    )
  }

  return (
    <>
      {showConfetti && <Confetti />}

      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mb-4 flex-wrap">
            <Link to="/" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors flex items-center gap-1">
              <Home size={12} />
              Home
            </Link>
            <ChevronRight size={10} className="text-gray-300 dark:text-gray-600" />
            <span className="text-gray-700 dark:text-gray-300 font-medium truncate max-w-[200px]">
              {topicInfo.phaseTitle}
            </span>
            <ChevronRight size={10} className="text-gray-300 dark:text-gray-600" />
            <span className="text-primary-600 dark:text-primary-400 font-medium truncate max-w-[200px]">
              {topicInfo.title}
            </span>
          </nav>

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
            <div className="min-w-0">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{topicInfo.title}</h1>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${difficultyColors[content.difficulty]}`}>
                  {content.difficulty}
                </span>
                <span className="flex items-center gap-1 text-xs text-gray-400">
                  <Clock size={12} />
                  {content.estimatedTime}
                </span>
                {phase && (
                  <span className="text-xs text-gray-400">
                    {phaseCompleted}/{phaseTotal} in phase · {phaseProgress}%
                  </span>
                )}
                {content.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={handleComplete}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isCompleted
                    ? 'bg-secondary-50 dark:bg-secondary-900/20 text-secondary-600 dark:text-secondary-400 border border-secondary-200 dark:border-secondary-800'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-secondary-500 border border-transparent hover:border-secondary-200 dark:hover:border-secondary-800'
                }`}
              >
                {isCompleted ? <CheckCircle size={14} /> : <Circle size={14} />}
                {isCompleted ? 'Completed' : 'Mark Complete'}
              </button>
              <button
                onClick={() => toggleBookmark(topicId)}
                className={`p-1.5 rounded-lg transition-all ${
                  isBookmarked
                    ? 'bg-accent-50 dark:bg-accent-900/20 text-accent-600'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-400 hover:text-accent-500'
                }`}
              >
                <Bookmark size={16} className={isBookmarked ? 'fill-accent-500' : ''} />
              </button>
              <button className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-400 hover:text-primary-500 transition-colors">
                <Share2 size={16} />
              </button>
            </div>
          </div>

          {/* Card Content */}
          <div className="space-y-6">
            {/* Overview */}
            <Section title="Overview">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {content.overview}
              </p>
            </Section>

            {/* Key Concepts */}
            <Section title="Key Concepts">
              <div className="space-y-4">
                {content.keyConcepts.map((concept, i) => (
                  <div key={i}>
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                      {concept.title}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                      {concept.description}
                    </p>
                  </div>
                ))}
              </div>
            </Section>

            {/* Practical Application */}
            <Section title="Practical Application">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {content.practicalApplication}
              </p>
            </Section>

            {/* Common Pitfalls */}
            <Section title="Common Pitfalls">
              <div className="space-y-3">
                {content.commonPitfalls.map((pitfall, i) => (
                  <div key={i} className="flex gap-3">
                    <span className="text-red-500 dark:text-red-400 text-sm font-bold shrink-0 mt-0.5">!</span>
                    <div>
                      <span className="font-semibold text-gray-900 dark:text-white text-sm">{pitfall.title}:</span>
                      <span className="text-gray-600 dark:text-gray-400 text-sm"> {pitfall.description}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            {/* Summary */}
            <Section title="Summary">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {content.summary}
              </p>
            </Section>
          </div>

          {/* Bottom Actions */}
          <div className="mt-10 space-y-4">
            {/* Phase Progress */}
            {phase && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700">
                <div className="relative w-10 h-10 shrink-0">
                  <svg width="40" height="40" viewBox="0 0 40 40" className="transform -rotate-90">
                    <circle cx="20" cy="20" r="16" fill="none" stroke="currentColor" strokeWidth="3" className="text-gray-200 dark:text-gray-700" />
                    <circle
                      cx="20" cy="20" r="16" fill="none" stroke="currentColor" strokeWidth="3"
                      className="text-primary-500"
                      strokeDasharray={100.53}
                      strokeDashoffset={100.53 - (phaseCompleted / phaseTotal) * 100.53}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-gray-600 dark:text-gray-400">
                    {phaseProgress}%
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">{phase.title}</div>
                  <div className="text-[11px] text-gray-400">{phaseCompleted} of {phaseTotal} topics completed</div>
                </div>
                <button
                  onClick={() => navigate('/progress')}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                >
                  <BarChart3 size={12} />
                  Details
                </button>
              </div>
            )}

            {/* Next topic banner after completion */}
            {justCompleted && nextTopic && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl bg-gradient-to-r from-secondary-50 to-green-50 dark:from-secondary-900/20 dark:to-green-900/20 border border-secondary-200 dark:border-secondary-800"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-secondary-700 dark:text-secondary-300">
                      Great job! Ready for the next topic?
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setCurrentTopic(nextTopic.id)
                      navigate(`/topic/${nextTopic.id}`)
                    }}
                    className="flex items-center gap-1.5 px-4 py-1.5 bg-secondary-500 text-white rounded-lg hover:bg-secondary-600 transition-colors text-sm font-semibold"
                  >
                    {nextTopic.title}
                    <ArrowRight size={14} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Feedback */}
            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/20">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Was this helpful?</h4>
                {feedback[topicId] && (
                  <span className="text-[11px] text-slate-400">
                    {feedback[topicId].helpful ? '👍' : '👎'} You voted
                  </span>
                )}
              </div>
              {!feedback[topicId] ? (
                <>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => { submitFeedback(topicId, true); setShowFeedbackInput(false) }}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/40 transition-all"
                    >
                      👍 Yes
                    </button>
                    <button
                      onClick={() => setShowFeedbackInput(true)}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/40 transition-all"
                    >
                      👎 No
                    </button>
                  </div>
                  {showFeedbackInput && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-3">
                      <textarea
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                        placeholder="What could be improved?"
                        className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-primary-500 transition-colors resize-none h-20"
                      />
                      <div className="flex justify-end mt-2">
                        <button
                          onClick={() => { submitFeedback(topicId, false, feedbackText || undefined); setShowFeedbackInput(false) }}
                          className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-primary-500 text-white hover:bg-primary-600 transition-colors"
                        >
                          Submit
                        </button>
                      </div>
                    </motion.div>
                  )}
                </>
              ) : (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-slate-500 dark:text-slate-400">
                  Thanks for your feedback! {feedback[topicId].helpful ? '😊' : 'We\'ll work on improving this.'}
                </motion.p>
              )}
            </div>

            {/* Previous / Next */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
              {prevTopic ? (
                <button
                  onClick={() => {
                    setCurrentTopic(prevTopic.id)
                    navigate(`/topic/${prevTopic.id}`)
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors group"
                >
                  <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
                  <span className="hidden sm:inline truncate max-w-[200px]">{prevTopic.title}</span>
                </button>
              ) : <div />}
              {nextTopic ? (
                <button
                  onClick={() => {
                    setCurrentTopic(nextTopic.id)
                    navigate(`/topic/${nextTopic.id}`)
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors group"
                >
                  <span className="hidden sm:inline truncate max-w-[200px]">{nextTopic.title}</span>
                  <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                </button>
              ) : <div />}
            </div>
          </div>
        </motion.div>
      </div>
    </>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/40">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
        <span className="w-1 h-5 rounded-full bg-primary-500" />
        {title}
      </h3>
      {children}
    </div>
  )
}

function Confetti() {
  return (
    <div className="fixed inset-0 pointer-events-none z-[80]">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{
            background: ['#3b82f6', '#22c55e', '#a855f7', '#f59e0b', '#ef4444'][i % 5],
            left: `${Math.random() * 100}%`,
            top: '-10px',
          }}
          animate={{
            y: ['0vh', '100vh'],
            x: [0, (Math.random() - 0.5) * 200],
            rotate: [0, 720],
            opacity: [1, 0],
          }}
          transition={{
            duration: 1.5 + Math.random(),
            ease: 'easeIn',
            delay: Math.random() * 0.5,
          }}
        />
      ))}
    </div>
  )
}
