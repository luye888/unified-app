import { createServerSupabaseClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const supabase = await createServerSupabaseClient();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayISO = today.toISOString();

  const [blogRes, notesRes, profilesRes, viewsRes] = await Promise.all([
    supabase.from('blog_posts').select('id', { count: 'exact', head: true }),
    supabase.from('notes').select('id', { count: 'exact', head: true }),
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('page_views').select('id', { count: 'exact', head: true }).gte('created_at', todayISO),
  ]);

  const stats = [
    { label: '博客文章', count: blogRes.count ?? 0 },
    { label: '笔记总数', count: notesRes.count ?? 0 },
    { label: '注册用户', count: profilesRes.count ?? 0 },
    { label: '今日访问', count: viewsRes.count ?? 0 },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map(stat => (
        <div key={stat.label} className="glass-card rounded-xl p-6 text-center">
          <div className="text-3xl font-bold gradient-text mb-2">{stat.count}</div>
          <div className="text-sm text-[var(--leaf-text-muted)]">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}
