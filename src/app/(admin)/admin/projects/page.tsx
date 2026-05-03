'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { getProjects, createProject, updateProject, deleteProject } from '@/lib/projects';
import { Project } from '@/types';
import { Plus, Pencil, Trash2, X } from 'lucide-react';

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Project | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [tech, setTech] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [github, setGithub] = useState('');
  const [order, setOrder] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    try {
      const data = await getProjects();
      setProjects(data);
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setTitle('');
    setTech('');
    setDescription('');
    setUrl('');
    setGithub('');
    setOrder(0);
    setEditing(null);
    setShowForm(false);
  }

  function startEdit(project: Project) {
    setEditing(project);
    setTitle(project.title);
    setTech(project.tech?.join(', ') ?? '');
    setDescription(project.description);
    setUrl(project.url ?? '');
    setGithub(project.github ?? '');
    setOrder(project.order);
    setShowForm(true);
  }

  async function handleSave() {
    if (!title.trim()) {
      alert('标题不能为空');
      return;
    }

    setSaving(true);
    try {
      const projectData = {
        title: title.trim(),
        tech: tech.split(',').map(t => t.trim()).filter(Boolean),
        description: description.trim(),
        url: url.trim() || null,
        github: github.trim() || null,
        order,
      };

      if (editing) {
        await updateProject(editing.id, projectData);
      } else {
        await createProject(projectData);
      }

      resetForm();
      await loadProjects();
    } catch (error) {
      console.error('Failed to save project:', error);
      alert('保存失败');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('确定要删除这个项目吗？')) return;
    try {
      await deleteProject(id);
      setProjects(projects.filter(p => p.id !== id));
    } catch (error) {
      console.error('Failed to delete project:', error);
      alert('删除失败');
    }
  }

  if (loading) {
    return <div className="text-center py-12 text-[var(--leaf-text-muted)]">加载中...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[var(--leaf-text)]">项目管理</h2>
        {!showForm && (
          <Button onClick={() => setShowForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            新建项目
          </Button>
        )}
      </div>

      {showForm && (
        <div className="glass-card rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-[var(--leaf-text)]">
              {editing ? '编辑项目' : '新建项目'}
            </h3>
            <Button variant="ghost" size="sm" onClick={resetForm}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div>
            <Label htmlFor="title">标题</Label>
            <Input
              id="title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="项目名称"
            />
          </div>

          <div>
            <Label htmlFor="tech">技术栈（逗号分隔）</Label>
            <Input
              id="tech"
              value={tech}
              onChange={e => setTech(e.target.value)}
              placeholder="React, Next.js, TypeScript"
            />
          </div>

          <div>
            <Label htmlFor="description">描述</Label>
            <Textarea
              id="description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="项目简介"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="url">项目 URL</Label>
            <Input
              id="url"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>

          <div>
            <Label htmlFor="github">GitHub URL</Label>
            <Input
              id="github"
              value={github}
              onChange={e => setGithub(e.target.value)}
              placeholder="https://github.com/..."
            />
          </div>

          <div>
            <Label htmlFor="order">排序权重</Label>
            <Input
              id="order"
              type="number"
              value={order}
              onChange={e => setOrder(Number(e.target.value))}
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? '保存中...' : '保存'}
            </Button>
            <Button variant="outline" onClick={resetForm}>
              取消
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {projects.map(project => (
          <div
            key={project.id}
            className="glass-card rounded-lg p-4 flex items-center justify-between gap-4"
          >
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-[var(--leaf-text)] truncate">{project.title}</h3>
              <p className="text-xs text-[var(--leaf-text-muted)] mt-1 truncate">
                {project.tech?.join(', ')}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button variant="outline" size="sm" onClick={() => startEdit(project)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDelete(project.id)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}

        {projects.length === 0 && (
          <div className="text-center py-12 text-[var(--leaf-text-muted)]">
            还没有项目
          </div>
        )}
      </div>
    </div>
  );
}
