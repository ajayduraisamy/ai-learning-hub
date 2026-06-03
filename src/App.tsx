import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from '@/components/Layout'
import Home from '@/pages/Home'
import NotFound from '@/pages/NotFound'
import ErrorBoundary from '@/components/ErrorBoundary'
import { ToastProvider } from '@/components/Toast'

const TopicPage = lazy(() => import('@/pages/TopicPage'))
const SearchResults = lazy(() => import('@/pages/SearchResults'))
const Bookmarks = lazy(() => import('@/pages/Bookmarks'))
const Progress = lazy(() => import('@/pages/Progress'))
const PlaygroundPage = lazy(() => import('@/pages/PlaygroundPage'))

function Spinner() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <BrowserRouter>
          <Layout>
            <Suspense fallback={<Spinner />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/topic/:topicId" element={<TopicPage />} />
                <Route path="/search" element={<SearchResults />} />
                <Route path="/bookmarks" element={<Bookmarks />} />
                <Route path="/progress" element={<Progress />} />
                <Route path="/playground" element={<PlaygroundPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </Layout>
        </BrowserRouter>
      </ToastProvider>
    </ErrorBoundary>
  )
}
