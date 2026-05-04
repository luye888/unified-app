'use client'

import { useEffect, useRef } from 'react'

export function MouseGlow() {
  const glowRef = useRef<HTMLDivElement>(null)
  const pos = useRef({ x: 0, y: 0 })
  const target = useRef({ x: 0, y: 0 })

  useEffect(() => {
    function onMove(e: MouseEvent) {
      target.current = { x: e.clientX, y: e.clientY }
    }

    function animate() {
      pos.current.x += (target.current.x - pos.current.x) * 0.08
      pos.current.y += (target.current.y - pos.current.y) * 0.08

      if (glowRef.current) {
        glowRef.current.style.left = `${pos.current.x}px`
        glowRef.current.style.top = `${pos.current.y}px`
      }
      requestAnimationFrame(animate)
    }

    window.addEventListener('mousemove', onMove)
    const id = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(id)
    }
  }, [])

  return <div ref={glowRef} className="mouse-glow" />
}
