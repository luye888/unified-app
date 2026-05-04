'use client'

import { useEffect, useState } from 'react'

export function TypewriterText({ text, className }: { text: string; className?: string }) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    let i = 0
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayed(text.slice(0, i + 1))
        i++
      } else {
        setDone(true)
        clearInterval(timer)
      }
    }, 100)
    return () => clearInterval(timer)
  }, [text])

  return (
    <span className={className}>
      {displayed}
      {!done && <span className="typewriter-cursor">&nbsp;</span>}
    </span>
  )
}
