import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// ⚠️ 一次性初始化接口，创建完成后应删除此文件
export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ error: '缺少环境变量' }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const username = 'root'
  const password = '123456'
  const email = `${username}@app.local`

  try {
    // 1. 创建 Auth 用户
    let userId: string | undefined

    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { username },
      })

    if (authError) {
      if (authError.message.includes('already registered')) {
        // 用户已存在，查找 ID
        const { data: users } = await supabase.auth.admin.listUsers()
        const existing = users?.users?.find((u) => u.email === email)
        if (existing) {
          userId = existing.id
        } else {
          return NextResponse.json(
            { error: '用户已存在但无法找到' },
            { status: 500 },
          )
        }
      } else {
        return NextResponse.json(
          { error: `Auth 创建失败: ${authError.message}` },
          { status: 500 },
        )
      }
    } else {
      userId = authData.user.id
    }

    // 2. 写入 profiles 表
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single()

    if (existingProfile) {
      await supabase
        .from('profiles')
        .update({ role: 'admin', username })
        .eq('id', userId)
    } else {
      await supabase
        .from('profiles')
        .insert({ id: userId, username, role: 'admin' })
    }

    return NextResponse.json({
      success: true,
      message: 'root 管理员创建成功',
      user: { username, role: 'admin', id: userId },
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : '未知错误'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
