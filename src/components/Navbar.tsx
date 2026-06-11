'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'

const navLinks = [
  { href: '/', label: '首页' },
  { href: '/projects', label: '项目' },
]

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user } = useAuth()

  function isActive(href: string) {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
    router.refresh()
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
            <>
              <Link
                href="/notes"
                className="rounded-md px-3 py-1.5 text-sm text-[var(--leaf-primary)] transition-colors hover:bg-[var(--leaf-primary)]/10"
              >
                {user.display_name || user.username}
              </Link>
              <button
                onClick={handleLogout}
                className="rounded-md px-3 py-1.5 text-sm text-[var(--leaf-text-muted)] transition-colors hover:text-[var(--leaf-text)]"
              >
                退出
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-md px-3 py-1.5 text-sm text-[var(--leaf-text-muted)] transition-colors hover:text-[var(--leaf-text)]"
            >
              登录
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
