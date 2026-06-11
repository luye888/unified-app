'use client'

import { useEffect, useState } from 'react'
import { sanitizeHtml } from '@/lib/sanitize'

export default function MarkdownContent({ content }: { content: string }) {
  const [html, setHtml] = useState('')

  useEffect(() => {
    import('marked').then(({ marked }) => {
      setHtml(sanitizeHtml(marked.parse(content) as string))
    })
  }, [content])

  return (
    <div
      className="prose prose-lg dark:prose-invert max-w-none"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
