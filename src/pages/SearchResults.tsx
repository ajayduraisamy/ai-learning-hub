import { useState, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, SlidersHorizontal, ArrowRight, Clock, Tag, X } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { phases } from '@/data/sidebarData'
import { search, highlightText } from '@/utils/search'

const difficultyColors: Record<string, string> = {
  Beginner: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  Intermediate: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  Advanced: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

const difficultyOrder: Record<string, number> = {
  Beginner: 1, Intermediate: 2, Advanced: 3,
}

export default function SearchResults() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { setCurrentTopic, addRecentSearch } = useStore()
  const urlQuery = searchParams.get('q') || ''

  const [query, setQuery] = useState(urlQuery)
  const [filterPhase, setFilterPhase] = useState('all')
  const [filterDifficulty, setFilterDifficulty] = useState('all')
  const [sortBy, setSortBy] = useState<'relevance' | 'difficulty' | 'duration'>('relevance')
  const [showFilters, setShowFilters] = useState(false)

  const allResults = useMemo(() => search(urlQuery, 200), [urlQuery])

  const filtered = useMemo(() => {
    let r = allResults
    if (filterPhase !== 'all') r = r.filter((item) => item.phaseId === filterPhase)
    if (filterDifficulty !== 'all') r = r.filter((item) => item.difficulty === filterDifficulty)
    if (sortBy === 'difficulty') {
      r = [...r].sort((a, b) => (difficultyOrder[a.difficulty] || 0) - (difficultyOrder[b.difficulty] || 0))
    } else if (sortBy === 'duration') {
      const dur = (t: string) => parseInt(t) || 45
      r = [...r].sort((a, b) => dur(a.estimatedTime) - dur(b.estimatedTime))
    }
    return r
  }, [allResults, filterPhase, filterDifficulty, sortBy])

  const phaseOptions = useMemo(() => {
    return phases.map((p) => ({ id: p.id, title: p.title.replace(/Phase \d+: /, '') }))
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      addRecentSearch(query.trim())
      setSearchParams({ q: query.trim() })
    }
  }

  const handleClick = (topicId: string) => {
    setCurrentTopic(topicId)
    navigate(`/topic/${topicId}`)
  }

  return (
    <div className="max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Search input */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm focus-within:border-primary-400 dark:focus-within:border-primary-600 transition-colors">
            <Search size={20} className="text-gray-400 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search topics, tags, concepts..."
              className="flex-1 bg-transparent outline-none text-base text-gray-900 dark:text-white placeholder-gray-400"
              autoFocus
            />
            {query !== urlQuery && (
              <button
                type="submit"
                className="px-3 py-1.5 bg-primary-500 text-white rounded-lg text-sm font-semibold hover:bg-primary-600 transition-colors shrink-0"
              >
                Search
              </button>
            )}
            {query && (
              <button type="button" onClick={() => { setQuery(''); setSearchParams({}) }} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                <X size={16} className="text-gray-400" />
              </button>
            )}
          </div>
        </form>

        {urlQuery && (
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                {filtered.length > 0
                  ? `Found ${filtered.length} result${filtered.length !== 1 ? 's' : ''}`
                  : 'No results'}
                {urlQuery && (
                  <span className="text-gray-500 dark:text-gray-400 font-normal"> for "<span className="text-gray-700 dark:text-gray-300">{urlQuery}</span>"</span>
                )}
              </h1>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                showFilters || filterPhase !== 'all' || filterDifficulty !== 'all'
                  ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 border border-primary-200 dark:border-primary-800'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 border border-transparent'
              }`}
            >
              <SlidersHorizontal size={14} />
              Filters
              {(filterPhase !== 'all' || filterDifficulty !== 'all') && (
                <span className="w-1.5 h-1.5 rounded-full bg-primary-500" />
              )}
            </button>
          </div>
        )}

        {/* Filters */}
        {showFilters && urlQuery && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 block">Phase</label>
                <select
                  value={filterPhase}
                  onChange={(e) => setFilterPhase(e.target.value)}
                  className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 outline-none focus:border-primary-400"
                >
                  <option value="all">All Phases</option>
                  {phaseOptions.map((p) => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 block">Difficulty</label>
                <select
                  value={filterDifficulty}
                  onChange={(e) => setFilterDifficulty(e.target.value)}
                  className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 outline-none focus:border-primary-400"
                >
                  <option value="all">All Levels</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 block">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 outline-none focus:border-primary-400"
                >
                  <option value="relevance">Relevance</option>
                  <option value="difficulty">Difficulty (Easy first)</option>
                  <option value="duration">Duration (Shortest first)</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}

        {/* Results */}
        {!urlQuery && (
          <div className="text-center py-20">
            <Search size={48} className="text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">Search all topics</h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
              Enter a search term above to find topics across all 22 phases of the AI Learning Hub.
            </p>
          </div>
        )}

        {urlQuery && filtered.length === 0 && (
          <div className="text-center py-16">
            <Search size={48} className="text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">No results found</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {allResults.length > 0
                ? 'Try adjusting your filters to see more results.'
                : 'Try different keywords or check for typos.'}
            </p>
            {allResults.length === 0 && (
              <button
                onClick={() => { setFilterPhase('all'); setFilterDifficulty('all') }}
                className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
              >
                Browse all topics from the sidebar
              </button>
            )}
          </div>
        )}

        {urlQuery && filtered.length > 0 && (
          <div className="space-y-2">
            {filtered.map((r, i) => {
              const segs = highlightText(r.title, urlQuery)
              const phaseShort = r.phaseTitle.replace(/Phase \d+: /, '')
              return (
                <motion.button
                  key={r.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => handleClick(r.id)}
                  className="w-full text-left p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-sm transition-all group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                          {segs.segments.map((seg, j) =>
                            seg.highlighted ? (
                              <mark key={j} className="bg-yellow-200 dark:bg-yellow-700/50 text-gray-900 dark:text-white rounded-sm px-0.5">{seg.text}</mark>
                            ) : (
                              <span key={j}>{seg.text}</span>
                            )
                          )}
                        </h3>
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full shrink-0 ${difficultyColors[r.difficulty] || ''}`}>
                          {r.difficulty}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                        <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                          <Tag size={10} />
                          {phaseShort}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                          <Clock size={10} />
                          {r.estimatedTime}
                        </span>
                        {r.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <ArrowRight size={16} className="text-gray-300 dark:text-gray-600 group-hover:text-primary-500 group-hover:translate-x-0.5 transition-all shrink-0 mt-0.5" />
                  </div>
                </motion.button>
              )
            })}
          </div>
        )}
      </motion.div>
    </div>
  )
}
