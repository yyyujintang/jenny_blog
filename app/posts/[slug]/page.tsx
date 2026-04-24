import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getPostBySlug, getAllPosts } from '@/lib/posts'
import { format } from 'date-fns'
import PostBody from './PostBody'

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

  const meta: Array<{ label: string; href?: string }> = []
  if (post.paperVenue) meta.push({ label: post.paperVenue })
  if (post.paperAuthors) meta.push({ label: post.paperAuthors })
  if (post.paperLink) meta.push({ label: 'arxiv', href: post.paperLink })
  if (post.paperCode) meta.push({ label: 'code', href: post.paperCode })

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
              title="Blog publish date"
            >
              📝 {format(new Date(post.date), 'yyyy MMM d')}
            </time>
            {post.paperDate && (
              <time
                dateTime={post.paperDate}
                className="text-gray-500 dark:text-gray-400"
                title="arxiv / venue date"
              >
                📄 {format(new Date(post.paperDate), 'yyyy MMM d')}
              </time>
            )}
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

          {meta.length > 0 && (
            <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-600 dark:text-gray-400">
              {meta.map((m, i) => (
                <span key={i} className="inline-flex items-center gap-3">
                  {i > 0 && <span aria-hidden="true">·</span>}
                  {m.href ? (
                    <a
                      href={m.href}
                      target="_blank"
                      rel="noopener"
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {m.label}
                    </a>
                  ) : (
                    <span>{m.label}</span>
                  )}
                </span>
              ))}
            </div>
          )}
        </header>

        <PostBody zh={post.contentZh} en={post.contentEn} />
      </article>

      {/* 页脚 */}
      <footer className="border-t border-gray-200 dark:border-gray-800 mt-20">
        <div className="max-w-5xl mx-auto px-6 sm:px-8 py-8">
          <p className="text-center text-gray-500 dark:text-gray-400 text-sm">
            © {new Date().getFullYear()} Jenny Tang&apos;s Blog. Built with Next.js
          </p>
        </div>
      </footer>
    </div>
  )
}
