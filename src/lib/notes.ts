import { supabase } from './supabase'
import { Note, NoteFormData } from '@/types'

export async function getNotes(options?: {
  search?: string
  categoryId?: string
  authorId?: string
  publicOnly?: boolean
}) {
  let query = supabase
    .from('notes')
    .select('*, category:categories(*), author:profiles(*)')
    .order('updated_at', { ascending: false })

  if (options?.search) {
    query = query.or(
      `title.ilike.%${options.search}%,content.ilike.%${options.search}%`
    )
  }

  if (options?.categoryId) {
    query = query.eq('category_id', options.categoryId)
  }

  if (options?.authorId) {
    query = query.eq('author_id', options.authorId)
  }

  if (options?.publicOnly) {
    query = query.eq('is_private', false)
  }

  const { data, error } = await query
  if (error) throw error
  return data as Note[]
}

export async function getNote(id: string) {
  const { data, error } = await supabase
    .from('notes')
    .select('*, category:categories(*), author:profiles(*)')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as Note
}

export async function createNote(note: NoteFormData & { author_id: string }) {
  const { data, error } = await supabase
    .from('notes')
    .insert(note)
    .select()
    .single()

  if (error) throw error
  return data as Note
}

export async function updateNote(id: string, note: Partial<NoteFormData>) {
  const { data, error } = await supabase
    .from('notes')
    .update({ ...note, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Note
}

export async function deleteNote(id: string) {
  const { error } = await supabase.from('notes').delete().eq('id', id)
  if (error) throw error
}
