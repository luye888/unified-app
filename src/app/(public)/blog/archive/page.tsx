import { getBlogPosts } from '@/lib/blog'
import { BlogPost } from '@/types'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function BlogArchivePage() {
  let posts: BlogPost[] = []
  try {
    posts = await getBlogPosts({ published: true })
  } catch {
    posts = []
  }

  // Group posts by year+month
  const grouped: Record<string, typeof posts> = {}
  for (const post of posts) {
    const d = new Date(post.created_at)
    const key = `${d.getFullYear()}年${d.getMonth() + 1}月`
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(post)
  }

  const monthKeys = Object.keys(grouped).sort((a, b) => {
    // Sort descending: newest month first
    const [ya, ma] = a.match(/\d+/g)!.map(Number)
    const [yb, mb] = b.match(/\d+/g)!.map(Number)
    return yb * 12 + mb - (ya * 12 + ma)
  })

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-[var(--leaf-text)] mb-8">博客归档</h1>

      {monthKeys.length === 0 ? (
        <p className="text-[var(--leaf-text-muted)]">暂无文章</p>
      ) : (
        <div className="space-y-8">
          {monthKeys.map((month) => (
            <section key={month}>
              <h2 className="text-lg font-semibold text-[var(--leaf-primary)] mb-4">
                {month}
              </h2>
              <div className="border-l-2 border-[var(--leaf-border)] pl-6 space-y-3">
                {grouped[month].map((post) => (
                  <div key={post.id} className="flex items-baseline gap-3">
                    <span className="text-sm text-[var(--leaf-text-muted)] whitespace-nowrap">
                      {new Date(post.created_at).toLocaleDateString('zh-CN', {
                        month: '2-digit',
                        day: '2-digit',
                      })}
                    </span>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="text-[var(--leaf-text)] hover:text-[var(--leaf-primary)] transition-colors"
                    >
                      {post.title}
                    </Link>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
