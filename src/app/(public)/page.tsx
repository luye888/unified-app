import { getProjects } from '@/lib/projects'
import { getBlogPosts } from '@/lib/blog'
import { getNotes } from '@/lib/notes'
import { getSettings } from '@/lib/settings'
import Link from 'next/link'
import { TypewriterText } from '@/components/TypewriterText'
import { FadeInCard } from '@/components/FadeInCard'
import { SkeletonCard } from '@/components/SkeletonCard'

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
  const topNotes = notes.slice(0, Math.max(0, 6 - topProjects.length))

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-12">
      {/* Hero */}
      <section className="text-center py-12 relative">
        <div className="hero-glow" />
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          <TypewriterText
            text={settings.site_title || '绿叶的个人空间'}
            className="gradient-text"
          />
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto bio-fade-in">
          {settings.bio || '热爱技术与生活'}
        </p>
      </section>

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
            {topPosts.map((post, i) => (
              <FadeInCard key={post.id} delay={i * 100}>
                <Link href={`/blog/${post.slug}`} className="glass-card p-5 block h-full">
                  {post.pinned && (
                    <span className="text-xs font-medium text-primary mb-2 inline-block">📌 置顶</span>
                  )}
                  <h3 className="font-semibold text-lg mb-2">{post.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{post.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(post.created_at).toLocaleDateString('zh-CN')}
                  </p>
                </Link>
              </FadeInCard>
            ))}
          </div>
        </section>
      )}

      {/* Projects + Notes */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">项目与笔记</h2>
          <div className="flex gap-3">
            <Link href="/projects" className="text-sm text-muted-foreground hover:text-foreground">
              全部项目 &rarr;
            </Link>
            <Link href="/projects" className="text-sm text-muted-foreground hover:text-foreground">
              全部笔记 &rarr;
            </Link>
          </div>
        </div>

        {topProjects.length === 0 && topNotes.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topProjects.map((project, i) => (
              <FadeInCard key={project.id} delay={i * 100}>
                <div className="glass-card p-5 h-full">
                  <span className="text-xs font-medium text-[var(--leaf-primary)] mb-2 inline-block">项目</span>
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
              </FadeInCard>
            ))}
            {topNotes.map((note, i) => (
              <FadeInCard key={note.id} delay={(topProjects.length + i) * 100}>
                <div className="glass-card p-5 h-full">
                  <span className="text-xs font-medium text-[var(--leaf-text-muted)] mb-2 inline-block">笔记</span>
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
              </FadeInCard>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
