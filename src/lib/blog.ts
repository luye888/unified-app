import { supabase } from './supabase'
import { BlogPost } from '@/types'

export async function getBlogPosts(options?: { published?: boolean }) {
  let query = supabase
    .from('posts')
    .select('*, author:profiles(*)')
    .order('pinned', { ascending: false })
    .order('created_at', { ascending: false })

  if (options?.published !== undefined) {
    query = query.eq('published', options.published)
  }

  const { data, error } = await query
  if (error) throw error
  return data as BlogPost[]
}

export async function getBlogPost(slug: string) {
  const { data, error } = await supabase
    .from('posts')
    .select('*, author:profiles(*)')
    .eq('slug', slug)
    .single()

  if (error) throw error
  return data as BlogPost
}

export async function createBlogPost(post: Partial<BlogPost>) {
  const { data, error } = await supabase
    .from('posts')
    .insert(post)
    .select()
    .single()

  if (error) throw error
  return data as BlogPost
}

export async function updateBlogPost(id: string, post: Partial<BlogPost>) {
  const { data, error } = await supabase
    .from('posts')
    .update({ ...post, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as BlogPost
}

export async function deleteBlogPost(id: string) {
  const { error } = await supabase.from('posts').delete().eq('id', id)
  if (error) throw error
}
