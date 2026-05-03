'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getCategories, createCategory, updateCategory, deleteCategory } from '@/lib/categories';
import { useAuth } from '@/hooks/use-auth';
import { Category } from '@/types';
import { Plus, Pencil, Trash2, X } from 'lucide-react';

const COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#84cc16',
  '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6',
  '#6366f1', '#8b5cf6', '#a855f7', '#ec4899',
];

export default function CategoriesPage() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    color: COLORS[0],
  });

  useEffect(() => {
    if (!user) return;
    loadCategories();
  }, [user]);

  async function loadCategories() {
    try {
      const data = await getCategories();
      setCategories(data.filter(c => c.user_id === user!.id));
    } catch (error) {
      console.error('Failed to load categories:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !user) return;

    try {
      if (editingId) {
        await updateCategory(editingId, {
          name: formData.name,
          color: formData.color,
        });
      } else {
        await createCategory({
          name: formData.name,
          color: formData.color,
          user_id: user.id,
        });
      }
      setFormData({ name: '', color: COLORS[0] });
      setEditingId(null);
      loadCategories();
    } catch (error) {
      console.error('Failed to save category:', error);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingId(category.id);
    setFormData({
      name: category.name,
      color: category.color || COLORS[0],
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个分类吗？')) return;

    try {
      await deleteCategory(id);
      loadCategories();
    } catch (error) {
      console.error('Failed to delete category:', error);
    }
  };

  const handleCancel = () => {
    setFormData({ name: '', color: COLORS[0] });
    setEditingId(null);
  };

  if (loading) {
    return (
      <div className="text-center py-12 text-[var(--leaf-text-muted)]">
        加载中...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[var(--leaf-text)]">分类管理</h1>

      <Card>
        <CardHeader>
          <CardTitle>{editingId ? '编辑分类' : '新建分类'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <Label htmlFor="name">名称</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="输入分类名称..."
                  required
                />
              </div>
              <div>
                <Label htmlFor="color">颜色</Label>
                <Input
                  id="color"
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-12 h-10 p-1 cursor-pointer"
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit">
                  {editingId ? (
                    <>
                      <Pencil className="mr-2 h-4 w-4" />
                      更新
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      添加
                    </>
                  )}
                </Button>
                {editingId && (
                  <Button type="button" variant="outline" onClick={handleCancel}>
                    <X className="mr-2 h-4 w-4" />
                    取消
                  </Button>
                )}
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {categories.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-[var(--leaf-text-muted)]">还没有分类，创建一个吧</p>
        </div>
      ) : (
        <div className="space-y-3">
          {categories.map(category => (
            <Card key={category.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: category.color || '#6b7280' }}
                    />
                    <span className="font-medium text-[var(--leaf-text)]">
                      {category.name}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(category)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(category.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
