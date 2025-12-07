import Link from 'next/link'
import { getAllPosts } from '@/lib/posts'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'

export default async function Home() {
  const posts = getAllPosts()

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* 导航栏 */}
      <nav className="border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-xl font-bold text-gray-900 dark:text-white">
              我的博客
            </Link>
            <div className="flex space-x-4">
              <Link 
                href="/" 
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                首页
              </Link>
              <Link 
                href="/about" 
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                关于
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* 主要内容 */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* 欢迎区域 */}
        <div className="mb-16">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            欢迎来到我的博客
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            分享技术、生活和思考
          </p>
        </div>

        {/* 文章列表 */}
        <div className="space-y-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            最新文章
          </h2>
          
          {posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">
                还没有文章，快去写第一篇吧！
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {posts.map((post) => (
                <article
                  key={post.slug}
                  className="border border-gray-200 dark:border-gray-800 rounded-lg p-6 hover:shadow-lg transition-shadow"
                >
                  <Link href={`/posts/${post.slug}`}>
                    <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2 hover:text-blue-600 dark:hover:text-blue-400">
                      {post.title}
                    </h3>
                  </Link>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-500">
                    <time dateTime={post.date}>
                      {format(new Date(post.date), 'yyyy年MM月dd日', { locale: zhCN })}
                    </time>
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex gap-2">
                        {post.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs"
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
      <footer className="border-t border-gray-200 dark:border-gray-800 mt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-gray-500 dark:text-gray-400 text-sm">
            © {new Date().getFullYear()} 我的博客. 使用 Next.js 构建
          </p>
        </div>
      </footer>
    </div>
  )
}

