import { useEffect, useRef } from 'react'
import styles from './Background.module.css'

interface BackgroundProps {
  gradient: string
  particleColor: string
  particleSpeed: number
  particleDirection: 'up' | 'down' | 'random'
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  opacity: number
}

export const Background: React.FC<BackgroundProps> = ({
  gradient,
  particleColor,
  particleSpeed,
  particleDirection
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const animationFrameRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // 设置 canvas 尺寸为窗口大小
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // 初始化粒子
    const initParticles = () => {
      const particleCount = 50 // Canvas 2D 模式使用较少粒子
      particlesRef.current = []

      for (let i = 0; i < particleCount; i++) {
        particlesRef.current.push(createParticle())
      }
    }

    // 创建单个粒子
    const createParticle = (): Particle => {
      const radius = Math.random() * 2 + 1
      const x = Math.random() * canvas.width
      const y = Math.random() * canvas.height

      let vx = 0
      let vy = 0

      switch (particleDirection) {
        case 'up':
          vy = -particleSpeed * (Math.random() * 0.5 + 0.5)
          vx = (Math.random() - 0.5) * 0.2
          break
        case 'down':
          vy = particleSpeed * (Math.random() * 0.5 + 0.5)
          vx = (Math.random() - 0.5) * 0.2
          break
        case 'random':
          vx = (Math.random() - 0.5) * particleSpeed
          vy = (Math.random() - 0.5) * particleSpeed
          break
      }

      return {
        x,
        y,
        vx,
        vy,
        radius,
        opacity: Math.random() * 0.5 + 0.3
      }
    }

    // 更新粒子位置
    const updateParticles = () => {
      particlesRef.current.forEach(particle => {
        particle.x += particle.vx
        particle.y += particle.vy

        // 粒子循环（边界检测）
        if (particle.x < 0) particle.x = canvas.width
        if (particle.x > canvas.width) particle.x = 0
        if (particle.y < 0) particle.y = canvas.height
        if (particle.y > canvas.height) particle.y = 0

        // 轻微闪烁效果
        particle.opacity += (Math.random() - 0.5) * 0.02
        particle.opacity = Math.max(0.1, Math.min(0.8, particle.opacity))
      })
    }

    // 渲染粒子
    const renderParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particlesRef.current.forEach(particle => {
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2)

        // 解析粒子颜色并应用透明度
        const color = particleColor.startsWith('#')
          ? hexToRgb(particleColor)
          : particleColor

        if (color.startsWith('rgb')) {
          const rgb = color.match(/\d+/g)
          if (rgb) {
            ctx.fillStyle = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${particle.opacity})`
          }
        } else {
          ctx.fillStyle = particleColor
        }

        ctx.fill()
      })
    }

    // 十六进制转 RGB
    const hexToRgb = (hex: string): string => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
      return result
        ? `rgb(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)})`
        : 'rgb(255, 255, 255)'
    }

    // 动画循环
    const animate = () => {
      updateParticles()
      renderParticles()
      animationFrameRef.current = requestAnimationFrame(animate)
    }

    initParticles()
    animate()

    // 清理
    return () => {
      window.removeEventListener('resize', resizeCanvas)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [gradient, particleColor, particleSpeed, particleDirection])

  return (
    <div className={styles.background} style={{ background: gradient }}>
      <canvas ref={canvasRef} className={styles.canvas} />
    </div>
  )
}
