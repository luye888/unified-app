'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  { href: '/admin', label: '仪表盘' },
  { href: '/admin/blog', label: '博客管理' },
  { href: '/admin/projects', label: '项目管理' },
  { href: '/admin/users', label: '用户管理' },
  { href: '/admin/analytics', label: '访问统计' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold text-[var(--leaf-text)] mb-6">管理后台</h1>
      <nav className="flex gap-1 mb-8 border-b border-[var(--leaf-border)] overflow-x-auto">
        {tabs.map(tab => (
          <Link
            key={tab.href}
            href={tab.href}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px whitespace-nowrap ${
              isActive(tab.href)
                ? 'border-[var(--leaf-primary)] text-[var(--leaf-primary)]'
                : 'border-transparent text-[var(--leaf-text-muted)] hover:text-[var(--leaf-text)]'
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </nav>
      {children}
    </div>
  );
}
