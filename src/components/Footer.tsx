export function Footer() {
  return (
    <footer className="border-t border-[var(--leaf-border)] py-6 text-center text-sm text-[var(--leaf-text-muted)]">
      <p>&copy; {new Date().getFullYear()} 绿叶. Built with Next.js & Supabase</p>
    </footer>
  )
}
