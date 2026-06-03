import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Clock, ArrowRight, X } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { search, highlightText, getSearchSuggestions } from '@/utils/search'
import type { SearchResult } from '@/utils/search'

const difficultyColors: Record<string, string> = {
  Beginner: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  Intermediate: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  Advanced: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

interface SearchModalProps {
  open: boolean
  onClose: () => void
}

export default function SearchModal({ open, onClose }: SearchModalProps) {
  const navigate = useNavigate()
  const { addRecentSearch, recentSearches } = useStore()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [activeIdx, setActiveIdx] = useState(-1)
  const [recentSuggestions, setRecentSuggestions] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus()
      setActiveIdx(-1)
    }
  }, [open])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        if (open) onClose()
        else { setQuery(''); onClose() }
      }
      if (e.key === 'Escape' && open) {
        onClose()
        setQuery('')
        setResults([])
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  const doSearch = useCallback((q: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      if (q.trim()) {
        setResults(search(q))
        setRecentSuggestions(getSearchSuggestions(q))
      } else {
        setResults([])
        setRecentSuggestions([])
      }
    }, 150)
  }, [])

  const handleChange = (value: string) => {
    setQuery(value)
    setActiveIdx(-1)
    doSearch(value)
  }

  const handleSelect = (topicId: string, q: string) => {
    if (q.trim()) addRecentSearch(q.trim())
    setQuery('')
    setResults([])
    onClose()
    navigate(`/topic/${topicId}`)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIdx((i) => Math.min(i + 1, results.length + (recentSearches.length && !query ? recentSearches.length - 1 : 0)))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIdx((i) => Math.max(i - 1, -1))
    } else if (e.key === 'Enter' && activeIdx >= 0) {
      e.preventDefault()
      if (!query && activeIdx < recentSearches.length) {
        setQuery(recentSearches[activeIdx])
        doSearch(recentSearches[activeIdx])
      } else if (activeIdx < results.length) {
        handleSelect(results[activeIdx].id, query)
      }
    } else if (e.key === 'Enter' && results.length > 0) {
      handleSelect(results[0].id, query)
    }
  }

  const showRecent = !query.trim() && recentSearches.length > 0

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-[60] flex items-start justify-center pt-[15vh]"
          onClick={(e) => { if (e.target === e.currentTarget) { onClose(); setQuery(''); setResults([]) } }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            className="w-full max-w-xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-200 dark:border-gray-700">
              <Search size={18} className="text-gray-400 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => handleChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search topics, tags, concepts..."
                className="flex-1 bg-transparent outline-none text-base text-gray-900 dark:text-white placeholder-gray-400"
              />
              {query && (
                <button onClick={() => { setQuery(''); setResults([]); setActiveIdx(-1) }} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                  <X size={16} className="text-gray-400" />
                </button>
              )}
              <kbd className="hidden sm:inline-flex text-[10px] px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded font-mono">ESC</kbd>
            </div>

            {showRecent && (
              <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock size={12} />
                    Recent Searches
                  </span>
                  <button onClick={() => useStore.getState().clearRecentSearches()} className="text-[10px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">Clear</button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {recentSearches.slice(0, 8).map((s, i) => (
                    <button
                      key={s}
                      onClick={() => { setQuery(s); doSearch(s); inputRef.current?.focus() }}
                      className={`px-2.5 py-1 rounded-full text-xs border transition-colors ${
                        activeIdx === i
                          ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-300 dark:border-primary-700 text-primary-700 dark:text-primary-300'
                          : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-primary-300 dark:hover:border-primary-700'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {results.length > 0 && (
              <div className="max-h-80 overflow-y-auto">
                <div className="px-4 py-2 text-xs text-gray-400 font-medium">
                  {results.length} result{results.length !== 1 ? 's' : ''}
                </div>
                {results.map((r, i) => {
                  const segs = highlightText(r.title, query)
                  return (
                    <button
                      key={r.id}
                      onClick={() => handleSelect(r.id, query)}
                      onMouseEnter={() => setActiveIdx(i)}
                      className={`w-full text-left px-4 py-3 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-0 ${
                        activeIdx === i ? 'bg-primary-50 dark:bg-primary-900/10' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {segs.segments.map((seg, j) =>
                            seg.highlighted ? (
                              <mark key={j} className="bg-yellow-200 dark:bg-yellow-700/50 text-gray-900 dark:text-white rounded-sm px-0.5">{seg.text}</mark>
                            ) : (
                              <span key={j}>{seg.text}</span>
                            )
                          )}
                        </span>
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full shrink-0 ${difficultyColors[r.difficulty] || ''}`}>
                          {r.difficulty}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-gray-500 dark:text-gray-400">{r.phaseTitle}</span>
                        <span className="text-[10px] text-gray-400">·</span>
                        <span className="text-[10px] text-gray-400">{r.estimatedTime}</span>
                      </div>
                      {r.snippet && r.matchType !== 'title' && (
                        <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1 truncate">{r.snippet}</p>
                      )}
                    </button>
                  )
                })}
                <div className="px-4 py-2.5 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                  <button
                    onClick={() => { handleSelect(results[0].id, query); navigate(`/search?q=${encodeURIComponent(query)}`) }}
                    className="text-xs text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
                  >
                    View all results
                    <ArrowRight size={12} />
                  </button>
                  <span className="text-[10px] text-gray-400">↑↓ navigate · ↵ open</span>
                </div>
              </div>
            )}

            {query.trim() && results.length === 0 && (
              <div className="px-6 py-10 text-center">
                <Search size={36} className="text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">No results for "<span className="font-medium text-gray-700 dark:text-gray-300">{query}</span>"</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">Try different keywords or check for typos</p>
                {recentSuggestions.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-1.5">
                    <span className="text-[10px] text-gray-400 mr-1 self-center">Suggestions:</span>
                    {recentSuggestions.map((s) => (
                      <button
                        key={s}
                        onClick={() => { setQuery(s); doSearch(s) }}
                        className="px-2 py-1 rounded-full text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
