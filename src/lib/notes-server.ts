import { createServerSupabaseClient } from './supabase-server'
import { Note } from '@/types'

export async function getNotesServer(options?: {
  search?: string
  categoryId?: string
  authorId?: string
  publicOnly?: boolean
  tag?: string
  page?: number
  pageSize?: number
}) {
  const supabase = await createServerSupabaseClient()
  const page = options?.page || 1
  const pageSize = options?.pageSize || 6

  let query = supabase
    .from('notes')
    .select('*, category:categories(*), author:profiles(*)', { count: 'exact' })
    .order('pinned', { ascending: false })
    .order('updated_at', { ascending: false })

  if (options?.search) {
    query = query.or(`title.ilike.%${options.search}%,content.ilike.%${options.search}%`)
  }
  if (options?.categoryId) query = query.eq('category_id', options.categoryId)
  if (options?.authorId) query = query.eq('author_id', options.authorId)
  if (options?.publicOnly) query = query.eq('is_private', false)
  if (options?.tag) query = query.contains('tags', [options.tag])

  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  query = query.range(from, to)

  const { data, error, count } = await query
  if (error) throw error

  return {
    notes: data as Note[],
    total: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize)
  }
}

export async function getTagsWithCount(publicOnly = true) {
  const supabase = await createServerSupabaseClient()
  let query = supabase.from('notes').select('tags')
  if (publicOnly) query = query.eq('is_private', false)
  const { data, error } = await query
  if (error) throw error
  const tagCounts: Record<string, number> = {}
  ;(data || []).forEach(note => {
    note.tags?.forEach((tag: string) => { tagCounts[tag] = (tagCounts[tag] || 0) + 1 })
  })
  return Object.entries(tagCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
}

export async function getCategoriesWithCount(publicOnly = true) {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('categories')
    .select('*, notes:notes(count)')
  if (error) throw error
  return (data || []).map(cat => ({
    ...cat,
    count: cat.notes?.[0]?.count || 0
  }))
}
