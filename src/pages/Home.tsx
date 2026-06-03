import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useInView, animate } from 'framer-motion'
import {
  Brain, BookOpen, BarChart3, Sparkles, MessageSquare, Bot,
  Eye, Text, Cloud, ChevronRight, Lock, CheckCircle, Clock,
  ArrowRight, GraduationCap, Github, Heart, Code2, Layers,
  Award, Target, TrendingUp, Cpu, Network, Globe, Zap,
  PlayCircle, BookmarkCheck, Menu
} from 'lucide-react'
import { useStore } from '@/store/useStore'
import { phases } from '@/data/sidebarData'

function Counter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (inView) {
      const controls = animate(0, value, {
        duration: 1.5,
        ease: 'easeOut',
        onUpdate: (v) => setDisplay(Math.floor(v)),
      })
      return () => controls.stop()
    }
  }, [inView, value])

  return <span ref={ref}>{display}{suffix}</span>
}

const learnCategories = [
  { icon: Brain, title: 'Artificial Intelligence', desc: 'Foundations of AI, intelligent agents, search algorithms, knowledge representation', count: 24, color: 'text-primary-500', bg: 'bg-primary-50 dark:bg-primary-900/20', border: 'hover:border-primary-300 dark:hover:border-primary-700' },
  { icon: Cpu, title: 'Machine Learning', desc: 'Supervised, unsupervised, ensemble methods, model evaluation & tuning', count: 46, color: 'text-secondary-500', bg: 'bg-secondary-50 dark:bg-secondary-900/20', border: 'hover:border-secondary-300 dark:hover:border-secondary-700' },
  { icon: Network, title: 'Deep Learning', desc: 'Neural networks, CNNs, RNNs, Transformers, attention mechanisms', count: 52, color: 'text-accent-500', bg: 'bg-accent-50 dark:bg-accent-900/20', border: 'hover:border-accent-300 dark:hover:border-accent-700' },
  { icon: Sparkles, title: 'Generative AI', desc: 'GANs, VAEs, diffusion models, autoregressive models & creative AI', count: 18, color: 'text-pink-500', bg: 'bg-pink-50 dark:bg-pink-900/20', border: 'hover:border-pink-300 dark:hover:border-pink-700' },
  { icon: MessageSquare, title: 'LLMs & RAG', desc: 'Large language models, retrieval-augmented generation, embeddings & vector search', count: 24, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20', border: 'hover:border-orange-300 dark:hover:border-orange-700' },
  { icon: Bot, title: 'AI Agents', desc: 'Autonomous agents, tool use, multi-agent systems, reasoning & planning', count: 15, color: 'text-cyan-500', bg: 'bg-cyan-50 dark:bg-cyan-900/20', border: 'hover:border-cyan-300 dark:hover:border-cyan-700' },
  { icon: Eye, title: 'Computer Vision', desc: 'Object detection, segmentation, face recognition, 3D vision & multimodal models', count: 38, color: 'text-violet-500', bg: 'bg-violet-50 dark:bg-violet-900/20', border: 'hover:border-violet-300 dark:hover:border-violet-700' },
  { icon: Text, title: 'NLP', desc: 'Text processing, embeddings, sequence models, transformers for language', count: 42, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-900/20', border: 'hover:border-indigo-300 dark:hover:border-indigo-700' },
  { icon: Cloud, title: 'MLOps', desc: 'ML pipelines, model serving, monitoring, CI/CD, infrastructure & governance', count: 56, color: 'text-sky-500', bg: 'bg-sky-50 dark:bg-sky-900/20', border: 'hover:border-sky-300 dark:hover:border-sky-700' },
]

const featuredTopics = [
  { id: 'p1-intro-python', title: 'Python for ML', desc: 'Master Python fundamentals for data science and machine learning', difficulty: 'Beginner' as const },
  { id: 'p2-linear-algebra', title: 'Linear Algebra for ML', desc: 'Vectors, matrices, eigenvalues & SVD — the math behind ML', difficulty: 'Intermediate' as const },
  { id: 'p8-transformers', title: 'Transformers Architecture', desc: 'Understand self-attention, multi-head attention & the transformer revolution', difficulty: 'Advanced' as const },
  { id: 'p8-fine-tuning', title: 'Fine-Tuning LLMs', desc: 'Full fine-tuning, LoRA, QLoRA & parameter-efficient techniques', difficulty: 'Advanced' as const },
  { id: 'p10-agent-frameworks', title: 'AI Agent Frameworks', desc: 'Build agents with LangGraph, CrewAI & AutoGen', difficulty: 'Advanced' as const },
  { id: 'p19-rag-intro', title: 'RAG Fundamentals', desc: 'Retrieval-augmented generation: architecture, chunking & retrieval strategies', difficulty: 'Intermediate' as const },
  { id: 'p11-object-detection', title: 'Object Detection', desc: 'YOLO, Faster R-CNN, DETR & modern detection architectures', difficulty: 'Advanced' as const },
  { id: 'p16-mlops-intro', title: 'MLOps Principles', desc: 'End-to-end ML lifecycle management, from development to production', difficulty: 'Intermediate' as const },
]

const difficultyColors = {
  Beginner: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  Intermediate: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  Advanced: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

export default function Home() {
  const navigate = useNavigate()
  const { completedTopics, currentTopic, setCurrentTopic } = useStore()
  const roadmapRef = useRef<HTMLDivElement>(null)

  const totalTopics = phases.reduce((a, p) => a + p.topics.length, 0)
  const progress = totalTopics > 0 ? Math.round((completedTopics.length / totalTopics) * 100) : 0
  const circumference = 2 * Math.PI * 80

  const scrollToRoadmap = () => {
    roadmapRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const continueTopic = currentTopic || phases[0].topics[0]?.id || ''

  return (
    <div className="max-w-6xl mx-auto space-y-20">
      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-600 via-primary-700 to-accent-700 dark:from-primary-900 dark:via-primary-950 dark:to-accent-950 p-8 md:p-16 lg:p-20">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-accent-500/10 rounded-full blur-3xl" />
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white/30 rounded-full"
              style={{
                top: `${20 + i * 15}%`,
                left: `${10 + i * 18}%`,
              }}
              animate={{
                y: [0, -12, 0],
                opacity: [0.2, 0.6, 0.2],
              }}
              transition={{
                duration: 3 + i * 0.5,
                repeat: Infinity,
                delay: i * 0.4,
              }}
            />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="flex -space-x-2">
              {[Brain, Zap, Sparkles].map((Icon, i) => (
                <div key={i} className="w-10 h-10 rounded-full bg-white/15 backdrop-blur flex items-center justify-center border border-white/20">
                  <Icon size={18} className="text-white" />
                </div>
              ))}
            </div>
            <span className="text-sm font-medium text-white/70">v2.0 — Interactive Learning Platform</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-4 max-w-3xl">
            Master{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-300">
              AI, ML, DL
            </span>
            {' '}&amp; Generative AI
          </h1>

          <p className="text-lg md:text-xl text-white/80 max-w-2xl mb-8 leading-relaxed">
            From zero knowledge to AI expert — {totalTopics}+ topics, interactive examples,
            real-world projects, and a structured learning path designed by practitioners.
          </p>

          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => navigate(`/topic/${phases[0].topics[0].id}`)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary-700 rounded-xl font-semibold hover:bg-white/90 transition-all hover:scale-105 active:scale-95 shadow-lg"
            >
              <PlayCircle size={20} />
              Start Learning
            </button>
            <button
              onClick={scrollToRoadmap}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur text-white rounded-xl font-semibold border border-white/20 hover:bg-white/20 transition-all hover:scale-105 active:scale-95"
            >
              <Menu size={20} />
              View Roadmap
            </button>
          </div>
        </motion.div>
      </section>

      {/* ── Stats Bar ── */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {[
          { icon: Layers, label: 'Total Topics', value: totalTopics, suffix: '+', color: 'text-primary-500', bg: 'bg-primary-50 dark:bg-primary-900/20' },
          { icon: BookOpen, label: 'Learning Phases', value: 21, suffix: '', color: 'text-secondary-500', bg: 'bg-secondary-50 dark:bg-secondary-900/20' },
          { icon: Code2, label: 'Interactive Examples', value: 500, suffix: '+', color: 'text-accent-500', bg: 'bg-accent-50 dark:bg-accent-900/20' },
          { icon: Award, label: 'End-to-End Projects', value: 17, suffix: '', color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.4 }}
            className={`${stat.bg} rounded-xl p-5 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow`}
          >
            <div className="flex items-center gap-3 mb-2">
              <stat.icon size={22} className={stat.color} />
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {stat.label}
              </span>
            </div>
            <span className="text-3xl font-extrabold text-gray-900 dark:text-white">
              <Counter value={stat.value} suffix={stat.suffix} />
            </span>
          </motion.div>
        ))}
      </motion.section>

      {/* ── What You'll Learn ── */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <motion.div variants={itemVariants} className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">What You'll Learn</h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            A comprehensive curriculum covering every major domain in modern AI engineering
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {learnCategories.map((cat, i) => (
            <motion.div
              key={i}
              variants={itemVariants}
              whileHover={{ y: -4, scale: 1.01 }}
              className={`${cat.bg} rounded-xl p-5 border border-gray-200 dark:border-gray-700 ${cat.border} transition-all duration-300 cursor-default`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2.5 rounded-lg ${cat.bg}`}>
                  <cat.icon size={22} className={cat.color} />
                </div>
                <span className={`text-xs font-semibold ${cat.color}`}>{cat.count} topics</span>
              </div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">{cat.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{cat.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ── Learning Roadmap ── */}
      <section ref={roadmapRef} className="scroll-mt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">Learning Roadmap</h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            Your structured path from fundamentals to production-ready AI engineering
          </p>
        </motion.div>

        <div className="relative">
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary-500 via-accent-500 to-secondary-500 hidden md:block" />

          <div className="space-y-3">
            {phases.map((phase, idx) => {
              const phaseCompleted = phase.topics.filter((t) => completedTopics.includes(t.id)).length
              const phaseTotal = phase.topics.length
              const isComplete = phaseCompleted === phaseTotal && phaseTotal > 0
              const hasProgress = phaseCompleted > 0 && !isComplete

              return (
                <motion.div
                  key={phase.id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05, duration: 0.4 }}
                >
                  <button
                    onClick={() => {
                      if (phase.topics.length > 0) {
                        setCurrentTopic(phase.topics[0].id)
                        navigate(`/topic/${phase.topics[0].id}`)
                      }
                    }}
                    className="w-full flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-md transition-all group text-left"
                  >
                    {/* Phase number circle */}
                    <div className="relative shrink-0 hidden md:flex items-center justify-center">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${
                        isComplete
                          ? 'bg-secondary-100 dark:bg-secondary-900/30 border-secondary-400 text-secondary-600 dark:text-secondary-400'
                          : hasProgress
                          ? 'bg-primary-100 dark:bg-primary-900/30 border-primary-400 text-primary-600 dark:text-primary-400'
                          : 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400'
                      }`}>
                        {isComplete ? <CheckCircle size={18} /> : idx}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        {isComplete && <CheckCircle size={14} className="text-secondary-500 shrink-0" />}
                        {hasProgress && <Clock size={14} className="text-primary-500 shrink-0" />}
                        {!hasProgress && !isComplete && <Lock size={14} className="text-gray-300 dark:text-gray-600 shrink-0" />}
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 truncate">
                          {phase.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">
                          {phaseCompleted}/{phaseTotal} topics
                        </span>
                        {isComplete && (
                          <span className="text-xs text-secondary-500 font-medium">Completed</span>
                        )}
                        {hasProgress && (
                          <span className="text-xs text-primary-500 font-medium">
                            {Math.round((phaseCompleted / phaseTotal) * 100)}%
                          </span>
                        )}
                        {/* Progress bar */}
                        <div className="hidden sm:block flex-1 max-w-[120px] h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isComplete ? 'bg-secondary-500' : 'bg-primary-500'
                            }`}
                            style={{ width: `${(phaseCompleted / phaseTotal) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <ChevronRight size={16} className="text-gray-300 group-hover:text-primary-500 transition-colors shrink-0" />
                  </button>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Current Progress ── */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">Your Progress</h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Circular progress */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-8 flex flex-col items-center justify-center">
            <div className="relative mb-4">
              <svg width="180" height="180" className="transform -rotate-90">
                <circle
                  cx="90" cy="90" r="80" fill="none"
                  stroke="currentColor" strokeWidth="10"
                  className="text-gray-100 dark:text-gray-800"
                />
                <circle
                  cx="90" cy="90" r="80" fill="none"
                  stroke="currentColor" strokeWidth="10"
                  strokeLinecap="round"
                  className="text-primary-500"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference - (progress / 100) * circumference}
                  style={{ transition: 'stroke-dashoffset 1s ease' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-extrabold text-gray-900 dark:text-white">{progress}%</span>
                <span className="text-sm text-gray-400">complete</span>
              </div>
            </div>

            <div className="flex items-center gap-6 text-center">
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{completedTopics.length}</div>
                <div className="text-xs text-gray-400">Completed</div>
              </div>
              <div className="w-px h-10 bg-gray-200 dark:bg-gray-700" />
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{totalTopics - completedTopics.length}</div>
                <div className="text-xs text-gray-400">Remaining</div>
              </div>
            </div>
          </div>

          {/* Recent activity & continue */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <TrendingUp size={18} className="text-primary-500" />
              Quick Actions
            </h3>

            <button
              onClick={() => navigate(`/topic/${continueTopic}`)}
              className="w-full flex items-center gap-3 p-4 mb-4 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 text-white hover:from-primary-600 hover:to-accent-600 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <PlayCircle size={24} />
              <div className="text-left">
                <div className="font-semibold text-sm">Continue Learning</div>
                <div className="text-xs text-white/70">Pick up where you left off</div>
              </div>
              <ArrowRight size={18} className="ml-auto" />
            </button>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => navigate('/progress')}
                className="flex items-center gap-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
              >
                <BarChart3 size={16} className="text-secondary-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Progress</span>
              </button>
              <button
                onClick={() => navigate('/bookmarks')}
                className="flex items-center gap-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
              >
                <BookmarkCheck size={16} className="text-accent-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Bookmarks</span>
              </button>
              <button
                onClick={() => navigate('/search')}
                className="flex items-center gap-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
              >
                <Target size={16} className="text-primary-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">All Topics</span>
              </button>
              <button
                onClick={() => navigate(`/topic/${phases[0].topics[0].id}`)}
                className="flex items-center gap-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
              >
                <GraduationCap size={16} className="text-orange-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Start Over</span>
              </button>
            </div>

            {/* Phase progress mini bars */}
            <div className="mt-6">
              <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                Phase Progress
              </h4>
              <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                {phases.slice(0, 8).map((phase) => {
                  const c = phase.topics.filter((t) => completedTopics.includes(t.id)).length
                  const t = phase.topics.length
                  return (
                    <div key={phase.id} className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 w-5 shrink-0 text-right">{c}/{t}</span>
                      <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary-400 rounded-full transition-all duration-500"
                          style={{ width: `${(c / t) * 100}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ── Featured Topics ── */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <motion.div variants={itemVariants} className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">Featured Topics</h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            Popular topics to get you started or level up your skills
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {featuredTopics.map((topic, i) => (
            <motion.button
              key={topic.id}
              variants={itemVariants}
              whileHover={{ y: -6, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setCurrentTopic(topic.id)
                navigate(`/topic/${topic.id}`)
              }}
              className="text-left bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-lg transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 rounded-lg bg-primary-50 dark:bg-primary-900/20 group-hover:bg-primary-100 dark:group-hover:bg-primary-900/40 transition-colors">
                  <Brain size={18} className="text-primary-500" />
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${difficultyColors[topic.difficulty]}`}>
                  {topic.difficulty}
                </span>
              </div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                {topic.title}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                {topic.desc}
              </p>
            </motion.button>
          ))}
        </div>
      </motion.section>

      {/* ── Footer ── */}
      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="border-t border-gray-200 dark:border-gray-700 pt-12 pb-8"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Brain size={22} className="text-primary-600 dark:text-primary-400" />
              <span className="text-lg font-bold text-gray-900 dark:text-white">AI Learning Hub</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              Your interactive platform to master AI, machine learning, deep learning,
              and generative AI through a structured, hands-on curriculum.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Quick Links</h4>
            <div className="space-y-2">
              {[
                { label: 'Browse All Topics', path: '/search' },
                { label: 'Track Progress', path: '/progress' },
                { label: 'Bookmarks', path: '/bookmarks' },
                { label: 'Start from Beginning', path: `/topic/${phases[0].topics[0].id}` },
              ].map((link) => (
                <button
                  key={link.label}
                  onClick={() => navigate(link.path)}
                  className="block text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                >
                  {link.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Connect</h4>
            <div className="space-y-2">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                <Github size={16} />
                GitHub
              </a>
              <a
                href="#"
                className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                <Heart size={16} />
                Contribute
              </a>
              <a
                href="#"
                className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                <GraduationCap size={16} />
                About
              </a>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-400">
            Built with{' '}
            <a href="https://react.dev" target="_blank" rel="noopener noreferrer" className="hover:text-primary-500 transition-colors">React</a>
            {' + '}
            <a href="https://www.typescriptlang.org" target="_blank" rel="noopener noreferrer" className="hover:text-primary-500 transition-colors">TypeScript</a>
            {' + '}
            <a href="https://tailwindcss.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary-500 transition-colors">Tailwind CSS</a>
            {' · '}
            <a href="https://vite.dev" target="_blank" rel="noopener noreferrer" className="hover:text-primary-500 transition-colors">Vite</a>
          </p>
          <p className="text-xs text-gray-400">
            MIT License · © {new Date().getFullYear()} AI Learning Hub
          </p>
        </div>
      </motion.footer>
    </div>
  )
}
