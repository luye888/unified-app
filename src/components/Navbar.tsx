'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'

const navLinks = [
  { href: '/', label: '首页' },
  { href: '/projects', label: '项目' },
]

export function Navbar() {
  const pathname = usePathname()
  const { user } = useAuth()

  function isActive(href: string) {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/'
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-[var(--leaf-border)] bg-[var(--leaf-surface-glass)] backdrop-blur-[16px] backdrop-saturate-150">
      <div className="nav-glow-line" />
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-xl font-bold gradient-text">
            绿叶
          </Link>
          <div className="flex items-center gap-1 relative">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`relative rounded-md px-3 py-1.5 text-sm transition-colors ${
                  isActive(link.href)
                    ? 'text-[var(--leaf-primary)]'
                    : 'text-[var(--leaf-text-muted)] hover:text-[var(--leaf-text)]'
                }`}
              >
                {link.label}
                {isActive(link.href) && <span className="nav-indicator" />}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {user ? (
            <div className="relative group">
              <button className="flex items-center gap-2 rounded-full px-3 py-1.5 text-sm transition-colors hover:bg-[var(--leaf-primary)]/10">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[var(--leaf-primary)] to-[var(--leaf-primary-light)] flex items-center justify-center text-white text-xs font-semibold">
                  {(user.display_name || user.username || '?')[0].toUpperCase()}
                </div>
                <span className="text-[var(--leaf-text)] hidden sm:inline">{user.display_name || user.username}</span>
              </button>
              <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-[var(--leaf-border)] rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                <div className="px-3 py-2 border-b border-[var(--leaf-border)]">
                  <p className="text-sm font-medium text-[var(--leaf-text)]">{user.display_name || user.username}</p>
                  <p className="text-xs text-[var(--leaf-text-muted)]">{user.role === 'admin' ? '管理员' : '用户'}</p>
                </div>
                <Link href="/notes" className="block px-3 py-2 text-sm text-[var(--leaf-text-muted)] hover:bg-[var(--leaf-primary)]/5 hover:text-[var(--leaf-primary)]">
                  📝 我的笔记
                </Link>
                {user.role === 'admin' && (
                  <a href="/dashboard.html" className="block px-3 py-2 text-sm text-[var(--leaf-text-muted)] hover:bg-[var(--leaf-primary)]/5 hover:text-[var(--leaf-primary)]">
                    📊 数据面板
                  </a>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 text-sm text-[var(--leaf-text-muted)] hover:bg-red-50 hover:text-red-600 border-t border-[var(--leaf-border)]"
                >
                  退出登录
                </button>
              </div>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-2 rounded-full px-4 py-1.5 text-sm bg-[var(--leaf-primary)] text-white transition-colors hover:bg-[var(--leaf-primary)]/90"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              登录
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
