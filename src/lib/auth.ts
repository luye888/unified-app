import { createServerSupabaseClient } from '@/lib/supabase-server'

export interface UserProfile {
  id: string
  username: string
  display_name: string | null
  role: 'admin' | 'user'
  bio: string | null
  avatar_url: string | null
}

export async function getCurrentUser(): Promise<UserProfile | null> {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) return null

  return profile as UserProfile
}

export async function requireAuth(): Promise<UserProfile> {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('Unauthorized')
  }
  return user
}

export async function requireAdmin(): Promise<UserProfile> {
  const user = await requireAuth()
  if (user.role !== 'admin') {
    throw new Error('Forbidden')
  }
  return user
}
