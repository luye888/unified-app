'use client'

interface Tag { name: string; count: number }

interface TagSidebarProps {
  tags: Tag[]
  activeTag?: string
  onTagChange: (tag: string | undefined) => void
}

export function TagSidebar({ tags, activeTag, onTagChange }: TagSidebarProps) {
  return (
    <aside className="w-[220px] shrink-0 sticky top-[120px] self-start">
      <h3 className="text-sm font-semibold text-[var(--leaf-text)] mb-3 pb-2 border-b-2 border-[var(--leaf-border)]">
        🏷️ 标签筛选
      </h3>
      <div className="flex flex-col gap-1.5">
        <button onClick={() => onTagChange(undefined)}
          className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all ${!activeTag ? 'bg-[var(--leaf-primary)]/10 border border-[var(--leaf-primary)] text-[var(--leaf-primary)] font-medium' : 'bg-white border border-transparent text-[var(--leaf-text-muted)] hover:bg-[var(--leaf-primary)]/5 hover:border-[var(--leaf-border)]'}`}>
          <span className="flex items-center gap-2">
            <span className={`w-1.5 h-1.5 rounded-full ${!activeTag ? 'bg-[var(--leaf-primary)]' : 'bg-[#b8d8b8]'}`} />
            全部
          </span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${!activeTag ? 'bg-[var(--leaf-primary)]/15 text-[var(--leaf-primary)]' : 'bg-[#f0f5f0] text-[#8aaa8a]'}`}>
            {tags.reduce((sum, t) => sum + t.count, 0)}
          </span>
        </button>
        {tags.map(tag => (
          <button key={tag.name} onClick={() => onTagChange(tag.name)}
            className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all ${activeTag === tag.name ? 'bg-[var(--leaf-primary)]/10 border border-[var(--leaf-primary)] text-[var(--leaf-primary)] font-medium' : 'bg-white border border-transparent text-[var(--leaf-text-muted)] hover:bg-[var(--leaf-primary)]/5 hover:border-[var(--leaf-border)]'}`}>
            <span className="flex items-center gap-2">
              <span className={`w-1.5 h-1.5 rounded-full ${activeTag === tag.name ? 'bg-[var(--leaf-primary)]' : 'bg-[#b8d8b8]'}`} />
              {tag.name}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${activeTag === tag.name ? 'bg-[var(--leaf-primary)]/15 text-[var(--leaf-primary)]' : 'bg-[#f0f5f0] text-[#8aaa8a]'}`}>
              {tag.count}
            </span>
          </button>
        ))}
      </div>
    </aside>
  )
}
