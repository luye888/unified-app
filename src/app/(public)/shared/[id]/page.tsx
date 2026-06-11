import { createServerSupabaseClient } from '@/lib/supabase-server'
import { sanitizeHtml } from '@/lib/sanitize'
import { marked } from 'marked'
import { Note } from '@/types'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import AnalyticsTracker from '@/components/AnalyticsTracker'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function SharedNotePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  let note: Note | null = null
  try {
    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase
      .from('notes')
      .select('*, category:categories(*), author:profiles(*)')
      .eq('id', id)
      .single()

    if (error) throw error
    note = data as Note
  } catch {
    notFound()
  }

  if (!note || note.is_private) {
    notFound()
  }

  return (
    <>
      <AnalyticsTracker pageType="note" pageId={note.id} />
      <article className="max-w-3xl mx-auto p-6">
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--leaf-text)] mb-4">
            {note.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--leaf-text-muted)] mb-4">
            <span>{note.author?.display_name || note.author?.username || '匿名'}</span>
            <span>{new Date(note.created_at).toLocaleDateString('zh-CN')}</span>
            {note.category && (
              <Badge
                variant="secondary"
                className="text-xs"
                style={{
                  backgroundColor: note.category.color
                    ? `${note.category.color}20`
                    : undefined,
                  color: note.category.color || undefined,
                }}
              >
                {note.category.name}
              </Badge>
            )}
          </div>
          {note.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {note.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2 py-0.5 rounded-full bg-[var(--leaf-surface)] text-[var(--leaf-text-muted)]"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>

        <div
          className="prose prose-lg dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(marked.parse(note.content) as string) }}
        />

        <div className="mt-8">
          <Link
            href="/shared"
            className="text-sm text-[var(--leaf-text-muted)] hover:text-[var(--leaf-text)]"
          >
            &larr; 返回公开笔记
          </Link>
        </div>
      </article>
    </>
  )
}
