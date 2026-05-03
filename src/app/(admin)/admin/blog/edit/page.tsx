'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { NoteEditor } from '@/components/NoteEditor';
import { getBlogPostById, createBlogPost, updateBlogPost } from '@/lib/blog';
import { useAuth } from '@/hooks/use-auth';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9一-鿿]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function BlogEditForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('id');
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [series, setSeries] = useState('');
  const [cover, setCover] = useState('');
  const [pinned, setPinned] = useState(false);
  const [published, setPublished] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!!editId);

  useEffect(() => {
    if (!editId) return;
    async function loadPost() {
      try {
        const post = await getBlogPostById(editId!);
        setTitle(post.title);
        setSlug(post.slug);
        setDescription(post.description);
        setContent(post.content);
        setTags(post.tags?.join(', ') ?? '');
        setSeries(post.series ?? '');
        setCover(post.cover ?? '');
        setPinned(post.pinned);
        setPublished(post.published);
      } catch (error) {
        console.error('Failed to load post:', error);
        alert('加载文章失败');
      } finally {
        setLoading(false);
      }
    }
    loadPost();
  }, [editId]);

  function handleAutoSlug() {
    setSlug(slugify(title));
  }

  async function handleSave() {
    if (!title.trim() || !slug.trim()) {
      alert('标题和 slug 不能为空');
      return;
    }

    setSaving(true);
    try {
      const postData = {
        title: title.trim(),
        slug: slug.trim(),
        description: description.trim(),
        content,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        series: series.trim() || null,
        cover: cover.trim() || null,
        pinned,
        published,
        author_id: user!.id,
      };

      if (editId) {
        await updateBlogPost(editId, postData);
      } else {
        await createBlogPost(postData);
      }

      router.push('/admin/blog');
    } catch (error) {
      console.error('Failed to save post:', error);
      alert('保存失败');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="text-center py-12 text-[var(--leaf-text-muted)]">加载中...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-[var(--leaf-text)]">
        {editId ? '编辑文章' : '新建文章'}
      </h2>

      <div className="space-y-4">
        <div>
          <Label htmlFor="title">标题</Label>
          <Input
            id="title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="文章标题"
          />
        </div>

        <div>
          <Label htmlFor="slug">Slug</Label>
          <div className="flex gap-2">
            <Input
              id="slug"
              value={slug}
              onChange={e => setSlug(e.target.value)}
              placeholder="url-friendly-slug"
            />
            <Button variant="outline" onClick={handleAutoSlug} type="button">
              自动生成
            </Button>
          </div>
        </div>

        <div>
          <Label htmlFor="description">描述</Label>
          <Textarea
            id="description"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="文章简介"
            rows={2}
          />
        </div>

        <div>
          <Label>内容</Label>
          <NoteEditor content={content} onChange={setContent} placeholder="开始撰写文章..." />
        </div>

        <div>
          <Label htmlFor="tags">标签（逗号分隔）</Label>
          <Input
            id="tags"
            value={tags}
            onChange={e => setTags(e.target.value)}
            placeholder="Next.js, React, TypeScript"
          />
        </div>

        <div>
          <Label htmlFor="series">系列</Label>
          <Input
            id="series"
            value={series}
            onChange={e => setSeries(e.target.value)}
            placeholder="系列名称（可选）"
          />
        </div>

        <div>
          <Label htmlFor="cover">封面图片 URL</Label>
          <Input
            id="cover"
            value={cover}
            onChange={e => setCover(e.target.value)}
            placeholder="https://..."
          />
        </div>

        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={pinned}
              onChange={e => setPinned(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm text-[var(--leaf-text)]">置顶</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={published}
              onChange={e => setPublished(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm text-[var(--leaf-text)]">发布</span>
          </label>
        </div>

        <div className="flex gap-2 pt-2">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? '保存中...' : '保存'}
          </Button>
          <Button variant="outline" onClick={() => router.push('/admin/blog')}>
            取消
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function BlogEditPage() {
  return (
    <Suspense fallback={<div className="text-center py-12 text-[var(--leaf-text-muted)]">加载中...</div>}>
      <BlogEditForm />
    </Suspense>
  );
}
