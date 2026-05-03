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

  if (password.length < 6) {
    return NextResponse.json(
      { error: '密码至少需要6个字符' },
      { status: 400 }
    )
  }

  const supabase = await createServerSupabaseClient()

  // Check if username already exists in profiles
  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', username)
    .single()

  if (existing) {
    return NextResponse.json(
      { error: '用户名已存在' },
      { status: 409 }
    )
  }

  // Sign up — the database trigger will auto-create the profile
  const { data, error } = await supabase.auth.signUp({
    email: `${username}@app.local`,
    password,
    options: {
      data: { username },
    },
  })

  if (error) {
    return NextResponse.json(
      { error: error.message || '注册失败' },
      { status: 400 }
    )
  }

  return NextResponse.json({ user: data.user })
}
