'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getBlogPosts, deleteBlogPost } from '@/lib/blog';
import { BlogPost } from '@/types';
import { Plus, Pencil, Trash2 } from 'lucide-react';

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPosts();
  }, []);

  async function loadPosts() {
    try {
      const data = await getBlogPosts();
      setPosts(data);
    } catch (error) {
      console.error('Failed to load posts:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('确定要删除这篇文章吗？')) return;
    try {
      await deleteBlogPost(id);
      setPosts(posts.filter(p => p.id !== id));
    } catch (error) {
      console.error('Failed to delete post:', error);
      alert('删除失败');
    }
  }

  if (loading) {
    return <div className="text-center py-12 text-[var(--leaf-text-muted)]">加载中...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[var(--leaf-text)]">全部文章</h2>
        <Link href="/admin/blog/edit">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            新建文章
          </Button>
        </Link>
      </div>

      <div className="space-y-2">
        {posts.map(post => (
          <div
            key={post.id}
            className="glass-card rounded-lg p-4 flex items-center justify-between gap-4"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-medium text-[var(--leaf-text)] truncate">{post.title}</h3>
                {post.published ? (
                  <Badge variant="default" className="text-xs">已发布</Badge>
                ) : (
                  <Badge variant="secondary" className="text-xs">草稿</Badge>
                )}
                {post.pinned && (
                  <Badge variant="outline" className="text-xs">置顶</Badge>
                )}
              </div>
              <p className="text-xs text-[var(--leaf-text-muted)] mt-1">
                {new Date(post.created_at).toLocaleDateString('zh-CN')}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Link href={`/admin/blog/edit?id=${post.id}`}>
                <Button variant="outline" size="sm">
                  <Pencil className="h-4 w-4" />
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDelete(post.id)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}

        {posts.length === 0 && (
          <div className="text-center py-12 text-[var(--leaf-text-muted)]">
            还没有文章
          </div>
        )}
      </div>
    </div>
  );
}
