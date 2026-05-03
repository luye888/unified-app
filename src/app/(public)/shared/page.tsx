import { getNotes } from '@/lib/notes'
import { Note } from '@/types'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'

export const dynamic = 'force-dynamic'

export default async function SharedNotesPage() {
  let notes: Note[] = []
  try {
    notes = await getNotes({ publicOnly: true })
  } catch {
    notes = []
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-[var(--leaf-text)] mb-8">公开笔记</h1>

      {notes.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-[var(--leaf-text-muted)]">暂无公开笔记</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map((note) => (
            <Link key={note.id} href={`/shared/${note.id}`}>
              <div className="glass-card rounded-xl p-5 h-full hover:scale-[1.02] transition-transform cursor-pointer">
                <h3 className="font-semibold text-[var(--leaf-text)] line-clamp-1 mb-2">
                  {note.title}
                </h3>
                {note.summary && (
                  <p className="text-sm text-[var(--leaf-text-muted)] line-clamp-2 mb-3">
                    {note.summary}
                  </p>
                )}
                <div className="flex items-center justify-between mt-auto">
                  {note.category ? (
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
                  ) : (
                    <span />
                  )}
                  <span className="text-xs text-[var(--leaf-text-muted)]">
                    {note.author?.display_name || note.author?.username || '匿名'}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
