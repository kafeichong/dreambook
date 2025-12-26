import { useEffect, useRef } from 'react'
import { getAssetPath } from '@utils/assetPath'
import styles from './UnderwaterGodRaysBackground.module.css'

interface UnderwaterGodRaysBackgroundProps {
  backgroundImage: string
  videoSrc?: string
  videoOpacity?: number
  particleCount?: number
}

export const UnderwaterGodRaysBackground: React.FC<UnderwaterGodRaysBackgroundProps> = ({
  backgroundImage,
  videoSrc,
  videoOpacity = 0.6,
  particleCount = 30
}) => {
  // 如果没有提供 videoSrc，使用默认路径并处理
  const finalVideoSrc = videoSrc || getAssetPath('/assets/videos/underwater-godrays.mp4')
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // 设置 canvas 尺寸
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // 粒子系统
    interface Particle {
      x: number
      y: number
      size: number
      speedX: number
      speedY: number
      opacity: number
      phase: number
      phaseSpeed: number
    }

    const particles: Particle[] = []

    // 创建粒子
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: 2 + Math.random() * 3,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.3,
        opacity: 0.3 + Math.random() * 0.4,
        phase: Math.random() * Math.PI * 2,
        phaseSpeed: 0.02 + Math.random() * 0.03
      })
    }

    // 动画循环
    let animationId: number
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // 更新和绘制粒子
      particles.forEach(particle => {
        // 更新位置
        particle.x += particle.speedX
        particle.y += particle.speedY

        // 边界处理
        if (particle.x < 0) particle.x = canvas.width
        if (particle.x > canvas.width) particle.x = 0
        if (particle.y < 0) particle.y = canvas.height
        if (particle.y > canvas.height) particle.y = 0

        // 闪烁效果
        particle.phase += particle.phaseSpeed
        const alpha = particle.opacity * (0.6 + 0.4 * Math.sin(particle.phase))

        // 绘制粒子（光斑）
        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.size * 3
        )
        gradient.addColorStop(0, `rgba(200, 230, 255, ${alpha})`)
        gradient.addColorStop(0.5, `rgba(150, 200, 255, ${alpha * 0.5})`)
        gradient.addColorStop(1, `rgba(100, 180, 255, 0)`)

        ctx.fillStyle = gradient
        ctx.fillRect(
          particle.x - particle.size * 3,
          particle.y - particle.size * 3,
          particle.size * 6,
          particle.size * 6
        )
      })

      animationId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [particleCount])

  // 视频加载和播放
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(err => {
        console.error('Video autoplay failed:', err)
      })
    }
  }, [])

  return (
    <div ref={containerRef} className={styles.underwaterGodRaysBackground}>
      {/* 背景图片 */}
      <div
        className={styles.backgroundImage}
        style={{ backgroundImage: `url(${backgroundImage})` }}
      />

      {/* 水下光束视频 */}
      <video
        ref={videoRef}
        className={styles.godRaysVideo}
        style={{ opacity: videoOpacity }}
        src={finalVideoSrc}
        loop
        muted
        playsInline
        autoPlay
      />

      {/* 粒子层 */}
      <canvas ref={canvasRef} className={styles.particlesCanvas} />
    </div>
  )
}
