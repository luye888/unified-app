'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getSettings, updateSetting } from '@/lib/settings'

export default function AdminSettingsPage() {
  const [siteTitle, setSiteTitle] = useState('')
  const [bio, setBio] = useState('')
  const [github, setGithub] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const settings = await getSettings()
        setSiteTitle(settings.site_title)
        setBio(settings.bio)
        setGithub(settings.social_links.github ?? '')
      } catch (error) {
        console.error('Failed to load settings:', error)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  async function handleSave() {
    setSaving(true)
    setMessage('')
    try {
      await Promise.all([
        updateSetting('site_title', siteTitle),
        updateSetting('bio', bio),
        updateSetting('social_links', { github }),
      ])
      setMessage('保存成功')
    } catch (error) {
      console.error('Failed to save settings:', error)
      setMessage('保存失败')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12 text-[var(--leaf-text-muted)]">
        加载中...
      </div>
    )
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h2 className="text-lg font-semibold text-[var(--leaf-text)]">站点设置</h2>

      <div className="glass-card rounded-xl p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-[var(--leaf-text)] mb-1.5">
            站点标题
          </label>
          <Input
            value={siteTitle}
            onChange={(e) => setSiteTitle(e.target.value)}
            placeholder="站点标题"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--leaf-text)] mb-1.5">
            个人简介
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="个人简介"
            rows={4}
            className="w-full rounded-md border border-[var(--leaf-border)] bg-[var(--leaf-surface)] px-3 py-2 text-sm text-[var(--leaf-text)] placeholder:text-[var(--leaf-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--leaf-primary)]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--leaf-text)] mb-1.5">
            GitHub
          </label>
          <Input
            value={github}
            onChange={(e) => setGithub(e.target.value)}
            placeholder="https://github.com/username"
          />
        </div>

        <div className="flex items-center gap-4">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? '保存中...' : '保存'}
          </Button>
          {message && (
            <span className="text-sm text-[var(--leaf-text-muted)]">{message}</span>
          )}
        </div>
      </div>
    </div>
  )
}
