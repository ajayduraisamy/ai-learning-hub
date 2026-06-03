import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface Topic {
  id: string
  title: string
}

export interface Phase {
  id: string
  title: string
  topics: Topic[]
}

interface AppState {
  currentTopic: string
  completedTopics: string[]
  bookmarkedTopics: string[]
  theme: 'light' | 'dark'
  sidebarCollapsed: boolean
  searchQuery: string
  recentSearches: string[]
  toggleComplete: (topicId: string) => void
  toggleBookmark: (topicId: string) => void
  toggleTheme: () => void
  toggleSidebar: () => void
  setCurrentTopic: (topicId: string) => void
  setSearchQuery: (query: string) => void
  addRecentSearch: (query: string) => void
  clearRecentSearches: () => void
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      currentTopic: '',
      completedTopics: [],
      bookmarkedTopics: [],
      theme: 'light',
      sidebarCollapsed: false,
      searchQuery: '',
      recentSearches: [],
      toggleComplete: (topicId) =>
        set((state) => ({
          completedTopics: state.completedTopics.includes(topicId)
            ? state.completedTopics.filter((id) => id !== topicId)
            : [...state.completedTopics, topicId],
        })),
      toggleBookmark: (topicId) =>
        set((state) => ({
          bookmarkedTopics: state.bookmarkedTopics.includes(topicId)
            ? state.bookmarkedTopics.filter((id) => id !== topicId)
            : [...state.bookmarkedTopics, topicId],
        })),
      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === 'light' ? 'dark' : 'light',
        })),
      toggleSidebar: () =>
        set((state) => ({
          sidebarCollapsed: !state.sidebarCollapsed,
        })),
      setCurrentTopic: (topicId) =>
        set({ currentTopic: topicId }),
      setSearchQuery: (query) =>
        set({ searchQuery: query }),
      addRecentSearch: (query) =>
        set((state) => {
          const filtered = state.recentSearches.filter((s) => s !== query)
          return { recentSearches: [query, ...filtered].slice(0, 10) }
        }),
      clearRecentSearches: () =>
        set({ recentSearches: [] }),
    }),
    {
      name: 'ai-learning-hub-store',
    }
  )
)
