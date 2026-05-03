'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'

const navLinks = [
  { href: '/', label: '首页' },
  { href: '/blog', label: '博客' },
  { href: '/projects', label: '项目' },
]

export function Navbar() {
  const pathname = usePathname()
  const { user } = useAuth()

  function isActive(href: string) {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-[var(--leaf-border)] bg-[var(--leaf-surface-glass)] backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-xl font-bold gradient-text">
            绿叶
          </Link>
          <div className="flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                  isActive(link.href)
                    ? 'bg-[var(--leaf-primary)]/10 text-[var(--leaf-primary)]'
                    : 'text-[var(--leaf-text-muted)] hover:text-[var(--leaf-text)]'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <div>
          {user ? (
            <Link
              href="/notes"
              className="rounded-md px-3 py-1.5 text-sm text-[var(--leaf-primary)] transition-colors hover:bg-[var(--leaf-primary)]/10"
            >
              我的笔记
            </Link>
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
