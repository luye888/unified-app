import { supabase } from './supabase'

export async function getSettings(): Promise<{
  site_title: string
  bio: string
  social_links: Record<string, string>
}> {
  const { data, error } = await supabase
    .from('site_settings')
    .select('key, value')

  if (error) throw error

  const settings: Record<string, unknown> = {}
  for (const row of data ?? []) {
    settings[row.key] = row.value
  }

  return {
    site_title: (settings.site_title as string) ?? '',
    bio: (settings.bio as string) ?? '',
    social_links: (settings.social_links as Record<string, string>) ?? {},
  }
}

export async function updateSetting(key: string, value: unknown) {
  const { error } = await supabase
    .from('site_settings')
    .upsert(
      { key, value, updated_at: new Date().toISOString() },
      { onConflict: 'key' }
    )

  if (error) throw error
}
