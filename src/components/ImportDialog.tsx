'use client';

import { useState, useRef } from 'react';
import { generateStructuredNote } from '@/lib/content-organizer';

interface ImportResult {
  title: string;
  content: string;
  summary: string;
  tags: string[];
}

interface ImportDialogProps {
  onImport: (data: ImportResult) => void;
}

export default function ImportDialog({ onImport }: ImportDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function parseFrontmatter(text: string): { meta: Record<string, string>; body: string } {
    const fmMatch = text.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
    if (!fmMatch) return { meta: {}, body: text };

    const meta: Record<string, string> = {};
    fmMatch[1].split('\n').forEach(line => {
      const idx = line.indexOf(':');
      if (idx > 0) {
        const key = line.slice(0, idx).trim();
        let value = line.slice(idx + 1).trim();
        // Strip quotes
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        meta[key] = value;
      }
    });
    return { meta, body: fmMatch[2].trim() };
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const text = await file.text();
      const { meta, body } = parseFrontmatter(text);

      const title = meta.title || file.name.replace(/\.(md|txt)$/i, '');
      const result = generateStructuredNote(title, body);

      const tags = meta.tags
        ? meta.tags.replace(/[\[\]]/g, '').split(',').map(t => t.trim()).filter(Boolean)
        : result.tags;

      onImport({
        title: result.title,
        content: result.content,
        summary: result.summary,
        tags,
      });

      setOpen(false);
    } catch (err) {
      console.error('Import failed:', err);
      alert('导入失败，请检查文件格式');
    } finally {
      setLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2 text-sm rounded-lg bg-[var(--leaf-primary)] text-white hover:opacity-90 transition-opacity"
      >
        导入笔记
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="glass-card rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-[var(--leaf-text)] mb-4">导入笔记</h3>
            <p className="text-sm text-[var(--leaf-text-muted)] mb-4">
              支持 .md 和 .txt 文件。如果文件包含 frontmatter，将自动解析标题和标签。
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept=".md,.txt"
              onChange={handleFileSelect}
              className="block w-full text-sm text-[var(--leaf-text-muted)]
                file:mr-4 file:py-2 file:px-4
                file:rounded-lg file:border-0
                file:text-sm file:font-medium
                file:bg-[var(--leaf-primary)] file:text-white
                hover:file:opacity-90
                file:cursor-pointer"
            />

            {loading && (
              <p className="text-sm text-[var(--leaf-primary)] mt-3">正在处理文件...</p>
            )}

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2 text-sm rounded-lg border border-[var(--leaf-border)] text-[var(--leaf-text-muted)] hover:text-[var(--leaf-text)] transition-colors"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
