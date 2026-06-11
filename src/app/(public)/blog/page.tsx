import { getBlogPosts } from '@/lib/blog'
import { getNotesServer } from '@/lib/notes-server'
import Link from 'next/link'
import { BlogNotesTabs } from '@/components/BlogNotesTabs'

export default async function BlogPage() {
  let posts: Awaited<ReturnType<typeof getBlogPosts>> = []
  let notes: Awaited<ReturnType<typeof getNotes>> = []

  try {
    const [p, n] = await Promise.all([
      getBlogPosts({ published: true }),
      getNotesServer({ publicOnly: true }),
    ])
    posts = p
    notes = n
  } catch {
    // Database may not be set up yet
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">博客</h1>
      <BlogNotesTabs posts={posts} notes={notes} />
    </div>
  )
}
