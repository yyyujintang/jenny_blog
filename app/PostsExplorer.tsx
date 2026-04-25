'use client'

import Link from 'next/link'
import { format } from 'date-fns'
import { useEffect, useMemo, useState, useCallback } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import type { Post, PostKind } from '@/lib/posts'

// ----------------------------------------------------------------------
// Kind (zone) — AI-generated vs hand-written
// ----------------------------------------------------------------------
type KindFilter = 'all' | PostKind
const KIND_OPTIONS: { key: KindFilter; label: string; icon: string }[] = [
  { key: 'all', label: 'All', icon: '✦' },
  { key: 'ai', label: 'AI-Generated', icon: '🤖' },
  { key: 'human', label: 'Hand-written', icon: '✍️' },
]

// ----------------------------------------------------------------------
// Tag taxonomy (mirrors scripts/tag_papers.py controlled vocabulary)
// ----------------------------------------------------------------------
type TagGroupKey = 'category' | 'benchmark_type' | 'storage' | 'learning' | 'memory_type'

const TAG_GROUPS: { key: TagGroupKey; label: string; values: string[] }[] = [
  { key: 'category', label: 'Category', values: ['Method', 'Benchmark', 'Survey'] },
  { key: 'benchmark_type', label: 'Benchmark Type', values: ['QA', 'Web', 'GUI', 'Embodied', 'Long-Horizon'] },
  { key: 'storage', label: 'Storage', values: ['Internal', 'External'] },
  { key: 'learning', label: 'Learning', values: ['Prompt-based', 'RL-based', 'SFT', 'Training-free'] },
  { key: 'memory_type', label: 'Memory Type', values: ['Episodic', 'Semantic', 'Procedural', 'Multimodal'] },
]

const TAG_TO_GROUP: Record<string, TagGroupKey> = {}
for (const g of TAG_GROUPS) for (const v of g.values) TAG_TO_GROUP[v] = g.key

// Tailwind classes per group — kept inline so PurgeCSS doesn't strip them.
const GROUP_CHIP_CLASS: Record<TagGroupKey, { idle: string; active: string }> = {
  category: {
    idle: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800/60',
    active: 'bg-blue-600 text-white border-blue-600 dark:bg-blue-500 dark:border-blue-500',
  },
  benchmark_type: {
    idle: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800/60',
    active: 'bg-amber-600 text-white border-amber-600 dark:bg-amber-500 dark:border-amber-500',
  },
  storage: {
    idle: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800/60',
    active: 'bg-rose-600 text-white border-rose-600 dark:bg-rose-500 dark:border-rose-500',
  },
  learning: {
    idle: 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-300 dark:border-cyan-800/60',
    active: 'bg-cyan-600 text-white border-cyan-600 dark:bg-cyan-500 dark:border-cyan-500',
  },
  memory_type: {
    idle: 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-800/60',
    active: 'bg-violet-600 text-white border-violet-600 dark:bg-violet-500 dark:border-violet-500',
  },
}
const NEUTRAL_CHIP_CLASS = {
  idle: 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700',
  active: 'bg-gray-700 text-white border-gray-700 dark:bg-gray-200 dark:text-gray-900 dark:border-gray-200',
}

function chipClasses(tag: string, active: boolean) {
  const group = TAG_TO_GROUP[tag]
  const cls = group ? GROUP_CHIP_CLASS[group] : NEUTRAL_CHIP_CLASS
  return active ? cls.active : cls.idle
}

// ----------------------------------------------------------------------
// Sort modes
// ----------------------------------------------------------------------
type SortKey = 'blog' | 'paper' | 'title'
const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'blog', label: 'Latest blog' },
  { key: 'paper', label: 'Latest paper' },
  { key: 'title', label: 'Title A→Z' },
]

function sortPosts(posts: Post[], key: SortKey): Post[] {
  const out = [...posts]
  if (key === 'blog') {
    out.sort((a, b) => {
      if (a.date !== b.date) return a.date < b.date ? 1 : -1
      const ad = a.paperDate || '', bd = b.paperDate || ''
      return ad < bd ? 1 : ad > bd ? -1 : 0
    })
  } else if (key === 'paper') {
    out.sort((a, b) => {
      const ad = a.paperDate || '', bd = b.paperDate || ''
      if (ad !== bd) return ad < bd ? 1 : -1
      return a.date < b.date ? 1 : -1
    })
  } else {
    out.sort((a, b) => a.title.localeCompare(b.title))
  }
  return out
}

// ----------------------------------------------------------------------
// URL state sync
// ----------------------------------------------------------------------
function readState(sp: URLSearchParams) {
  const tags = (sp.get('tags') || '').split(',').filter(Boolean)
  const q = sp.get('q') || ''
  const sort = (sp.get('sort') as SortKey) || 'blog'
  const kindRaw = (sp.get('kind') || 'all') as KindFilter
  const kind: KindFilter = KIND_OPTIONS.some(o => o.key === kindRaw) ? kindRaw : 'all'
  return { tags: new Set(tags), q, sort: SORT_OPTIONS.some(o => o.key === sort) ? sort : ('blog' as SortKey), kind }
}

function buildQuery(tags: Set<string>, q: string, sort: SortKey, kind: KindFilter): string {
  const params = new URLSearchParams()
  if (kind !== 'all') params.set('kind', kind)
  if (tags.size) params.set('tags', [...tags].join(','))
  if (q) params.set('q', q)
  if (sort !== 'blog') params.set('sort', sort)
  const s = params.toString()
  return s ? `?${s}` : ''
}

// ----------------------------------------------------------------------
// Main component
// ----------------------------------------------------------------------
export default function PostsExplorer({ posts }: { posts: Post[] }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const initial = useMemo(() => readState(new URLSearchParams(searchParams.toString())), [searchParams])
  const [selected, setSelected] = useState<Set<string>>(initial.tags)
  const [query, setQuery] = useState<string>(initial.q)
  const [sort, setSort] = useState<SortKey>(initial.sort)
  const [kind, setKind] = useState<KindFilter>(initial.kind)
  const [filtersOpen, setFiltersOpen] = useState(false)

  // sync state → URL
  useEffect(() => {
    const newQuery = buildQuery(selected, query, sort, kind)
    const current = (searchParams.toString() ? '?' + searchParams.toString() : '')
    if (newQuery !== current) {
      router.replace(`${pathname}${newQuery}`, { scroll: false })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, query, sort, kind])

  // Counts per kind (always over all posts, drives the segmented-control labels).
  const kindCounts = useMemo(() => {
    const c = { all: posts.length, ai: 0, human: 0 }
    for (const p of posts) c[p.kind]++
    return c
  }, [posts])

  // Posts visible to the current zone (kind filter applied first).
  const inZone = useMemo(
    () => (kind === 'all' ? posts : posts.filter((p) => p.kind === kind)),
    [posts, kind]
  )

  // Tag counts react to the current zone so disabled tags don't mislead.
  const tagCounts = useMemo(() => {
    const c = new Map<string, number>()
    for (const p of inZone) for (const t of p.tags || []) c.set(t, (c.get(t) || 0) + 1)
    return c
  }, [inZone])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = inZone.filter((p) => {
      // AND across all selected tags
      if (selected.size) {
        const ts = new Set(p.tags || [])
        for (const s of selected) if (!ts.has(s)) return false
      }
      if (q) {
        const hay = (p.title + ' ' + p.excerpt + ' ' + (p.excerptEn || '') + ' ' + (p.paperVenue || '') + ' ' + (p.paperAuthors || '')).toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })
    return sortPosts(list, sort)
  }, [inZone, selected, query, sort])

  const toggleTag = useCallback((t: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(t)) next.delete(t)
      else next.add(t)
      return next
    })
  }, [])

  const clearAll = useCallback(() => {
    setSelected(new Set())
    setQuery('')
    setSort('blog')
    setKind('all')
  }, [])

  const filtersDirty = selected.size > 0 || query !== '' || sort !== 'blog' || kind !== 'all'

  const sidebarBody = (
    <div className="space-y-5">
      {TAG_GROUPS.map((g) => {
        const visible = g.values.filter((v) => tagCounts.has(v))
        if (!visible.length) return null
        return (
          <div key={g.key}>
            <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
              {g.label}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {visible.map((v) => {
                const active = selected.has(v)
                return (
                  <button
                    key={v}
                    type="button"
                    onClick={() => toggleTag(v)}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${chipClasses(v, active)}`}
                    aria-pressed={active}
                  >
                    {v} <span className="opacity-60">{tagCounts.get(v)}</span>
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )

  return (
    <div className="lg:flex lg:gap-8">
      {/* Sidebar (lg+) / collapsible (mobile) */}
      <aside className="lg:w-64 lg:shrink-0">
        <div className="lg:sticky lg:top-20">
          <button
            type="button"
            onClick={() => setFiltersOpen((v) => !v)}
            className="lg:hidden flex items-center justify-between w-full mb-4 px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm font-medium text-gray-900 dark:text-white"
            aria-expanded={filtersOpen}
          >
            <span>Filters{selected.size ? ` (${selected.size})` : ''}</span>
            <span className={`transition-transform ${filtersOpen ? 'rotate-180' : ''}`} aria-hidden>▾</span>
          </button>
          <div className={`${filtersOpen ? 'block' : 'hidden'} lg:block bg-white dark:bg-gray-900 lg:bg-transparent dark:lg:bg-transparent rounded-xl lg:rounded-none border lg:border-0 border-gray-200 dark:border-gray-800 p-4 lg:p-0 mb-4 lg:mb-0`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Filters</h2>
              {filtersDirty ? (
                <button
                  type="button"
                  onClick={clearAll}
                  className="text-xs text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  Clear
                </button>
              ) : null}
            </div>
            {sidebarBody}
          </div>
        </div>
      </aside>

      {/* Main column */}
      <main className="flex-1 min-w-0">
        {/* Zone tabs (AI / Hand-written / All) */}
        <div className="mb-5 inline-flex p-1 rounded-xl bg-gray-100 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-800">
          {KIND_OPTIONS.map((o) => {
            const active = kind === o.key
            const count = kindCounts[o.key]
            return (
              <button
                key={o.key}
                type="button"
                onClick={() => setKind(o.key)}
                className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  active
                    ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
                aria-pressed={active}
              >
                <span className="mr-1.5" aria-hidden>{o.icon}</span>
                {o.label}
                <span className={`ml-1.5 text-xs ${active ? 'text-gray-500 dark:text-gray-400' : 'text-gray-400 dark:text-gray-500'}`}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Search + sort */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" aria-hidden>🔍</span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search title, excerpt, venue, authors…"
              className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-colors"
            />
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-colors"
            aria-label="Sort posts"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.key} value={o.key}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* Result bar */}
        <div className="flex items-center justify-between mb-4 text-sm text-gray-500 dark:text-gray-400">
          <span>
            {filtered.length === inZone.length && filtered.length === posts.length
              ? <>Showing <strong className="text-gray-900 dark:text-white">{posts.length}</strong> posts</>
              : <>Showing <strong className="text-gray-900 dark:text-white">{filtered.length}</strong> of {inZone.length}{kind !== 'all' ? ` ${kind === 'ai' ? 'AI' : 'hand-written'}` : ''} posts</>
            }
          </span>
          {selected.size > 0 && (
            <div className="hidden sm:flex flex-wrap gap-1.5 max-w-[60%] justify-end">
              {[...selected].map((t) => (
                <button
                  key={t}
                  onClick={() => toggleTag(t)}
                  className={`text-xs px-2 py-0.5 rounded-full border ${chipClasses(t, true)} hover:opacity-80`}
                  title="Remove filter"
                >
                  {t} ×
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Cards grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-500 dark:text-gray-400 border border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
            No posts match the current filters.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((post) => (
              <PostCard key={post.slug} post={post} onTagClick={toggleTag} selected={selected} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

// ----------------------------------------------------------------------
// Card
// ----------------------------------------------------------------------
function PostCard({
  post,
  onTagClick,
  selected,
}: {
  post: Post
  onTagClick: (t: string) => void
  selected: Set<string>
}) {
  const tags = (post.tags || []).filter((t) => t !== 'paper-notes')
  const visibleTags = tags.slice(0, 4)
  const overflow = tags.length - visibleTags.length

  const kindBadge = post.kind === 'ai'
    ? { icon: '🤖', label: 'AI Note', cls: 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700' }
    : { icon: '✍️', label: 'Personal', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800/60' }

  return (
    <article className="group flex flex-col bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 hover:border-blue-500/40 hover:shadow-lg dark:hover:shadow-blue-900/10 transition-all duration-200">
      <div className="mb-2.5">
        <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded border ${kindBadge.cls}`}>
          <span aria-hidden>{kindBadge.icon}</span>
          {kindBadge.label}
        </span>
      </div>
      <Link href={`/posts/${post.slug}`} className="block flex-1">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2 leading-snug line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {post.title}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-3 mb-3">
          {post.excerpt}
        </p>
        {post.paperVenue && (
          <div className="text-xs text-gray-500 dark:text-gray-500 mb-3">
            {post.paperVenue}
          </div>
        )}
      </Link>
      <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mb-3">
        <time dateTime={post.date} title="Blog publish date">
          📝 {format(new Date(post.date), 'yyyy MMM d')}
        </time>
        {post.paperDate && (
          <time dateTime={post.paperDate} title="arxiv / venue date">
            📄 {format(new Date(post.paperDate), 'yyyy MMM d')}
          </time>
        )}
      </div>
      {visibleTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {visibleTags.map((t) => (
            <button
              key={t}
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onTagClick(t)
              }}
              className={`text-[11px] px-2 py-0.5 rounded-full border transition-colors ${chipClasses(t, selected.has(t))}`}
              title={selected.has(t) ? 'Remove from filter' : 'Filter by this tag'}
            >
              {t}
            </button>
          ))}
          {overflow > 0 && (
            <span className="text-[11px] px-2 py-0.5 text-gray-400 dark:text-gray-500">
              +{overflow}
            </span>
          )}
        </div>
      )}
    </article>
  )
}
