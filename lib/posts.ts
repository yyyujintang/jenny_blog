import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const postsDirectory = path.join(process.cwd(), 'content/posts')
const LANG_EN_MARKER = '<!-- LANG:EN -->'

export type PostKind = 'ai' | 'human'

export interface Post {
  slug: string
  title: string
  date: string                // blog publish date (drives listing sort)
  paperDate?: string          // arxiv / venue date
  excerpt: string
  excerptEn?: string
  content: string
  contentZh: string
  contentEn?: string
  tags?: string[]
  kind: PostKind              // 'ai' = auto_generated paper note, 'human' = hand-written
  category: string            // top-level topic, e.g. "Agent Memory", "Vibe Coding"
  paperVenue?: string
  paperAuthors?: string
  paperLink?: string
  paperCode?: string
}

function splitBilingual(raw: string): { zh: string; en?: string } {
  const idx = raw.indexOf(LANG_EN_MARKER)
  if (idx === -1) return { zh: raw.trim() }
  return {
    zh: raw.slice(0, idx).trim(),
    en: raw.slice(idx + LANG_EN_MARKER.length).trim() || undefined,
  }
}

function normalizeDate(d: unknown): string {
  if (!d) return new Date().toISOString().slice(0, 10)
  if (d instanceof Date) return d.toISOString().slice(0, 10)
  return String(d)
}

function buildPost(slug: string, raw: string): Post {
  const { data, content } = matter(raw)
  const { zh, en } = splitBilingual(content)
  return {
    slug,
    title: data.title || 'Untitled',
    date: normalizeDate(data.date),
    paperDate: data.paper_date ? normalizeDate(data.paper_date) : undefined,
    excerpt: data.excerpt || zh.substring(0, 150) + '...',
    excerptEn: data.excerpt_en || undefined,
    content: zh,
    contentZh: zh,
    contentEn: en,
    tags: data.tags || [],
    kind: data.auto_generated === true ? 'ai' : 'human',
    category: typeof data.category === 'string' && data.category.trim() ? data.category.trim() : 'Agent Memory',
    paperVenue: data.paper_venue || undefined,
    paperAuthors: data.paper_authors || undefined,
    paperLink: data.paper_link || undefined,
    paperCode: data.paper_code || undefined,
  }
}

export function getAllPosts(): Post[] {
  if (!fs.existsSync(postsDirectory)) return []

  const fileNames = fs.readdirSync(postsDirectory)
  const posts = fileNames
    .filter((fileName) => fileName.endsWith('.mdx'))
    .map((fileName) => {
      const slug = fileName.replace(/\.mdx$/, '')
      const raw = fs.readFileSync(path.join(postsDirectory, fileName), 'utf8')
      return buildPost(slug, raw)
    })

  return posts.sort((a, b) => {
    if (a.date !== b.date) return a.date < b.date ? 1 : -1
    const ad = a.paperDate || ''
    const bd = b.paperDate || ''
    return ad < bd ? 1 : ad > bd ? -1 : 0
  })
}

export function getPostBySlug(slug: string): Post | null {
  const fullPath = path.join(postsDirectory, `${slug}.mdx`)
  if (!fs.existsSync(fullPath)) return null
  return buildPost(slug, fs.readFileSync(fullPath, 'utf8'))
}
