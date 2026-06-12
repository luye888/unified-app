'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import type { UserProfile } from '@/lib/auth'

export function useAuth() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    async function fetchUser() {
      try {
        console.log('[useAuth] calling getUser...')
        const { data: { user: authUser }, error } = await supabase.auth.getUser()
        console.log('[useAuth] getUser result:', authUser?.id || 'null', error?.message || 'no error')

        if (!authUser) {
          console.log('[useAuth] no user found')
          setUser(null)
          setLoading(false)
          return
        }

        console.log('[useAuth] fetching profile for:', authUser.id)
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single()

        console.log('[useAuth] profile result:', profile?.username, profile?.role, profileError?.message)
        setUser(profile as UserProfile | null)
      } catch (e) {
        console.error('[useAuth] error:', e)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event: string, session: { user: { id: string } } | null) => {
        console.log('[useAuth] auth state changed:', _event, session?.user?.id)
        if (!session?.user) {
          setUser(null)
          return
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        setUser(profile as UserProfile | null)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return { user, loading }
}
