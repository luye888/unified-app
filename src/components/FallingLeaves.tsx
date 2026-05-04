'use client'

import { useEffect, useRef } from 'react'

interface Leaf {
  x: number
  y: number
  size: number
  speedX: number
  speedY: number
  rotation: number
  rotationSpeed: number
  opacity: number
  variant: number
}

const LEAF_PATHS = [
  // 叶形 1: 椭圆叶
  (ctx: CanvasRenderingContext2D, s: number) => {
    ctx.beginPath()
    ctx.ellipse(0, 0, s * 0.4, s, 0, 0, Math.PI * 2)
    ctx.fill()
  },
  // 叶形 2: 心形叶
  (ctx: CanvasRenderingContext2D, s: number) => {
    ctx.beginPath()
    ctx.moveTo(0, -s * 0.8)
    ctx.bezierCurveTo(s * 0.6, -s * 1.2, s * 0.8, -s * 0.2, 0, s * 0.6)
    ctx.bezierCurveTo(-s * 0.8, -s * 0.2, -s * 0.6, -s * 1.2, 0, -s * 0.8)
    ctx.fill()
  },
  // 叶形 3: 细长叶
  (ctx: CanvasRenderingContext2D, s: number) => {
    ctx.beginPath()
    ctx.moveTo(0, -s)
    ctx.quadraticCurveTo(s * 0.5, 0, 0, s)
    ctx.quadraticCurveTo(-s * 0.5, 0, 0, -s)
    ctx.fill()
  },
]

function createLeaf(width: number, height: number): Leaf {
  return {
    x: Math.random() * width,
    y: Math.random() * height * -1 - 50,
    size: 8 + Math.random() * 12,
    speedX: (Math.random() - 0.5) * 0.5,
    speedY: 0.3 + Math.random() * 0.7,
    rotation: Math.random() * Math.PI * 2,
    rotationSpeed: (Math.random() - 0.5) * 0.02,
    opacity: 0.15 + Math.random() * 0.2,
    variant: Math.floor(Math.random() * LEAF_PATHS.length),
  }
}

export function FallingLeaves() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationId: number
    let leaves: Leaf[] = []
    const COUNT = window.innerWidth < 768 ? 15 : 35

    function resize() {
      canvas!.width = window.innerWidth
      canvas!.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    for (let i = 0; i < COUNT; i++) {
      const leaf = createLeaf(canvas.width, canvas.height)
      leaf.y = Math.random() * canvas.height
      leaves.push(leaf)
    }

    function draw() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height)

      for (const leaf of leaves) {
        leaf.x += leaf.speedX + Math.sin(leaf.y * 0.005) * 0.3
        leaf.y += leaf.speedY
        leaf.rotation += leaf.rotationSpeed

        if (leaf.y > canvas!.height + 50) {
          leaf.y = -50
          leaf.x = Math.random() * canvas!.width
        }
        if (leaf.x < -50) leaf.x = canvas!.width + 50
        if (leaf.x > canvas!.width + 50) leaf.x = -50

        ctx!.save()
        ctx!.translate(leaf.x, leaf.y)
        ctx!.rotate(leaf.rotation)
        ctx!.globalAlpha = leaf.opacity
        ctx!.fillStyle = leaf.variant % 2 === 0 ? '#5eba8a' : '#6ee7c0'
        LEAF_PATHS[leaf.variant](ctx!, leaf.size)
        ctx!.restore()
      }

      animationId = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: -1 }}
    />
  )
}
