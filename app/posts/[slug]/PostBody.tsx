'use client'

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

type Lang = 'zh' | 'en'

export default function PostBody({
  zh,
  en,
}: {
  zh: string
  en?: string
}) {
  const hasEn = !!en && en.trim().length > 0
  const [lang, setLang] = useState<Lang>('zh')
  const body = lang === 'en' && hasEn ? (en as string) : zh

  return (
    <div>
      {hasEn && (
        <div className="mb-8 inline-flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden text-sm">
          <button
            type="button"
            onClick={() => setLang('zh')}
            className={
              'px-4 py-1.5 font-medium transition-colors ' +
              (lang === 'zh'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800')
            }
            aria-pressed={lang === 'zh'}
          >
            中文
          </button>
          <button
            type="button"
            onClick={() => setLang('en')}
            className={
              'px-4 py-1.5 font-medium transition-colors border-l border-gray-200 dark:border-gray-700 ' +
              (lang === 'en'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800')
            }
            aria-pressed={lang === 'en'}
          >
            English
          </button>
        </div>
      )}

      <div className="prose prose-lg max-w-none dark:prose-invert">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{body}</ReactMarkdown>
      </div>
    </div>
  )
}
