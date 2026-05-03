'use client';

import { useState, useEffect, useCallback, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NoteEditor } from '@/components/NoteEditor';
import { getNote, updateNote, deleteNote } from '@/lib/notes';
import { getCategories, createCategory } from '@/lib/categories';
import { generateStructuredNote, analyzeCategory } from '@/lib/content-organizer';
import { Note, Category } from '@/types';
import { ArrowLeft, Save, Trash2, Plus, Lock, Unlock } from 'lucide-react';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

const COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#84cc16',
  '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6',
  '#6366f1', '#8b5cf6', '#a855f7', '#ec4899',
];

export default function NoteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [note, setNote] = useState<Note | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState(COLORS[0]);
  const [suggestedCategory, setSuggestedCategory] = useState<string | null>(null);
  const [rawContent, setRawContent] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [analysis, setAnalysis] = useState<{
    contentType: string;
    contentTypeReason: string;
    coreSummary: string;
    mainTopics: string[];
    supportingLogic: string[];
    keyMethods: string[];
    conciseVersion: string[];
    transferableApplications: string;
  } | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    summary: '',
    category_id: '',
    tags: [] as string[],
  });
  const [tagInput, setTagInput] = useState('');
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [noteData, categoriesData] = await Promise.all([
          getNote(id),
          getCategories(),
        ]);
        setNote(noteData);
        setCategories(categoriesData);
        setRawContent(noteData.content);
        setIsPrivate(noteData.is_private);
        setFormData({
          title: noteData.title,
          content: noteData.content,
          summary: noteData.summary || '',
          category_id: noteData.category_id || '',
          tags: noteData.tags || [],
        });
      } catch (error) {
        console.error('Failed to load note:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  const autoOrganize = useCallback((title: string, content: string) => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      if (content.length < 20 && !title) return;

      try {
        const result = generateStructuredNote(title, content, '');
        const categoryResult = analyzeCategory(`${title} ${content}`, categories);

        setAnalysis(result.analysis);

        setFormData(prev => ({
          ...prev,
          content: result.content,
          summary: prev.summary || result.summary,
          tags: [...new Set([...prev.tags, ...result.tags])],
          category_id: prev.category_id || categoryResult.categoryId || '',
        }));

        if (categoryResult.categoryName) {
          setSuggestedCategory(categoryResult.categoryName);
        } else if (categoryResult.suggestedName) {
          setSuggestedCategory(categoryResult.suggestedName);
          createCategory({
            name: categoryResult.suggestedName,
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
            user_id: note?.author_id,
          }).then(newCat => {
            setCategories(prev => [...prev, newCat]);
            setFormData(prev => ({ ...prev, category_id: newCat.id }));
          }).catch(err => {
            console.error('Auto-create category failed:', err);
          });
        }
      } catch (err) {
        console.error('Auto-organize failed:', err);
      }
    }, 1500);
  }, [categories, note]);

  const handleContentChange = useCallback((content: string) => {
    setRawContent(content);
    autoOrganize(formData.title, content);
  }, [formData.title, autoOrganize]);

  const handleTitleChange = useCallback((title: string) => {
    setFormData(prev => ({ ...prev, title }));
    autoOrganize(title, rawContent);
  }, [rawContent, autoOrganize]);

  const handleCreateCategory = async (name?: string) => {
    const categoryName = name || newCategoryName.trim();
    if (!categoryName) return;

    try {
      const newCat = await createCategory({
        name: categoryName,
        color: newCategoryColor,
        user_id: note?.author_id,
      });
      setCategories(prev => [...prev, newCat]);
      setFormData(prev => ({ ...prev, category_id: newCat.id }));
      setShowNewCategory(false);
      setNewCategoryName('');
    } catch (error) {
      console.error('Failed to create category:', error);
    }
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!formData.tags.includes(tagInput.trim())) {
        setFormData({
          ...formData,
          tags: [...formData.tags, tagInput.trim()],
        });
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((t) => t !== tag),
    });
  };

  const handleSave = async () => {
    if (!formData.title.trim()) return;

    setSaving(true);
    try {
      await updateNote(id, {
        title: formData.title,
        content: formData.content,
        summary: formData.summary || undefined,
        category_id: formData.category_id || undefined,
        tags: formData.tags,
        is_private: isPrivate,
      });
      router.push('/notes');
    } catch (error) {
      console.error('Failed to update note:', error);
      alert('保存失败，请检查控制台日志');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('确定要删除这篇笔记吗？')) return;

    try {
      await deleteNote(id);
      router.push('/notes');
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12 text-[var(--leaf-text-muted)]">
        加载中...
      </div>
    );
  }

  if (!note) {
    return (
      <div className="text-center py-12">
        <p className="text-[var(--leaf-text-muted)] mb-4">笔记不存在</p>
        <Link href="/notes">
          <Button>返回笔记列表</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/notes">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回
          </Button>
        </Link>
        <div className="flex gap-2">
          <Button
            variant={isPrivate ? 'default' : 'outline'}
            size="sm"
            onClick={() => setIsPrivate(!isPrivate)}
          >
            {isPrivate ? (
              <Lock className="mr-2 h-4 w-4" />
            ) : (
              <Unlock className="mr-2 h-4 w-4" />
            )}
            {isPrivate ? '私密' : '公开'}
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            删除
          </Button>
          <Button onClick={handleSave} disabled={!formData.title.trim() || saving}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? '保存中...' : '保存'}
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <Label htmlFor="title">标题</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="输入笔记标题..."
            className="text-lg"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <Label>分类</Label>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowNewCategory(true)}
            >
              <Plus className="h-4 w-4 mr-1" />
              新建分类
            </Button>
          </div>
          <div className="flex gap-2">
            <select
              value={formData.category_id}
              onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
              className="flex-1 border rounded-md px-3 py-2 bg-[var(--leaf-surface)] border-[var(--leaf-border)]"
            >
              <option value="">选择分类...</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          {suggestedCategory && (
            <p className="text-sm text-[var(--leaf-text-muted)] mt-1">
              已自动识别分类: <span className="font-medium">{suggestedCategory}</span>
            </p>
          )}
        </div>

        <div>
          <Label>摘要</Label>
          <textarea
            value={formData.summary}
            onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
            placeholder="输入摘要，或等待自动生成..."
            className="w-full border rounded-md px-3 py-2 bg-[var(--leaf-surface)] border-[var(--leaf-border)] min-h-[60px] resize-y"
            rows={2}
          />
        </div>

        <div>
          <Label>标签</Label>
          <div className="flex flex-wrap gap-2 mb-2">
            {formData.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2 py-1 bg-[var(--leaf-surface)] rounded-md text-sm"
              >
                {tag}
                <button
                  onClick={() => handleRemoveTag(tag)}
                  className="text-[var(--leaf-text-muted)] hover:text-[var(--leaf-text)]"
                >
                  x
                </button>
              </span>
            ))}
          </div>
          <Input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleAddTag}
            placeholder="输入标签后按回车添加..."
          />
        </div>

        <div>
          <Label>内容</Label>
          <NoteEditor
            content={rawContent}
            onChange={handleContentChange}
          />

          {analysis && (
            <div className="mt-6 p-6 bg-[var(--leaf-surface)] rounded-lg space-y-4 border border-[var(--leaf-border)]">
              <h3 className="text-lg font-semibold text-[var(--leaf-text)]">结构化分析结果</h3>

              <div className="p-4 bg-[var(--leaf-surface-glass)] rounded-md">
                <h4 className="font-medium mb-2 text-[var(--leaf-text)]">一、内容类型判断</h4>
                <p className="text-sm"><strong>类型：</strong>{analysis.contentType}</p>
                <p className="text-sm text-[var(--leaf-text-muted)]"><strong>理由：</strong>{analysis.contentTypeReason}</p>
              </div>

              <div className="p-4 bg-[var(--leaf-surface-glass)] rounded-md">
                <h4 className="font-medium mb-2 text-[var(--leaf-text)]">二、核心内容总结</h4>
                <p className="text-sm">{analysis.coreSummary}</p>
              </div>

              <div className="p-4 bg-[var(--leaf-surface-glass)] rounded-md">
                <h4 className="font-medium mb-2 text-[var(--leaf-text)]">三、结构化拆解</h4>
                <ul className="text-sm space-y-1">
                  <li><strong>主要观点：</strong>{analysis.mainTopics.join('；')}</li>
                  {analysis.supportingLogic.length > 0 && (
                    <li><strong>支撑逻辑：</strong>{analysis.supportingLogic.join('；')}</li>
                  )}
                  <li><strong>关键数据/方法：</strong>{analysis.keyMethods.join('、')}</li>
                </ul>
              </div>

              <div className="p-4 bg-[var(--leaf-surface-glass)] rounded-md">
                <h4 className="font-medium mb-2 text-[var(--leaf-text)]">四、精简版（适合快速复习）</h4>
                <ol className="text-sm space-y-1 list-decimal list-inside">
                  {analysis.conciseVersion.map((point, i) => (
                    <li key={i}>{point}</li>
                  ))}
                </ol>
              </div>

              <div className="p-4 bg-[var(--leaf-surface-glass)] rounded-md">
                <h4 className="font-medium mb-2 text-[var(--leaf-text)]">五、可迁移应用</h4>
                <p className="text-sm">{analysis.transferableApplications}</p>
              </div>
            </div>
          )}

          {formData.content && formData.content !== rawContent && (
            <div className="mt-4 p-4 bg-green-500/10 rounded-lg border border-green-500/20">
              <p className="text-sm font-medium mb-2 text-[var(--leaf-text)]">整理后内容:</p>
              <div
                className="text-sm prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: formData.content }}
              />
            </div>
          )}
        </div>
      </div>

      <Dialog open={showNewCategory} onOpenChange={setShowNewCategory}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>新建分类</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="category-name">分类名称</Label>
              <Input
                id="category-name"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="输入分类名称..."
              />
            </div>
            <div>
              <Label>颜色</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className="w-8 h-8 rounded-full border-2 transition-transform hover:scale-110"
                    style={{
                      backgroundColor: color,
                      borderColor: newCategoryColor === color ? 'white' : 'transparent',
                    }}
                    onClick={() => setNewCategoryColor(color)}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewCategory(false)}>
              取消
            </Button>
            <Button onClick={() => handleCreateCategory()} disabled={!newCategoryName.trim()}>
              创建
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
