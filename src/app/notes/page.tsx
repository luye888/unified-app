'use client';

import { useEffect, useState } from 'react';
import { NoteCard } from '@/components/NoteCard';
import { SearchBar } from '@/components/SearchBar';
import { CategoryTag } from '@/components/CategoryTag';
import { Button } from '@/components/ui/button';
import { getNotes } from '@/lib/notes';
import { getCategories } from '@/lib/categories';
import { Note, Category } from '@/types';
import Link from 'next/link';
import { Plus, FileText } from 'lucide-react';

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();

  useEffect(() => {
    async function loadData() {
      try {
        const [notesData, categoriesData] = await Promise.all([
          getNotes(search, selectedCategory),
          getCategories(),
        ]);
        setNotes(notesData);
        setCategories(categoriesData);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [search, selectedCategory]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">所有笔记</h1>
        <Link href="/notes/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            新建笔记
          </Button>
        </Link>
      </div>

      <div className="mb-6 space-y-4">
        <SearchBar value={search} onChange={setSearch} />

        <div className="flex flex-wrap gap-2">
          <CategoryTag
            category={{ id: '', name: '全部', created_at: '' }}
            isSelected={!selectedCategory}
            onClick={() => setSelectedCategory(undefined)}
          />
          {categories.map((category) => (
            <CategoryTag
              key={category.id}
              category={category}
              isSelected={selectedCategory === category.id}
              onClick={() =>
                setSelectedCategory(
                  selectedCategory === category.id ? undefined : category.id
                )
              }
            />
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">加载中...</div>
      ) : notes.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">
            {search || selectedCategory ? '没有找到匹配的笔记' : '还没有笔记'}
          </p>
          {!search && !selectedCategory && (
            <Link href="/notes/new">
              <Button>创建第一篇笔记</Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map((note) => (
            <NoteCard key={note.id} note={note} />
          ))}
        </div>
      )}
    </div>
  );
}
