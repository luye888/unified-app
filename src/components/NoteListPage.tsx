'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { NoteCard } from '@/components/NoteCard'
import { TagSidebar } from '@/components/TagSidebar'
import { CategoryBar } from '@/components/CategoryBar'
import { Pagination } from '@/components/Pagination'
import type { Note } from '@/types'

interface NoteListPageProps {
  notes: Note[]
  categories: { id: string; name: string; count: number }[]
  tags: { name: string; count: number }[]
  total: number
  page: number
  totalPages: number
  activeTag?: string
  activeCategory?: string
}

export function NoteListPage({
  notes, categories, tags, page, totalPages, activeTag, activeCategory,
}: NoteListPageProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function updateParams(key: string, value: string | undefined) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) { params.set(key, value) } else { params.delete(key) }
    params.delete('page')
    router.push(`/?${params.toString()}`)
  }

  function handlePageChange(newPage: number) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', String(newPage))
    router.push(`/?${params.toString()}`)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const pinnedNotes = notes.filter(n => n.pinned)
  const normalNotes = notes.filter(n => !n.pinned)

  return (
    <>
      <CategoryBar categories={categories} activeCategory={activeCategory}
        onCategoryChange={(cat) => updateParams('category', cat)} />
      <div className="flex gap-8 mt-4">
        <TagSidebar tags={tags} activeTag={activeTag}
          onTagChange={(tag) => updateParams('tag', tag)} />
        <div className="flex-1 min-w-0">
          {notes.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">暂无笔记</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {pinnedNotes.map(note => (
                <NoteCard key={note.id} note={note} pinned activeTag={activeTag} />
              ))}
              {normalNotes.map(note => (
                <NoteCard key={note.id} note={note} activeTag={activeTag} />
              ))}
            </div>
          )}
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={handlePageChange} />
        </div>
      </div>
    </>
  )
}
