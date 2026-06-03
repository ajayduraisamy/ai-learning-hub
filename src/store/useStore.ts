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
  quizScores: Record<string, number>
  feedback: Record<string, { helpful: boolean; text?: string }>
  achievementDates: Record<string, string>
  toggleComplete: (topicId: string) => void
  toggleBookmark: (topicId: string) => void
  toggleTheme: () => void
  toggleSidebar: () => void
  setCurrentTopic: (topicId: string) => void
  setSearchQuery: (query: string) => void
  addRecentSearch: (query: string) => void
  clearRecentSearches: () => void
  setQuizScore: (topicId: string, score: number) => void
  submitFeedback: (topicId: string, helpful: boolean, text?: string) => void
  earnAchievement: (badgeId: string) => void
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
      quizScores: {},
      feedback: {},
      achievementDates: {},
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
      setQuizScore: (topicId, score) =>
        set((state) => ({
          quizScores: { ...state.quizScores, [topicId]: score },
        })),
      submitFeedback: (topicId, helpful, text) =>
        set((state) => ({
          feedback: { ...state.feedback, [topicId]: { helpful, text } },
        })),
      earnAchievement: (badgeId) =>
        set((state) => {
          if (state.achievementDates[badgeId]) return state
          return {
            achievementDates: {
              ...state.achievementDates,
              [badgeId]: new Date().toISOString(),
            },
          }
        }),
    }),
    {
      name: 'ai-learning-hub-store',
    }
  )
)
