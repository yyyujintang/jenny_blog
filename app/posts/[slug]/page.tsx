import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getPostBySlug, getAllPosts } from '@/lib/posts'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export async function generateStaticParams() {
  const posts = getAllPosts()
  return posts.map((post) => ({
    slug: post.slug,
  }))
}

export default async function PostPage({
  params,
}: {
  params: { slug: string }
}) {
  const post = getPostBySlug(params.slug)

  if (!post) {
    notFound()
  }

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

      {/* 文章内容 */}
      <article className="max-w-4xl mx-auto px-6 sm:px-8 py-12 sm:py-16">
        <header className="mb-10">
          <Link
            href="/"
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-6 inline-flex items-center gap-2 text-sm font-medium transition-colors"
          >
            <span>←</span> 返回首页
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-6 tracking-tight">
            {post.title}
          </h1>
          <div className="flex items-center gap-4 flex-wrap text-sm">
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
                             rounded-full text-xs font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </header>

        <div className="prose prose-lg max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {post.content}
          </ReactMarkdown>
        </div>
      </article>

      {/* 页脚 */}
      <footer className="border-t border-gray-200 dark:border-gray-800 mt-20">
        <div className="max-w-5xl mx-auto px-6 sm:px-8 py-8">
          <p className="text-center text-gray-500 dark:text-gray-400 text-sm">
            © {new Date().getFullYear()} Jenny&apos;s Blog. Built with Next.js
          </p>
        </div>
      </footer>
    </div>
  )
}

