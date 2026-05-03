'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { getNotes } from '@/lib/notes';
import { getCategories } from '@/lib/categories';
import { useAuth } from '@/hooks/use-auth';
import { Note, Category } from '@/types';
import { Plus, Search, Lock, FileText } from 'lucide-react';

export default function NotesPage() {
  const { user, loading: authLoading } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    if (!user) return;

    async function loadData() {
      try {
        const [notesData, categoriesData] = await Promise.all([
          getNotes({ authorId: user!.id }),
          getCategories(),
        ]);
        setNotes(notesData);
        setCategories(categoriesData.filter(c => c.user_id === user!.id));
      } catch (error) {
        console.error('Failed to load notes:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  const filteredNotes = useMemo(() => {
    let result = notes;

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        n =>
          n.title.toLowerCase().includes(q) ||
          (n.summary && n.summary.toLowerCase().includes(q))
      );
    }

    if (selectedCategory) {
      result = result.filter(n => n.category_id === selectedCategory);
    }

    return result;
  }, [notes, search, selectedCategory]);

  if (authLoading || loading) {
    return (
      <div className="text-center py-12 text-[var(--leaf-text-muted)]">
        加载中...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-[var(--leaf-text-muted)] mb-4">请先登录</p>
        <Link href="/login">
          <Button>去登录</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-[var(--leaf-text)]">我的笔记</h1>
        <Link href="/notes/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            新建笔记
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--leaf-text-muted)]" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="搜索笔记..."
            className="pl-9"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value)}
          className="border rounded-md px-3 py-2 bg-[var(--leaf-surface)] text-[var(--leaf-text)] border-[var(--leaf-border)]"
        >
          <option value="">全部分类</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {filteredNotes.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-[var(--leaf-text-muted)] mb-4" />
          <p className="text-[var(--leaf-text-muted)] mb-4">
            {search || selectedCategory ? '没有匹配的笔记' : '还没有笔记'}
          </p>
          {!search && !selectedCategory && (
            <Link href="/notes/new">
              <Button>创建第一篇笔记</Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNotes.map(note => (
            <Link key={note.id} href={`/notes/${note.id}`}>
              <div className="glass-card rounded-xl p-5 h-full hover:scale-[1.02] transition-transform cursor-pointer">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-[var(--leaf-text)] line-clamp-1">
                    {note.title}
                  </h3>
                  {note.is_private && (
                    <Lock className="h-4 w-4 text-[var(--leaf-text-muted)] flex-shrink-0 ml-2" />
                  )}
                </div>
                {note.summary && (
                  <p className="text-sm text-[var(--leaf-text-muted)] line-clamp-2 mb-3">
                    {note.summary}
                  </p>
                )}
                <div className="flex items-center justify-between mt-auto">
                  {note.category ? (
                    <Badge
                      variant="secondary"
                      className="text-xs"
                      style={{
                        backgroundColor: note.category.color
                          ? `${note.category.color}20`
                          : undefined,
                        color: note.category.color || undefined,
                      }}
                    >
                      {note.category.name}
                    </Badge>
                  ) : (
                    <span />
                  )}
                  <span className="text-xs text-[var(--leaf-text-muted)]">
                    {new Date(note.updated_at).toLocaleDateString('zh-CN')}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
