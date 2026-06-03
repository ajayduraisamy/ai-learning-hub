import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from '@/components/Layout'
import Home from '@/pages/Home'
import TopicPage from '@/pages/TopicPage'
import SearchResults from '@/pages/SearchResults'
import Bookmarks from '@/pages/Bookmarks'
import Progress from '@/pages/Progress'
import NotFound from '@/pages/NotFound'

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/topic/:topicId" element={<TopicPage />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/bookmarks" element={<Bookmarks />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
