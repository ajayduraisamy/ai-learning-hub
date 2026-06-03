import { useEffect } from 'react'
import { useStore } from '@/store/useStore'
import Navbar from '@/components/Navbar'
import Sidebar from '@/components/Sidebar'
import MainContent from '@/components/MainContent'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const { theme } = useStore()

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <Navbar />
      <Sidebar />
      <MainContent>{children}</MainContent>
    </div>
  )
}
