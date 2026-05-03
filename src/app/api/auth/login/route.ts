import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function POST(request: Request) {
  const { username, password } = await request.json()

  if (!username || !password) {
    return NextResponse.json(
      { error: '请填写用户名和密码' },
      { status: 400 }
    )
  }

  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email: `${username}@app.local`,
    password,
  })

  if (error) {
    return NextResponse.json(
      { error: '用户名或密码错误' },
      { status: 401 }
    )
  }

  return NextResponse.json({ user: data.user })
}
