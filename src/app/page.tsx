'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { NoteCard } from '@/components/NoteCard';
import { getNotes } from '@/lib/notes';
import { Note } from '@/types';
import { Plus, FileText, FolderOpen } from 'lucide-react';

export default function HomePage() {
  const [recentNotes, setRecentNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadNotes() {
      try {
        const notes = await getNotes();
        setRecentNotes(notes.slice(0, 6));
      } catch (error) {
        console.error('Failed to load notes:', error);
      } finally {
        setLoading(false);
      }
    }
    loadNotes();
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">欢迎使用 NoteMaster</h1>
        <p className="text-muted-foreground">
          笔记处理、总结归纳、分类管理
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Link href="/notes/new">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <Plus className="h-5 w-5 text-primary mr-2" />
              <CardTitle className="text-lg">新建笔记</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                创建新的笔记内容
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/notes">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <FileText className="h-5 w-5 text-primary mr-2" />
              <CardTitle className="text-lg">所有笔记</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                查看和管理所有笔记
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/categories">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <FolderOpen className="h-5 w-5 text-primary mr-2" />
              <CardTitle className="text-lg">分类管理</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                管理笔记分类
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">最近笔记</h2>
          <Link href="/notes">
            <Button variant="ghost" size="sm">查看全部</Button>
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-8 text-muted-foreground">加载中...</div>
        ) : recentNotes.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">还没有笔记</p>
              <Link href="/notes/new">
                <Button className="mt-4">创建第一篇笔记</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentNotes.map((note) => (
              <NoteCard key={note.id} note={note} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
