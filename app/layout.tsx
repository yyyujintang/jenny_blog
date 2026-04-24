import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: "Jenny Tang's Blog",
  description: '分享技术、研究和生活思考 · Thoughts on technology, research, and life',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  )
}

