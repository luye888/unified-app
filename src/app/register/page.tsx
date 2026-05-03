'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('两次输入的密码不一致')
      return
    }

    setLoading(true)

    try {
      // Register
      const regRes = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      const regData = await regRes.json()

      if (!regRes.ok) {
        setError(regData.error || '注册失败')
        return
      }

      // Auto-login after successful registration
      const loginRes = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      if (loginRes.ok) {
        router.push('/')
        router.refresh()
      } else {
        // Registration succeeded but auto-login failed
        router.push('/login')
      }
    } catch {
      setError('请求失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-sm">
        <div className="bg-card border rounded-lg p-6 shadow-sm">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-card-foreground">注册</h1>
            <p className="text-sm text-muted-foreground mt-1">
              创建你的 NoteMaster 账户
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="username"
                className="text-sm font-medium text-foreground"
              >
                用户名
              </label>
              <input
                id="username"
                type="text"
                placeholder="输入用户名"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium text-foreground"
              >
                密码
              </label>
              <input
                id="password"
                type="password"
                placeholder="至少6个字符"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="confirmPassword"
                className="text-sm font-medium text-foreground"
              >
                确认密码
              </label>
              <input
                id="confirmPassword"
                type="password"
                placeholder="再次输入密码"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-md font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {loading ? '注册中...' : '注册'}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-4">
            已有账户？{' '}
            <Link
              href="/login"
              className="text-primary hover:underline font-medium"
            >
              登录
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
