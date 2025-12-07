import Link from 'next/link'
import { getAllPosts } from '@/lib/posts'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'

export default async function Home() {
  const posts = getAllPosts()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* 导航栏 */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-5xl mx-auto px-6 sm:px-8">
          <div className="flex justify-between items-center h-16">
            <Link 
              href="/" 
              className="text-lg font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Jenny&apos;s Blog
            </Link>
            <div className="flex items-center space-x-6">
              <Link 
                href="/" 
                className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium"
              >
                首页
              </Link>
              <Link 
                href="/about" 
                className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium"
              >
                关于
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* 主要内容 */}
      <main className="max-w-5xl mx-auto px-6 sm:px-8 py-12 sm:py-16">
        {/* 欢迎区域 */}
        <div className="mb-16 text-center sm:text-left">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
            Jenny&apos;s Blog
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl">
            分享技术、研究和生活思考
          </p>
        </div>

        {/* 文章列表 */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-8">
            最新文章
          </h2>
          
          {posts.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 dark:text-gray-400">
                还没有文章，快去写第一篇吧！
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <article
                  key={post.slug}
                  className="group bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 sm:p-8 
                           hover:border-blue-500/30 hover:shadow-lg transition-all duration-300"
                >
                  <Link href={`/posts/${post.slug}`} className="block">
                    <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-3 
                                  group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {post.title}
                    </h3>
                  </Link>
                  <p className="text-gray-600 dark:text-gray-400 mb-5 leading-relaxed line-clamp-2">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between flex-wrap gap-3 text-sm">
                    <time 
                      dateTime={post.date}
                      className="text-gray-500 dark:text-gray-400"
                    >
                      {format(new Date(post.date), 'yyyy年MM月dd日', { locale: zhCN })}
                    </time>
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex gap-2 flex-wrap">
                        {post.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 
                                     rounded-full text-xs font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* 页脚 */}
      <footer className="border-t border-[var(--border-color)] mt-20">
        <div className="max-w-5xl mx-auto px-6 sm:px-8 py-8">
          <p className="text-center text-gray-500 dark:text-gray-400 text-sm">
            © {new Date().getFullYear()} Jenny&apos;s Blog. Built with Next.js
          </p>
        </div>
      </footer>
    </div>
  )
}

