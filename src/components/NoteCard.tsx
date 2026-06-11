import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import type { Note } from '@/types'

interface NoteCardProps {
  note: Note
  pinned?: boolean
  activeTag?: string
}

export function NoteCard({ note, pinned, activeTag }: NoteCardProps) {
  return (
    <Link href={`/shared/${note.id}`}>
      <div className={`
        relative overflow-hidden cursor-pointer transition-all duration-300
        ${pinned
          ? 'col-span-2 rounded-2xl p-7 bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-[10px] border border-[var(--leaf-border)] hover:-translate-y-1.5 hover:scale-[1.01] hover:shadow-[0_20px_40px_rgba(45,138,94,0.15)] hover:border-[var(--leaf-primary)]'
          : 'rounded-xl p-5 bg-white/85 backdrop-blur-[8px] border border-[var(--leaf-border)] hover:-translate-y-[5px] hover:shadow-[0_12px_30px_rgba(45,138,94,0.12)] hover:border-[#b8d8b8]'
        }
      `}>
        {pinned && (
          <>
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[var(--leaf-primary)] to-[var(--leaf-primary-light)]" />
            <div className="absolute top-0 left-0 w-[200%] h-[200%] bg-[radial-gradient(circle,rgba(45,138,94,0.08)_0%,transparent_60%)] opacity-0 hover:opacity-100 transition-opacity pointer-events-none -translate-x-1/2 -translate-y-1/2" />
            <span className="inline-flex items-center gap-1 bg-gradient-to-r from-[var(--leaf-primary)] to-[var(--leaf-primary-light)] text-white text-[11px] font-semibold px-2.5 py-1 rounded-full mb-3">
              📌 置顶
            </span>
          </>
        )}
        {!pinned && (
          <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[var(--leaf-primary)] to-[var(--leaf-primary-light)] scale-x-0 origin-left transition-transform duration-300 group-hover:scale-x-100" />
        )}
        <h3 className={`font-semibold text-[var(--leaf-text)] mb-2 leading-snug ${pinned ? 'text-2xl' : 'text-[15px]'}`}>
          {note.title}
        </h3>
        {note.summary && (
          <p className={`text-[var(--leaf-text-muted)] leading-relaxed mb-4 ${pinned ? 'text-sm' : 'text-[13px] line-clamp-2'}`}>
            {note.summary}
          </p>
        )}
        {note.tags && note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {note.tags.map(tag => (
              <span
                key={tag}
                className={`text-[11px] px-2 py-0.5 rounded ${
                  activeTag && tag === activeTag
                    ? 'bg-[var(--leaf-primary)]/15 text-[var(--leaf-primary)] font-medium'
                    : 'bg-[var(--leaf-border)] text-[#3a6a3a]'
                }`}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        <div className="flex items-center justify-between mt-auto">
          {note.category ? (
            <Badge variant="secondary" className="text-xs"
              style={{ backgroundColor: note.category.color ? `${note.category.color}20` : undefined, color: note.category.color || undefined }}>
              {note.category.name}
            </Badge>
          ) : <span />}
          <span className="text-xs text-[#8aaa8a]">{new Date(note.created_at).toLocaleDateString('zh-CN')}</span>
        </div>
      </div>
    </Link>
  )
}
