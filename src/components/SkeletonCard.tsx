export function SkeletonCard() {
  return (
    <div className="glass-card p-5 space-y-3">
      <div className="skeleton-pulse h-3 w-16" />
      <div className="skeleton-pulse h-5 w-3/4" />
      <div className="space-y-2">
        <div className="skeleton-pulse h-3 w-full" />
        <div className="skeleton-pulse h-3 w-2/3" />
      </div>
      <div className="flex gap-2">
        <div className="skeleton-pulse h-5 w-14 rounded-full" />
        <div className="skeleton-pulse h-5 w-14 rounded-full" />
      </div>
    </div>
  )
}
