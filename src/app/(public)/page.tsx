import { getNotesServer, getTagsWithCount, getCategoriesWithCount } from '@/lib/notes-server'
import { getSettings } from '@/lib/settings'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { TypewriterText } from '@/components/TypewriterText'
import { NoteListPage } from '@/components/NoteListPage'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; tag?: string; category?: string }>
}) {
  const params = await searchParams
  const page = Number(params.page) || 1
  const activeTag = params.tag || undefined
  const activeCategory = params.category || undefined

  let settings = { site_title: '', bio: '' }
  try { settings = await getSettings() } catch {}

  // Check user role
  let isAdmin = false
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: profile } = await supabase
        .from('profiles').select('role').eq('id', user.id).single()
      isAdmin = profile?.role === 'admin'
    }
  } catch {}

  // Admin homepage
  if (isAdmin) {
    let recentNotes: any[] = []
    try {
      const result = await getNotesServer({ publicOnly: false, page: 1, pageSize: 3 })
      recentNotes = result.notes
    } catch {}

    return (
      <div className="p-6 max-w-6xl mx-auto space-y-12">
        <section className="text-center py-12 relative">
          <div className="hero-glow" />
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <TypewriterText text={settings.site_title || '绿叶的个人空间'} className="gradient-text" />
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto bio-fade-in">
            {settings.bio || '热爱技术与生活'}
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-bold mb-6">管理工具</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/notes" className="glass-card p-6 block hover:scale-[1.02] transition-transform">
              <span className="text-xs font-medium text-[var(--leaf-primary)] mb-2 inline-block">内置</span>
              <h3 className="font-semibold text-lg mb-2">📝 笔记管理</h3>
              <p className="text-sm text-muted-foreground mb-3">在线笔记编辑器，支持富文本、分类、标签、公开/私密切换</p>
              <span className="text-sm text-primary">进入笔记 &rarr;</span>
            </Link>
            <a href="/dashboard.html" className="glass-card p-6 block hover:scale-[1.02] transition-transform">
              <span className="text-xs font-medium text-[var(--leaf-primary)] mb-2 inline-block">内置</span>
              <h3 className="font-semibold text-lg mb-2">📊 数据面板</h3>
              <p className="text-sm text-muted-foreground mb-3">可视化后端数据管理，直接操作笔记、博客、项目、分类</p>
              <span className="text-sm text-primary">打开面板 &rarr;</span>
            </a>
          </div>
        </section>
        {recentNotes.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-6">最近笔记</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentNotes.map(note => (
                <Link key={note.id} href={`/shared/${note.id}`} className="glass-card p-5 block">
                  <h3 className="font-semibold line-clamp-1 mb-2">{note.title}</h3>
                  {note.summary && <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{note.summary}</p>}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    {note.category && <span className="px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">{note.category.name}</span>}
                    <span>{new Date(note.created_at).toLocaleDateString('zh-CN')}</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    )
  }

  // Regular user homepage — Hero + note list
  let categories: any[] = []
  let tags: any[] = []
  let result: { notes: any[]; total: number; page: number; pageSize: number; totalPages: number } = { notes: [], total: 0, page: 1, pageSize: 6, totalPages: 0 }
  try {
    ;[categories, tags, result] = await Promise.all([
      getCategoriesWithCount(true),
      getTagsWithCount(true),
      getNotesServer({ publicOnly: true, page, tag: activeTag, categoryId: activeCategory }),
    ])
  } catch {}

  return (
    <div className="max-w-6xl mx-auto">
      {/* Hero */}
      <section className="text-center py-16 px-6 relative">
        <div className="hero-glow" />
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          <TypewriterText text={settings.site_title || '绿叶的个人空间'} className="gradient-text" />
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto bio-fade-in">
          {settings.bio || '热爱技术与生活'}
        </p>
        <div className="flex justify-center gap-4 mt-6">
          <span className="text-sm text-muted-foreground">📝 {result.total} 篇笔记</span>
        </div>
      </section>

      {/* 笔记列表 */}
      <div className="px-6 pb-12">
        <NoteListPage
          notes={result.notes} categories={categories} tags={tags}
          total={result.total} page={result.page} totalPages={result.totalPages}
          activeTag={activeTag} activeCategory={activeCategory}
        />
      </div>
    </div>
  )
}
