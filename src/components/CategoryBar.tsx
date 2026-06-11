'use client'

interface Category { id: string; name: string; count: number }

interface CategoryBarProps {
  categories: Category[]
  activeCategory?: string
  onCategoryChange: (categoryId: string | undefined) => void
}

export function CategoryBar({ categories, activeCategory, onCategoryChange }: CategoryBarProps) {
  const totalNotes = categories.reduce((sum, c) => sum + c.count, 0)
  return (
    <div className="flex gap-2 py-4 overflow-x-auto sticky top-14 z-10 bg-[var(--leaf-bg)]/95 backdrop-blur-[8px] border-b border-[var(--leaf-border)]">
      <button onClick={() => onCategoryChange(undefined)}
        className={`flex-shrink-0 px-5 py-2 rounded-full text-sm font-medium transition-all ${!activeCategory ? 'bg-gradient-to-r from-[var(--leaf-primary)] to-[var(--leaf-primary-light)] text-white' : 'bg-white border border-[var(--leaf-border)] text-[var(--leaf-text-muted)] hover:border-[var(--leaf-primary)] hover:text-[var(--leaf-primary)]'}`}>
        全部
        <span className={`ml-1.5 text-xs px-2 py-0.5 rounded-full ${!activeCategory ? 'bg-white/30' : 'bg-black/5'}`}>{totalNotes}</span>
      </button>
      {categories.map(cat => (
        <button key={cat.id} onClick={() => onCategoryChange(cat.id)}
          className={`flex-shrink-0 px-5 py-2 rounded-full text-sm font-medium transition-all ${activeCategory === cat.id ? 'bg-gradient-to-r from-[var(--leaf-primary)] to-[var(--leaf-primary-light)] text-white' : 'bg-white border border-[var(--leaf-border)] text-[var(--leaf-text-muted)] hover:border-[var(--leaf-primary)] hover:text-[var(--leaf-primary)]'}`}>
          {cat.name}
          <span className={`ml-1.5 text-xs px-2 py-0.5 rounded-full ${activeCategory === cat.id ? 'bg-white/30' : 'bg-black/5'}`}>{cat.count}</span>
        </button>
      ))}
    </div>
  )
}
