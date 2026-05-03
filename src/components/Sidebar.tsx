'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { FileText, FolderOpen, Home, Plus } from 'lucide-react';

const navItems = [
  { href: '/', label: '首页', icon: Home },
  { href: '/notes', label: '所有笔记', icon: FileText },
  { href: '/categories', label: '分类管理', icon: FolderOpen },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r bg-muted/30 p-4 hidden md:block">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">NoteMaster</h1>
        <p className="text-sm text-muted-foreground">笔记处理应用</p>
      </div>

      <Link href="/notes/new">
        <Button className="w-full mb-4">
          <Plus className="mr-2 h-4 w-4" />
          新建笔记
        </Button>
      </Link>

      <Separator className="mb-4" />

      <nav className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href ||
            (item.href !== '/' && pathname.startsWith(item.href));

          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive ? 'secondary' : 'ghost'}
                className={cn(
                  'w-full justify-start',
                  isActive && 'bg-secondary'
                )}
              >
                <Icon className="mr-2 h-4 w-4" />
                {item.label}
              </Button>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
