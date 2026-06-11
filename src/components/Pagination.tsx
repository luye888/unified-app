'use client'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null
  return (
    <div className="flex justify-center items-center gap-2 mt-10 py-5">
      <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}
        className="px-3 py-2 rounded-lg border border-[var(--leaf-border)] bg-white text-[var(--leaf-text-muted)] text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:border-[var(--leaf-primary)] hover:text-[var(--leaf-primary)] transition-all">
        &laquo; 上一页
      </button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
        <button key={page} onClick={() => onPageChange(page)}
          className={`w-9 h-9 rounded-lg text-sm flex items-center justify-center transition-all ${page === currentPage ? 'bg-gradient-to-r from-[var(--leaf-primary)] to-[var(--leaf-primary-light)] text-white border-transparent' : 'border border-[var(--leaf-border)] bg-white text-[var(--leaf-text-muted)] hover:border-[var(--leaf-primary)] hover:text-[var(--leaf-primary)]'}`}>
          {page}
        </button>
      ))}
      <span className="text-[#8aaa8a] text-sm mx-2">共 {totalPages} 页</span>
      <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}
        className="px-3 py-2 rounded-lg border border-[var(--leaf-border)] bg-white text-[var(--leaf-text-muted)] text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:border-[var(--leaf-primary)] hover:text-[var(--leaf-primary)] transition-all">
        下一页 &raquo;
      </button>
    </div>
  )
}
