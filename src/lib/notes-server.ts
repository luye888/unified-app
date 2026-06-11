import { createServerSupabaseClient } from './supabase-server'
import { Note } from '@/types'

export async function getNotesServer(options?: {
  search?: string
  categoryId?: string
  authorId?: string
  publicOnly?: boolean
}) {
  const supabase = await createServerSupabaseClient()

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
