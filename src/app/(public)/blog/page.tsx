import { getBlogPosts } from '@/lib/blog'
import Link from 'next/link'

export default async function BlogPage() {
  let posts: Awaited<ReturnType<typeof getBlogPosts>> = []
  try {
    posts = await getBlogPosts({ published: true })
  } catch {
    // Database may not be set up yet
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">博客</h1>

      {posts.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">暂无博客文章</p>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="glass-card p-6 block"
            >
              {post.cover && (
                <div className="mb-4 rounded-lg overflow-hidden">
                  <img src={post.cover} alt={post.title} className="w-full h-48 object-cover" />
                </div>
              )}
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {post.pinned && <span className="text-sm">📌</span>}
                    <h2 className="text-xl font-semibold">{post.title}</h2>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{post.description}</p>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{new Date(post.created_at).toLocaleDateString('zh-CN')}</span>
                    <span>{post.read_time} 分钟阅读</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
