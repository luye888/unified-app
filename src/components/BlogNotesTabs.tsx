'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Post {
  id: string
  title: string
  slug: string
  description: string
  cover: string | null
  pinned: boolean
  tags: string[]
  read_time: number
  created_at: string
}

interface Note {
  id: string
  title: string
  summary: string | null
  category?: { name: string; color: string | null }
  author?: { display_name: string | null; username: string }
  created_at: string
}

export function BlogNotesTabs({ posts, notes }: { posts: Post[]; notes: Note[] }) {
  const [tab, setTab] = useState<'blog' | 'notes'>('blog')

  return (
    <div>
      {/* Tab 切换 */}
      <div className="flex gap-1 mb-6 border-b border-[var(--leaf-border)]">
        <button
          onClick={() => setTab('blog')}
          className={`px-4 py-2 text-sm font-medium transition-colors relative ${
            tab === 'blog'
              ? 'text-[var(--leaf-primary)]'
              : 'text-[var(--leaf-text-muted)] hover:text-[var(--leaf-text)]'
          }`}
        >
          博客文章
          {tab === 'blog' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--leaf-gradient)]" />}
        </button>
        <button
          onClick={() => setTab('notes')}
          className={`px-4 py-2 text-sm font-medium transition-colors relative ${
            tab === 'notes'
              ? 'text-[var(--leaf-primary)]'
              : 'text-[var(--leaf-text-muted)] hover:text-[var(--leaf-text)]'
          }`}
        >
          公开笔记
          {tab === 'notes' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--leaf-gradient)]" />}
        </button>
      </div>

      {/* 博客文章 */}
      {tab === 'blog' && (
        <div>
          {posts.length === 0 ? (
            <p className="text-muted-foreground text-center py-12">暂无博客文章</p>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`} className="glass-card p-6 block">
                  {post.cover && (
                    <div className="mb-4 rounded-lg overflow-hidden">
                      <img src={post.cover} alt={post.title} className="w-full h-48 object-cover" />
                    </div>
                  )}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {post.pinned && <span className="text-sm">📌</span>}
                        <h2 className="text-xl font-semibold">{post.title}</h2>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{post.description}</p>
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {post.tags.map((tag) => (
                          <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{new Date(post.created_at).toLocaleDateString('zh-CN')}</span>
                        <span>{post.read_time} 分钟阅读</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 公开笔记 */}
      {tab === 'notes' && (
        <div>
          {notes.length === 0 ? (
            <p className="text-muted-foreground text-center py-12">暂无公开笔记</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {notes.map((note) => (
                <Link key={note.id} href={`/shared/${note.id}`} className="glass-card p-5 block">
                  <h3 className="font-semibold line-clamp-1 mb-2">{note.title}</h3>
                  {note.summary && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{note.summary}</p>
                  )}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    {note.category ? (
                      <span
                        className="px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground"
                        style={note.category.color ? { backgroundColor: `${note.category.color}20`, color: note.category.color } : undefined}
                      >
                        {note.category.name}
                      </span>
                    ) : <span />}
                    <span>{note.author?.display_name || note.author?.username || '匿名'}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
