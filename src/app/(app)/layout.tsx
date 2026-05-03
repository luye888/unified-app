'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  { href: '/notes', label: '我的笔记' },
  { href: '/notes/new', label: '新建笔记' },
  { href: '/categories', label: '分类管理' },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === '/notes') return pathname === '/notes';
    return pathname.startsWith(href);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <nav className="flex gap-1 mb-8 border-b border-[var(--leaf-border)]">
        {tabs.map(tab => (
          <Link
            key={tab.href}
            href={tab.href}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
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
