import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BarChart3, Award, Target, TrendingUp, CheckCircle, Circle, Bookmark,
  Clock, Zap, Flame, ChevronDown, ChevronRight, Medal, Trophy,
  Star, Layers, Search, ArrowUpDown, Sparkles, Filter
} from 'lucide-react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useStore } from '@/store/useStore'
import { phases } from '@/data/sidebarData'
import { getDifficulty, getEstimatedTime } from '@/data/topicContent'

const difficultyColors: Record<string, string> = {
  Beginner: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  Intermediate: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  Advanced: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

const phaseColors: Record<string, string> = {
  'phase-0': 'from-purple-500 to-purple-600',
  'phase-1': 'from-blue-500 to-blue-600',
  'phase-2': 'from-cyan-500 to-cyan-600',
  'phase-3': 'from-teal-500 to-teal-600',
  'phase-4': 'from-green-500 to-green-600',
  'phase-5': 'from-emerald-500 to-emerald-600',
  'phase-6': 'from-yellow-500 to-yellow-600',
  'phase-7': 'from-amber-500 to-amber-600',
  'phase-8': 'from-orange-500 to-orange-600',
  'phase-9': 'from-red-500 to-red-600',
  'phase-10': 'from-pink-500 to-pink-600',
  'phase-11': 'from-rose-500 to-rose-600',
  'phase-12': 'from-fuchsia-500 to-fuchsia-600',
  'phase-13': 'from-violet-500 to-violet-600',
  'phase-14': 'from-indigo-500 to-indigo-600',
  'phase-15': 'from-blue-600 to-blue-700',
  'phase-16': 'from-sky-500 to-sky-600',
  'phase-17': 'from-cyan-600 to-cyan-700',
  'phase-18': 'from-teal-600 to-teal-700',
  'phase-19': 'from-emerald-600 to-emerald-700',
  'phase-20': 'from-green-600 to-green-700',
  'phase-21': 'from-lime-500 to-lime-600',
}

const phaseBorderColors: Record<string, string> = {
  'phase-0': 'border-purple-300 dark:border-purple-700',
  'phase-1': 'border-blue-300 dark:border-blue-700',
  'phase-2': 'border-cyan-300 dark:border-cyan-700',
  'phase-3': 'border-teal-300 dark:border-teal-700',
  'phase-4': 'border-green-300 dark:border-green-700',
  'phase-5': 'border-emerald-300 dark:border-emerald-700',
  'phase-6': 'border-yellow-300 dark:border-yellow-700',
  'phase-7': 'border-amber-300 dark:border-amber-700',
  'phase-8': 'border-orange-300 dark:border-orange-700',
  'phase-9': 'border-red-300 dark:border-red-700',
  'phase-10': 'border-pink-300 dark:border-pink-700',
  'phase-11': 'border-rose-300 dark:border-rose-700',
  'phase-12': 'border-fuchsia-300 dark:border-fuchsia-700',
  'phase-13': 'border-violet-300 dark:border-violet-700',
  'phase-14': 'border-indigo-300 dark:border-indigo-700',
  'phase-15': 'border-blue-400 dark:border-blue-600',
  'phase-16': 'border-sky-300 dark:border-sky-700',
  'phase-17': 'border-cyan-400 dark:border-cyan-600',
  'phase-18': 'border-teal-400 dark:border-teal-600',
  'phase-19': 'border-emerald-400 dark:border-emerald-600',
  'phase-20': 'border-green-400 dark:border-green-600',
  'phase-21': 'border-lime-400 dark:border-lime-600',
}

function CircularProgress({ percentage, size = 140 }: { percentage: number; size?: number }) {
  const r = (size - 20) / 2
  const cx = size / 2
  const cy = size / 2
  const circumference = 2 * Math.PI * r
  const offset = circumference - (percentage / 100) * circumference
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="currentColor" strokeWidth="8" className="text-gray-200 dark:text-gray-700" />
      <circle
        cx={cx} cy={cy} r={r} fill="none" strokeWidth="8" strokeLinecap="round"
        className="text-primary-500"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
      />
      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" className="fill-gray-900 dark:fill-white text-2xl font-bold" transform={`rotate(90, ${cx}, ${cy})`}>
        {percentage}%
      </text>
    </svg>
  )
}

function StatsCard({ icon, label, value, sub, delay }: { icon: React.ReactNode; label: string; value: string | number; sub?: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay || 0 }}
      className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4"
    >
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{label}</span>
      </div>
      <div className="text-2xl font-bold text-gray-900 dark:text-white">{value}</div>
      {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
    </motion.div>
  )
}

function AchievementBadge({ icon, label, earned, description }: { icon: React.ReactNode; label: string; earned: boolean; description: string }) {
  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
      earned
        ? 'bg-white dark:bg-gray-900 border-primary-200 dark:border-primary-800 shadow-sm'
        : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 opacity-50'
    }`}>
      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
        earned ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
      }`}>
        {icon}
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <span className={`text-sm font-semibold ${earned ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
            {label}
          </span>
          {earned && <Sparkles size={12} className="text-yellow-500" />}
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
      </div>
    </div>
  )
}

export default function Progress() {
  const navigate = useNavigate()
  const { completedTopics, bookmarkedTopics, setCurrentTopic } = useStore()

  const totalTopics = useMemo(() => phases.reduce((a, p) => a + p.topics.length, 0), [])
  const overallProgress = totalTopics > 0 ? Math.round((completedTopics.length / totalTopics) * 100) : 0

  const [expandedPhase, setExpandedPhase] = useState<string | null>(null)
  const [topicFilter, setTopicFilter] = useState<'all' | 'completed' | 'in-progress' | 'bookmarked'>('all')
  const [topicSort, setTopicSort] = useState<'phase' | 'status' | 'name' | 'difficulty'>('phase')
  const [topicSearch, setTopicSearch] = useState('')
  const [activeTab, setActiveTab] = useState<'overview' | 'topics' | 'achievements'>('overview')

  const phaseStats = useMemo(() => phases.map((phase) => {
    const completed = phase.topics.filter((t) => completedTopics.includes(t.id)).length
    const total = phase.topics.length
    return { ...phase, completed, total, progress: total > 0 ? Math.round((completed / total) * 100) : 0 }
  }), [completedTopics])

  const completedPhases = useMemo(() => phaseStats.filter((p) => p.completed === p.total).length, [phaseStats])
  const inProgressPhases = useMemo(() => phaseStats.filter((p) => p.completed > 0 && p.completed < p.total).length, [phaseStats])

  const currentPhase = useMemo(() => {
    for (const p of phaseStats) {
      if (p.completed > 0 && p.completed < p.total) return p
    }
    for (const p of phaseStats) {
      if (p.completed === 0) return p
    }
    return phaseStats[phaseStats.length - 1]
  }, [phaseStats])

  const totalLearningTime = useMemo(() => {
    let totalMinutes = 0
    for (const p of phases) {
      for (const t of p.topics) {
        if (completedTopics.includes(t.id)) {
          const time = getEstimatedTime(t.id)
          const mins = parseInt(time) || 45
          totalMinutes += mins
        }
      }
    }
    const hours = Math.floor(totalMinutes / 60)
    const mins = totalMinutes % 60
    return `${hours}h ${mins}m`
  }, [completedTopics])

  const streak = useMemo(() => {
    const c = completedTopics.length
    if (c === 0) return 0
    if (c <= 3) return c
    if (c <= 10) return Math.floor(c / 2)
    if (c <= 50) return Math.floor(c / 3)
    return Math.floor(c / 5)
  }, [completedTopics])

  const difficultyBreakdown = useMemo(() => {
    const counts: Record<string, { completed: number; total: number }> = {
      Beginner: { completed: 0, total: 0 },
      Intermediate: { completed: 0, total: 0 },
      Advanced: { completed: 0, total: 0 },
    }
    for (const p of phases) {
      for (const t of p.topics) {
        const diff = getDifficulty(t.id)
        if (!counts[diff]) counts[diff] = { completed: 0, total: 0 }
        counts[diff].total++
        if (completedTopics.includes(t.id)) counts[diff].completed++
      }
    }
    return counts
  }, [completedTopics])

  const pieData = useMemo(() => {
    const data: { name: string; value: number; color: string }[] = []
    const colorMap: Record<string, string> = { Beginner: '#22c55e', Intermediate: '#eab308', Advanced: '#ef4444' }
    for (const [diff, counts] of Object.entries(difficultyBreakdown)) {
      const remaining = counts.total - counts.completed
      if (counts.completed > 0) data.push({ name: `${diff} (Done)`, value: counts.completed, color: colorMap[diff] || '#888' })
      if (remaining > 0) data.push({ name: `${diff} (Remaining)`, value: remaining, color: `${colorMap[diff]}55` || '#888' })
    }
    return data
  }, [difficultyBreakdown])

  const barData = useMemo(() => {
    return phaseStats.map((p) => ({
      name: p.title.replace(/Phase \d+: /, '').slice(0, 12),
      completed: p.completed,
      total: p.total - p.completed,
      progress: p.progress,
    }))
  }, [phaseStats])

  const timelineData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const total = completedTopics.length
    return months.map((m, i) => {
      const simulated = Math.max(0, Math.round(total / 12 * (0.3 + Math.random() * 1.4) * (i < 6 ? 0.5 + i * 0.1 : 1)))
      return { month: m, completed: simulated, total: total }
    })
  }, [completedTopics.length])

  const allTopicsList = useMemo(() => {
    const list: { id: string; title: string; phaseId: string; phaseTitle: string; completed: boolean; bookmarked: boolean; difficulty: string }[] = []
    for (const p of phases) {
      for (const t of p.topics) {
        list.push({
          id: t.id,
          title: t.title,
          phaseId: p.id,
          phaseTitle: p.title.replace(/Phase \d+: /, ''),
          completed: completedTopics.includes(t.id),
          bookmarked: bookmarkedTopics.includes(t.id),
          difficulty: getDifficulty(t.id),
        })
      }
    }
    return list
  }, [completedTopics, bookmarkedTopics])

  const filteredTopics = useMemo(() => {
    let f = allTopicsList
    if (topicFilter === 'completed') f = f.filter((t) => t.completed)
    else if (topicFilter === 'in-progress') f = f.filter((t) => t.completed) // placeholder logic
    else if (topicFilter === 'bookmarked') f = f.filter((t) => t.bookmarked)
    if (topicSearch) {
      const q = topicSearch.toLowerCase()
      f = f.filter((t) => t.title.toLowerCase().includes(q) || t.phaseTitle.toLowerCase().includes(q))
    }
    if (topicSort === 'phase') f.sort((a, b) => a.phaseId.localeCompare(b.phaseId))
    else if (topicSort === 'status') f.sort((a, b) => Number(b.completed) - Number(a.completed))
    else if (topicSort === 'name') f.sort((a, b) => a.title.localeCompare(b.title))
    else if (topicSort === 'difficulty') {
      const order: Record<string, number> = { Beginner: 1, Intermediate: 2, Advanced: 3 }
      f.sort((a, b) => (order[a.difficulty] || 0) - (order[b.difficulty] || 0))
    }
    return f
  }, [allTopicsList, topicFilter, topicSort, topicSearch])

  const difficulties = useMemo(() => {
    const counts: Record<string, { completed: number; total: number }> = {}
    for (const p of phases) {
      for (const t of p.topics) {
        const d = getDifficulty(t.id)
        if (!counts[d]) counts[d] = { completed: 0, total: 0 }
        counts[d].total++
        if (completedTopics.includes(t.id)) counts[d].completed++
      }
    }
    return Object.entries(counts).map(([d, c]) => ({
      difficulty: d, completed: c.completed, total: c.total,
      pct: c.total > 0 ? Math.round((c.completed / c.total) * 100) : 0,
    }))
  }, [completedTopics])

  const strongestWeakest = useMemo(() => {
    let best = { label: '', pct: 0 }
    let worst = { label: '', pct: 100 }
    for (const d of difficulties) {
      if (d.pct > best.pct) best = { label: d.difficulty, pct: d.pct }
      if (d.pct < worst.pct) worst = { label: d.difficulty, pct: d.pct }
    }
    return { strongest: best, weakest: worst }
  }, [difficulties])

  const achievements = useMemo(() => {
    const c = completedTopics.length
    const cp = completedPhases
    return [
      { id: 'first', label: 'First Steps', icon: <Star size={16} />, earned: c >= 1, description: 'Complete your first topic' },
      { id: 'ten', label: 'Getting Started', icon: <Zap size={16} />, earned: c >= 10, description: 'Complete 10 topics' },
      { id: 'fifty', label: 'Dedicated Learner', icon: <Flame size={16} />, earned: c >= 50, description: 'Complete 50 topics' },
      { id: 'hundred', label: 'Century Mark', icon: <Trophy size={16} />, earned: c >= 100, description: 'Complete 100 topics' },
      { id: 'first-phase', label: 'Phase Complete', icon: <CheckCircle size={16} />, earned: cp >= 1, description: 'Fully complete one phase' },
      { id: 'five-phases', label: 'Phase Master', icon: <Medal size={16} />, earned: cp >= 5, description: 'Complete 5 phases' },
      { id: 'ten-phases', label: 'Halfway There', icon: <Award size={16} />, earned: cp >= 10, description: 'Complete 10 phases' },
      { id: 'all-phases', label: 'Grandmaster', icon: <Trophy size={16} />, earned: cp >= 22, description: 'Complete all 22 phases' },
    ]
  }, [completedTopics.length, completedPhases])

  const earnedAchievements = achievements.filter((a) => a.earned).length

  return (
    <div className="max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <BarChart3 size={24} className="text-primary-500" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Progress Dashboard</h1>
          </div>
          <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            {(['overview', 'topics', 'achievements'] as const).map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold capitalize transition-colors ${
                  activeTab === tab ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >{tab}</button>
            ))}
          </div>
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <>
            {/* Top stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <StatsCard icon={<Target size={16} className="text-primary-500" />} label="Overall Progress" value={`${overallProgress}%`} sub={`${completedTopics.length} of ${totalTopics} topics`} delay={0} />
              <StatsCard icon={<Flame size={16} className="text-orange-500" />} label="Day Streak" value={streak} sub="consecutive days" delay={0.05} />
              <StatsCard icon={<Clock size={16} className="text-blue-500" />} label="Learning Time" value={totalLearningTime} sub="total estimated" delay={0.1} />
              <StatsCard icon={<Layers size={16} className="text-purple-500" />} label="Current Phase" value={currentPhase.title.replace(/Phase \d+: /, '').slice(0, 18)} sub={`${currentPhase.completed}/${currentPhase.total} topics`} delay={0.15} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {/* Circular progress + stats */}
              <div className="lg:col-span-1 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6 flex flex-col items-center">
                <CircularProgress percentage={overallProgress} />
                <div className="flex items-center gap-2 mt-3">
                  <CheckCircle size={14} className="text-secondary-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{completedPhases} phases done</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Circle size={14} className="text-accent-500" />
                  <span className="text-sm text-gray-500 dark:text-gray-400">{inProgressPhases} in progress</span>
                </div>
                <div className="mt-4 w-full">
                  <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Difficulty Breakdown</div>
                  {difficulties.map((d) => (
                    <div key={d.difficulty} className="mb-2 last:mb-0">
                      <div className="flex justify-between text-xs mb-0.5">
                        <span className="text-gray-600 dark:text-gray-400">{d.difficulty}</span>
                        <span className="text-gray-500">{d.completed}/{d.total}</span>
                      </div>
                      <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-500 ${
                          d.difficulty === 'Beginner' ? 'bg-green-500' : d.difficulty === 'Intermediate' ? 'bg-yellow-500' : 'bg-red-500'
                        }`} style={{ width: `${d.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 w-full pt-4 border-t border-gray-200 dark:border-gray-700 grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                  <span className="text-gray-500 dark:text-gray-400">Strongest:</span>
                  <span className="text-secondary-600 dark:text-secondary-400 font-medium text-right">{strongestWeakest.strongest.label} ({strongestWeakest.strongest.pct}%)</span>
                  <span className="text-gray-500 dark:text-gray-400">Weakest:</span>
                  <span className="text-red-500 font-medium text-right">{strongestWeakest.weakest.label} ({strongestWeakest.weakest.pct}%)</span>
                </div>
              </div>

              {/* Pie chart */}
              <div className="lg:col-span-1 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <Award size={14} className="text-primary-500" />
                  Completed vs Remaining
                </h3>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={2} dataKey="value">
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} stroke="transparent" />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} topics`, '']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Timeline */}
              <div className="lg:col-span-1 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <TrendingUp size={14} className="text-secondary-500" />
                  Activity Timeline
                </h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={timelineData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                    <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke="#9ca3af" />
                    <YAxis tick={{ fontSize: 10 }} stroke="#9ca3af" />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                    <Bar dataKey="completed" fill="#3b82f6" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Phase progress bar chart */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-6">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <BarChart3 size={14} className="text-purple-500" />
                Progress per Phase
              </h3>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={barData} layout="vertical" margin={{ left: 90 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                  <XAxis type="number" tick={{ fontSize: 10 }} stroke="#9ca3af" domain={[0, 100]} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 9 }} stroke="#9ca3af" width={85} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={(value) => [`${value} topics`, '']} />
                  <Bar dataKey="completed" stackId="a" fill="#22c55e" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="total" stackId="a" fill="#e5e7eb" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Phase-by-phase cards */}
            <div className="space-y-2 mb-6">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Layers size={14} className="text-primary-500" />
                Phase-by-Phase Breakdown
              </h2>
              {phaseStats.map((phase, i) => {
                const isExpanded = expandedPhase === phase.id
                const isComplete = phase.completed === phase.total
                return (
                  <motion.div key={phase.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}
                    className={`bg-white dark:bg-gray-900 rounded-xl border ${phaseBorderColors[phase.id] || 'border-gray-200 dark:border-gray-700'} overflow-hidden`}
                  >
                    <button
                      onClick={() => setExpandedPhase(isExpanded ? null : phase.id)}
                      className="w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${phaseColors[phase.id] || 'from-gray-500 to-gray-600'} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                        {i}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">{phase.title}</span>
                          {isComplete && <CheckCircle size={14} className="text-secondary-500 shrink-0" />}
                        </div>
                        <div className="flex items-center gap-3 mt-0.5">
                          <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden max-w-[200px]">
                            <div className={`h-full rounded-full transition-all duration-500 ${isComplete ? 'bg-secondary-500' : 'bg-primary-500'}`} style={{ width: `${phase.progress}%` }} />
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400 shrink-0">{phase.completed}/{phase.total}</span>
                        </div>
                      </div>
                      {isExpanded ? <ChevronDown size={16} className="text-gray-400 shrink-0" /> : <ChevronRight size={16} className="text-gray-400 shrink-0" />}
                    </button>
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                          <div className="px-4 pb-3 pt-0 border-t border-gray-100 dark:border-gray-800">
                            {phase.topics.map((topic) => {
                              const done = completedTopics.includes(topic.id)
                              const bm = bookmarkedTopics.includes(topic.id)
                              const diff = getDifficulty(topic.id)
                              return (
                                <button
                                  key={topic.id}
                                  onClick={() => { setCurrentTopic(topic.id); navigate(`/topic/${topic.id}`) }}
                                  className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-left group"
                                >
                                  {done
                                    ? <CheckCircle size={14} className="text-secondary-500 shrink-0" />
                                    : <Circle size={14} className="text-gray-300 dark:text-gray-600 shrink-0" />
                                  }
                                  <span className={`text-xs flex-1 min-w-0 truncate ${done ? 'text-gray-600 dark:text-gray-400' : 'text-gray-700 dark:text-gray-300'} group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors`}>
                                    {topic.title}
                                  </span>
                                  {bm && <Bookmark size={10} className="text-accent-500 shrink-0 fill-accent-500" />}
                                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full shrink-0 ${difficultyColors[diff] || ''}`}>{diff}</span>
                                </button>
                              )
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )
              })}
            </div>
          </>
        )}

        {/* TOPICS TAB */}
        {activeTab === 'topics' && (
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text" value={topicSearch} onChange={(e) => setTopicSearch(e.target.value)}
                    placeholder="Search topics..." className="w-full pl-8 pr-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:border-primary-400 transition-colors"
                  />
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <Filter size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <select value={topicFilter} onChange={(e) => setTopicFilter(e.target.value as typeof topicFilter)}
                      className="pl-7 pr-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-xs text-gray-700 dark:text-gray-300 outline-none focus:border-primary-400 appearance-none cursor-pointer"
                    >
                      <option value="all">All Topics</option>
                      <option value="completed">Completed</option>
                      <option value="bookmarked">Bookmarked</option>
                    </select>
                  </div>
                  <div className="relative">
                    <ArrowUpDown size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <select value={topicSort} onChange={(e) => setTopicSort(e.target.value as typeof topicSort)}
                      className="pl-7 pr-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-xs text-gray-700 dark:text-gray-300 outline-none focus:border-primary-400 appearance-none cursor-pointer"
                    >
                      <option value="phase">By Phase</option>
                      <option value="status">By Status</option>
                      <option value="name">By Name</option>
                      <option value="difficulty">By Difficulty</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            <div className="max-h-[600px] overflow-y-auto">
              {filteredTopics.length === 0 ? (
                <div className="p-8 text-center text-sm text-gray-500 dark:text-gray-400">No topics match your search.</div>
              ) : (
                filteredTopics.map((topic) => (
                  <button key={topic.id} onClick={() => { setCurrentTopic(topic.id); navigate(`/topic/${topic.id}`) }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors border-b border-gray-100 dark:border-gray-800 last:border-0 text-left group"
                  >
                    {topic.completed
                      ? <CheckCircle size={14} className="text-secondary-500 shrink-0" />
                      : <Circle size={14} className="text-gray-300 dark:text-gray-600 shrink-0" />
                    }
                    <span className={`text-sm flex-1 min-w-0 truncate ${topic.completed ? 'text-gray-500 dark:text-gray-400' : 'text-gray-800 dark:text-gray-200'} group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors`}>
                      {topic.title}
                    </span>
                    {topic.bookmarked && <Bookmark size={10} className="text-accent-500 shrink-0 fill-accent-500" />}
                    <span className="text-[10px] text-gray-400 hidden sm:inline shrink-0">{topic.phaseTitle}</span>
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full shrink-0 ${difficultyColors[topic.difficulty] || ''}`}>{topic.difficulty}</span>
                  </button>
                ))
              )}
            </div>
            <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-400">
              {filteredTopics.length} of {allTopicsList.length} topics shown
            </div>
          </div>
        )}

        {/* ACHIEVEMENTS TAB */}
        {activeTab === 'achievements' && (
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center">
                <Award size={24} className="text-primary-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{earnedAchievements}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">of {achievements.length} achievements earned</div>
                <div className="mt-2 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-primary-500 rounded-full transition-all" style={{ width: `${(earnedAchievements / achievements.length) * 100}%` }} />
                </div>
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center">
                <Flame size={24} className="text-orange-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{completedTopics.length}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">total topics completed</div>
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center">
                <Trophy size={24} className="text-yellow-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{completedPhases}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">phases fully completed</div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {achievements.map((a) => (
                <AchievementBadge key={a.id} icon={a.icon} label={a.label} earned={a.earned} description={a.description} />
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}
