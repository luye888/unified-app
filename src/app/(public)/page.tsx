import { getProjects } from '@/lib/projects'
import { getBlogPosts } from '@/lib/blog'
import { getNotes } from '@/lib/notes'
import { getSettings } from '@/lib/settings'
import Link from 'next/link'

export default async function HomePage() {
  let settings = { site_title: '', bio: '', social_links: {} as Record<string, string> }
  let projects: Awaited<ReturnType<typeof getProjects>> = []
  let posts: Awaited<ReturnType<typeof getBlogPosts>> = []
  let notes: Awaited<ReturnType<typeof getNotes>> = []

  try {
    const results = await Promise.all([
      getSettings(),
      getProjects(),
      getBlogPosts({ published: true }),
      getNotes({ publicOnly: true }),
    ])
    settings = results[0]
    projects = results[1]
    posts = results[2]
    notes = results[3]
  } catch {
    // Database may not be set up yet — show empty state
  }

  const topProjects = projects.slice(0, 3)
  const topPosts = posts.slice(0, 3)
  const topNotes = notes.slice(0, 6)

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-12">
      {/* Hero */}
      <section className="text-center py-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          <span className="gradient-text">{settings.site_title || '绿叶的个人空间'}</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {settings.bio || '热爱技术与生活'}
        </p>
      </section>

      {/* Featured Projects */}
      {topProjects.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">精选项目</h2>
            <Link href="/projects" className="text-sm text-muted-foreground hover:text-foreground">
              查看全部 &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topProjects.map((project) => (
              <div key={project.id} className="glass-card p-5">
                <h3 className="font-semibold text-lg mb-2">{project.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">{project.description}</p>
                <div className="flex flex-wrap gap-1.5">
                  {project.tech.map((t) => (
                    <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Latest Blog Posts */}
      {topPosts.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">最新博客</h2>
            <Link href="/blog" className="text-sm text-muted-foreground hover:text-foreground">
              查看全部 &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topPosts.map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`} className="glass-card p-5 block">
                {post.pinned && (
                  <span className="text-xs font-medium text-primary mb-2 inline-block">📌 置顶</span>
                )}
                <h3 className="font-semibold text-lg mb-2">{post.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">{post.description}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(post.created_at).toLocaleDateString('zh-CN')}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Public Notes */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">公开笔记</h2>
          <Link href="/notes" className="text-sm text-muted-foreground hover:text-foreground">
            查看全部 &rarr;
          </Link>
        </div>
        {topNotes.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">暂无公开笔记</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topNotes.map((note) => (
              <div key={note.id} className="glass-card p-5">
                <h3 className="font-semibold text-lg mb-2">{note.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">{note.summary || '暂无摘要'}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  {note.category && (
                    <span className="px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                      {note.category.name}
                    </span>
                  )}
                  {note.author && <span>{note.author.display_name || note.author.username}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
