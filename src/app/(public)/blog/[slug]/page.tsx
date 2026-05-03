import { getBlogPost, getBlogPosts } from '@/lib/blog'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export async function generateStaticParams() {
  try {
    const posts = await getBlogPosts({ published: true })
    return posts.map((post) => ({ slug: post.slug }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  try {
    const post = await getBlogPost(slug)
    return {
      title: post.title,
      description: post.description,
    }
  } catch {
    return { title: '文章未找到' }
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  let post
  try {
    post = await getBlogPost(slug)
  } catch {
    notFound()
  }

  if (!post || !post.published) {
    notFound()
  }

  // Fetch series posts if this post belongs to a series
  let seriesPosts: typeof post[] = []
  if (post.series) {
    const allPosts = await getBlogPosts({ published: true })
    seriesPosts = allPosts.filter((p) => p.series === post.series)
  }

  return (
    <article className="p-6 max-w-3xl mx-auto">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">{post.title}</h1>
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
          <span>{new Date(post.created_at).toLocaleDateString('zh-CN')}</span>
          <span>{post.read_time} 分钟阅读</span>
          {post.author && <span>{post.author.display_name || post.author.username}</span>}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
      </header>

      {/* Content */}
      <div
        className="prose prose-lg dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {/* Series Navigation */}
      {post.series && seriesPosts.length > 1 && (
        <section className="mt-12 pt-8 border-t">
          <h3 className="text-lg font-semibold mb-4">系列: {post.series}</h3>
          <div className="space-y-2">
            {seriesPosts.map((p) => (
              <Link
                key={p.id}
                href={`/blog/${p.slug}`}
                className={`block px-4 py-2 rounded-lg transition-colors ${
                  p.id === post.id
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'hover:bg-muted'
                }`}
              >
                {p.title}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Back Link */}
      <div className="mt-8">
        <Link href="/blog" className="text-sm text-muted-foreground hover:text-foreground">
          &larr; 返回博客列表
        </Link>
      </div>
    </article>
  )
}
