import { getNotes } from '@/lib/notes'
import Link from 'next/link'

export default async function PublicNotesPage() {
  let notes: Awaited<ReturnType<typeof getNotes>> = []
  try {
    notes = await getNotes({ publicOnly: true })
  } catch {
    // Database may not be set up yet
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">公开笔记</h1>

      {notes.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">暂无公开笔记</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map((note) => (
            <Link key={note.id} href={`/notes/${note.id}`} className="glass-card p-5 block">
              <h2 className="font-semibold text-lg mb-2">{note.title}</h2>
              <p className="text-sm text-muted-foreground mb-3">{note.summary || '暂无摘要'}</p>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                {note.category && (
                  <span className="px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                    {note.category.name}
                  </span>
                )}
                {note.author && <span>{note.author.display_name || note.author.username}</span>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
