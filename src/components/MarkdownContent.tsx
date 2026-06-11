'use client'

import { sanitizeHtml } from '@/lib/sanitize'

export default function MarkdownContent({ html }: { html: string }) {
  return (
    <div
      className="prose prose-lg dark:prose-invert max-w-none"
      dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }}
    />
  )
}
