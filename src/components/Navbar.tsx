import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Brain, Search, Moon, Sun, ExternalLink, Menu, X } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { phases } from '@/data/sidebarData'

export default function Navbar() {
  const navigate = useNavigate()
  const { theme, toggleTheme, searchQuery, setSearchQuery, completedTopics, sidebarCollapsed, toggleSidebar } = useStore()
  const [searchOpen, setSearchOpen] = useState(false)
  const [results, setResults] = useState<{ id: string; title: string; phaseTitle: string }[]>([])
  const searchRef = useRef<HTMLInputElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)

  const totalTopics = phases.reduce((acc, p) => acc + p.topics.length, 0)
  const progress = totalTopics > 0 ? Math.round((completedTopics.length / totalTopics) * 100) : 0

  useEffect(() => {
    if (searchOpen && searchRef.current) {
      searchRef.current.focus()
    }
  }, [searchOpen])

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSearchOpen(false)
        setSearchQuery('')
      }
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [setSearchQuery])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setSearchOpen(false)
        setSearchQuery('')
      }
    }
    if (searchOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [searchOpen, setSearchQuery])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (query.trim()) {
      const allTopics = phases.flatMap((p) =>
        p.topics.map((t) => ({ ...t, phaseTitle: p.title }))
      )
      const filtered = allTopics.filter(
        (t) =>
          t.title.toLowerCase().includes(query.toLowerCase()) ||
          t.id.toLowerCase().includes(query.toLowerCase())
      )
      setResults(filtered.slice(0, 10))
    } else {
      setResults([])
    }
  }

  const handleSelect = (topicId: string) => {
    setSearchOpen(false)
    setSearchQuery('')
    navigate(`/topic/${topicId}`)
  }

  const circumference = 2 * Math.PI * 14

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 z-50 flex items-center px-4 gap-4">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors lg:hidden"
          aria-label="Toggle sidebar"
        >
          {sidebarCollapsed ? <Menu size={20} /> : <X size={20} />}
        </button>

        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 shrink-0"
        >
          <Brain className="text-primary-600 dark:text-primary-400" size={28} />
          <span className="text-lg font-bold text-gray-900 dark:text-white hidden sm:inline">
            AI Learning Hub
          </span>
        </button>

        <div className="flex-1 max-w-md mx-auto">
          <button
            onClick={() => setSearchOpen(true)}
            className="w-full flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-500 dark:text-gray-400 text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <Search size={16} />
            <span>Search topics...</span>
            <span className="ml-auto text-xs px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">Ctrl+K</span>
          </button>
        </div>

        <div className="relative group">
          <svg width="36" height="36" className="transform -rotate-90">
            <circle cx="18" cy="18" r="14" fill="none" stroke="currentColor" strokeWidth="3" className="text-gray-200 dark:text-gray-700" />
            <circle
              cx="18"
              cy="18"
              r="14"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              className="text-primary-500 transition-all duration-500"
              strokeDasharray={circumference}
              strokeDashoffset={circumference - (progress / 100) * circumference}
              strokeLinecap="round"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-gray-700 dark:text-gray-300">
            {progress}
          </span>
          <div className="absolute top-full right-0 mt-2 px-3 py-1.5 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            {completedTopics.length} / {totalTopics} completed
          </div>
        </div>

        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-gray-600" />}
        </button>

        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="GitHub"
        >
          <ExternalLink size={20} className="text-gray-600 dark:text-gray-400" />
        </a>

        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors hidden lg:block"
          aria-label="Toggle sidebar"
        >
          <Menu size={20} className="text-gray-600 dark:text-gray-400" />
        </button>
      </nav>

      {searchOpen && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-start justify-center pt-20">
          <div
            ref={modalRef}
            className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden"
          >
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <Search size={18} className="text-gray-400" />
              <input
                ref={searchRef}
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search topics..."
                className="flex-1 bg-transparent outline-none text-gray-900 dark:text-white placeholder-gray-400"
              />
              <button
                onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
                className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                ESC
              </button>
            </div>
            {results.length > 0 && (
              <div className="max-h-80 overflow-y-auto">
                {results.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => handleSelect(r.id)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-0"
                  >
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{r.title}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{r.phaseTitle}</div>
                  </button>
                ))}
              </div>
            )}
            {searchQuery && results.length === 0 && (
              <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400 text-sm">
                No topics found for "{searchQuery}"
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
