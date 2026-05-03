import { createServerSupabaseClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export default async function AnalyticsPage() {
  const supabase = await createServerSupabaseClient();

  // Fetch page views from last 7 days
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const { data: pageViews } = await supabase
    .from('page_views')
    .select('page_type, page_id, created_at')
    .gte('created_at', sevenDaysAgo)
    .order('created_at', { ascending: true });

  const views = pageViews ?? [];

  // Group by day for daily PV chart
  const dailyPV: Record<string, number> = {};
  const dayLabels: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const label = `${d.getMonth() + 1}/${d.getDate()}`;
    dailyPV[key] = 0;
    dayLabels.push(label);
  }
  views.forEach(v => {
    const day = v.created_at.slice(0, 10);
    if (day in dailyPV) {
      dailyPV[day]++;
    }
  });
  const dailyValues = Object.values(dailyPV);
  const maxPV = Math.max(...dailyValues, 1);

  // Group by page_type
  const typeBreakdown: Record<string, number> = {};
  views.forEach(v => {
    const type = v.page_type || 'unknown';
    typeBreakdown[type] = (typeBreakdown[type] || 0) + 1;
  });

  const typeColors: Record<string, string> = {
    blog: 'bg-[var(--leaf-primary)]',
    project: 'bg-purple-500',
    note: 'bg-amber-500',
    unknown: 'bg-gray-400',
  };

  const typeLabels: Record<string, string> = {
    blog: '博客',
    project: '项目',
    note: '笔记',
    unknown: '其他',
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-[var(--leaf-text)]">近 7 天访问趋势</h2>

      {/* Daily PV bar chart */}
      <div className="glass-card rounded-xl p-6">
        <div className="flex items-end gap-2 h-48">
          {dailyValues.map((count, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-xs text-[var(--leaf-text-muted)]">{count}</span>
              <div
                className="w-full rounded-t-md bg-[var(--leaf-primary)] transition-all"
                style={{ height: `${(count / maxPV) * 160}px`, minHeight: count > 0 ? '4px' : '0' }}
              />
              <span className="text-xs text-[var(--leaf-text-muted)]">{dayLabels[i]}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 text-sm text-[var(--leaf-text-muted)]">
          7 天总 PV: {dailyValues.reduce((a, b) => a + b, 0)}
        </div>
      </div>

      {/* Type breakdown */}
      <h2 className="text-lg font-semibold text-[var(--leaf-text)]">页面类型分布</h2>
      <div className="glass-card rounded-xl p-6">
        {Object.keys(typeBreakdown).length === 0 ? (
          <p className="text-[var(--leaf-text-muted)] text-sm">暂无数据</p>
        ) : (
          <div className="space-y-3">
            {Object.entries(typeBreakdown)
              .sort((a, b) => b[1] - a[1])
              .map(([type, count]) => {
                const total = views.length;
                const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                return (
                  <div key={type}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-[var(--leaf-text)]">
                        {typeLabels[type] || type}
                      </span>
                      <span className="text-[var(--leaf-text-muted)]">
                        {count} ({pct}%)
                      </span>
                    </div>
                    <div className="h-2 bg-[var(--leaf-border)] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${typeColors[type] || 'bg-gray-400'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}
