'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase';
import { Profile } from '@/types';
import { Shield, User } from 'lucide-react';

export default function AdminUsersPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfiles();
  }, []);

  async function loadProfiles() {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProfiles(data as Profile[]);
    } catch (error) {
      console.error('Failed to load profiles:', error);
    } finally {
      setLoading(false);
    }
  }

  async function toggleRole(profile: Profile) {
    const newRole = profile.role === 'admin' ? 'user' : 'admin';
    if (!confirm(`确定要将 ${profile.display_name || profile.username} 的角色切换为 ${newRole} 吗？`)) {
      return;
    }

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', profile.id);

      if (error) throw error;

      setProfiles(profiles.map(p =>
        p.id === profile.id ? { ...p, role: newRole } : p
      ));
    } catch (error) {
      console.error('Failed to toggle role:', error);
      alert('切换角色失败');
    }
  }

  if (loading) {
    return <div className="text-center py-12 text-[var(--leaf-text-muted)]">加载中...</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-[var(--leaf-text)]">用户管理</h2>

      <div className="space-y-2">
        {profiles.map(profile => (
          <div
            key={profile.id}
            className="glass-card rounded-lg p-4 flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 rounded-full bg-[var(--leaf-primary)]/10 flex items-center justify-center flex-shrink-0">
                {profile.role === 'admin' ? (
                  <Shield className="h-5 w-5 text-[var(--leaf-primary)]" />
                ) : (
                  <User className="h-5 w-5 text-[var(--leaf-text-muted)]" />
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-[var(--leaf-text)] truncate">
                    {profile.display_name || profile.username}
                  </h3>
                  <Badge
                    variant={profile.role === 'admin' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {profile.role}
                  </Badge>
                </div>
                <p className="text-xs text-[var(--leaf-text-muted)] mt-0.5">
                  @{profile.username} · 注册于 {new Date(profile.created_at).toLocaleDateString('zh-CN')}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toggleRole(profile)}
            >
              切换为 {profile.role === 'admin' ? 'user' : 'admin'}
            </Button>
          </div>
        ))}

        {profiles.length === 0 && (
          <div className="text-center py-12 text-[var(--leaf-text-muted)]">
            暂无用户
          </div>
        )}
      </div>
    </div>
  );
}
