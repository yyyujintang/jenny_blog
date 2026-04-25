import { Suspense } from 'react'
import Link from 'next/link'
import { getAllPosts } from '@/lib/posts'
import PostsExplorer from './PostsExplorer'

export default async function Home() {
  const posts = getAllPosts()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* 导航栏 */}
      <nav className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link
              href="/"
              className="text-lg font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Jenny Tang&apos;s Blog
            </Link>
            <div className="flex items-center space-x-6">
              <Link
                href="/"
                className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium"
              >
                Home
              </Link>
              <a
                href="https://yyyujintang.github.io/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium"
              >
                About
              </a>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {/* 欢迎区域 */}
        <header className="mb-10 sm:mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">
            Jenny Tang&apos;s Blog
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300">
            分享技术、研究和生活思考
          </p>
          <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400 mt-1">
            Thoughts on technology, research, and life
          </p>
        </header>

        {posts.length === 0 ? (
          <div className="text-center py-20 text-gray-500 dark:text-gray-400">
            还没有文章，快去写第一篇吧！
          </div>
        ) : (
          <Suspense fallback={<div className="text-gray-400 text-sm">Loading…</div>}>
            <PostsExplorer posts={posts} />
          </Suspense>
        )}
      </main>

      <footer className="border-t border-gray-200 dark:border-gray-800 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-gray-500 dark:text-gray-400 text-sm">
            © {new Date().getFullYear()} Jenny Tang&apos;s Blog. Built with Next.js
          </p>
        </div>
      </footer>
    </div>
  )
}
