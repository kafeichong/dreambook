import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { getAssetPath } from '@utils/assetPath'
import styles from './FlyingDreamBackground.module.css'

interface FlyingDreamBackgroundProps {
  backgroundImage: string
  particleCount?: number
}


export const FlyingDreamBackground: React.FC<FlyingDreamBackgroundProps> = ({
  backgroundImage,
  particleCount = 50
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // 原始背景图尺寸
  const BG_WIDTH = 2560
  const BG_HEIGHT = 1440

  // 将像素坐标转换为百分比（基于2560×1440原图）
  const toPercent = (x: number, y: number) => ({
    x: (x / BG_WIDTH) * 100,
    y: (y / BG_HEIGHT) * 100
  })

  // 定义所有抠图元素及其位置（原始像素坐标）
  const elementsData = [
    // 枕头（靠后，移动慢）
    { name: 'zt01', src: getAssetPath('/assets/06/zt01.webp'), x: 0, y: 302, scale: 1, floatRange: 20, floatSpeed: 3 },
    { name: 'zt02', src: getAssetPath('/assets/06/zt02.webp'), x: 210, y: 480, scale: 1, floatRange: 25, floatSpeed: 3.5 },

    // 山/漂浮岛（最远景，移动最慢）
    { name: 'shan01', src: getAssetPath('/assets/06/shan01.webp'), x: 640, y: 220, scale: 1, floatRange: 15, floatSpeed: 5 },
    { name: 'shan02', src: getAssetPath('/assets/06/shan02.webp'), x: 1618, y: -50, scale: 1, floatRange: 12, floatSpeed: 6 },

    // 书（中景，移动速度中等）
    { name: 'book01', src: getAssetPath('/assets/06/book01.webp'), x: 220, y: -60, scale: 1, floatRange: 30, floatSpeed: 2.5, rotation: 5 },
    { name: 'book02', src: getAssetPath('/assets/06/book02.webp'), x: 2110, y: 220, scale: 1, floatRange: 35, floatSpeed: 2.8, rotation: -8 },
    { name: 'book03', src: getAssetPath('/assets/06/book03.webp'), x: 1727, y: 587, scale: 1, floatRange: 28, floatSpeed: 3.2, rotation: 12 },
    { name: 'book04', src: getAssetPath('/assets/06/book04.webp'), x: 562, y: 744, scale: 1, floatRange: 32, floatSpeed: 2.6, rotation: -5 },

    // 人物（主角，前景，移动最明显）
    { name: 'person', src: getAssetPath('/assets/06/person.webp'), x: 1015, y: 364, scale: 1, floatRange: 40, floatSpeed: 2 }
  ]

  // 转换为百分比坐标的元素列表
  const elements = elementsData.map(el => {
    const position = toPercent(el.x, el.y)
    // 如果元素在顶部（y < 50px），给它一个向下的初始偏移
    // 这样动画可以向上飘到设计位置，而不会向上超出屏幕
    if (el.y < 50) {
      // 将 floatRange 像素转换为百分比偏移
      const offsetPercent = (el.floatRange! / BG_HEIGHT) * 100
      position.y = position.y + offsetPercent
    }
    return {
      ...el,
      position
    }
  })

  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current

    // 计算统一的缩放比例：屏幕宽度 / 设计稿宽度
    const scaleRatio = window.innerWidth / BG_WIDTH

    // 为每个元素创建漂浮动画
    elements.forEach((element, index) => {
      const img = container.querySelector(`[data-element="${element.name}"]`) as HTMLElement
      if (!img) return

      const finalScale = scaleRatio * (element.scale || 1)

      // 垂直漂浮动画
      const isAtTop = element.y < 50
      if (isAtTop) {
        // 顶部元素：从向下偏移位置向上飘到原始设计位置
        // CSS已经给了向下偏移，GSAP从-floatRange（向上）飘到0（原位）
        gsap.fromTo(img,
          { y: -element.floatRange },
          {
            y: 0,
            duration: element.floatSpeed || 3,
            ease: 'sine.inOut',
            repeat: -1,
            yoyo: true,
            delay: index * 0.3
          }
        )
      } else {
        // 非顶部元素：正常双向漂浮
        gsap.to(img, {
          y: `+=${element.floatRange}`,
          duration: element.floatSpeed || 3,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
          delay: index * 0.3
        })
      }

      // 水平轻微摆动
      gsap.to(img, {
        x: `+=${element.floatRange! * 0.3}`,
        duration: (element.floatSpeed || 3) * 1.5,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        delay: index * 0.2
      })

      // 书籍的旋转动画
      if (element.rotation !== undefined) {
        gsap.to(img, {
          rotation: `+=${element.rotation}`,
          duration: (element.floatSpeed || 3) * 2,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
          delay: index * 0.4
        })
      }

      // 入场动画 - 从透明缩小状态动画到完全显示
      gsap.fromTo(img,
        {
          opacity: 0,
          scale: finalScale * 0.8
        },
        {
          opacity: 1,
          scale: finalScale,
          duration: 1,
          ease: 'back.out(1.7)',
          delay: index * 0.15
        }
      )
    })

    // 粒子系统（星星）
    if (canvasRef.current) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const resizeCanvas = () => {
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
      }
      resizeCanvas()
      window.addEventListener('resize', resizeCanvas)

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

      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: 1 + Math.random() * 2,
          speedX: (Math.random() - 0.5) * 0.3,
          speedY: (Math.random() - 0.5) * 0.2,
          opacity: 0.3 + Math.random() * 0.5,
          phase: Math.random() * Math.PI * 2,
          phaseSpeed: 0.02 + Math.random() * 0.03
        })
      }

      let animationId: number
      const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        particles.forEach(particle => {
          particle.x += particle.speedX
          particle.y += particle.speedY

          if (particle.x < 0) particle.x = canvas.width
          if (particle.x > canvas.width) particle.x = 0
          if (particle.y < 0) particle.y = canvas.height
          if (particle.y > canvas.height) particle.y = 0

          particle.phase += particle.phaseSpeed
          const alpha = particle.opacity * (0.5 + 0.5 * Math.sin(particle.phase))

          // 绘制星星
          ctx.beginPath()
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(255, 255, 220, ${alpha})`
          ctx.fill()

          // 星星闪光效果
          if (alpha > 0.7) {
            const gradient = ctx.createRadialGradient(
              particle.x, particle.y, 0,
              particle.x, particle.y, particle.size * 3
            )
            gradient.addColorStop(0, `rgba(255, 255, 255, ${alpha * 0.5})`)
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
            ctx.fillStyle = gradient
            ctx.fillRect(
              particle.x - particle.size * 3,
              particle.y - particle.size * 3,
              particle.size * 6,
              particle.size * 6
            )
          }
        })

        animationId = requestAnimationFrame(animate)
      }

      animate()

      return () => {
        cancelAnimationFrame(animationId)
        window.removeEventListener('resize', resizeCanvas)
      }
    }
  }, [particleCount])

  return (
    <div ref={containerRef} className={styles.flyingDreamBackground}>
      {/* 背景图片 */}
      <div
        className={styles.backgroundImage}
        style={{ backgroundImage: `url(${backgroundImage})` }}
      />

      {/* 粒子层（星星） */}
      <canvas ref={canvasRef} className={styles.particlesCanvas} />

      {/* 所有抠图元素 */}
      {elements.map((element) => {
        // 计算缩放比例：当前窗口宽度 / 设计稿宽度
        const scaleRatio = window.innerWidth / BG_WIDTH
        const finalScale = scaleRatio * (element.scale || 1)  // 0.5 是微调系数

        return (
          <img
            key={element.name}
            data-element={element.name}
            src={element.src}
            alt={element.name}
            className={styles.floatingElement}
            style={{
              left: `${element.position.x}%`,
              top: `${element.position.y}%`,
              transform: `scale(${finalScale})`
            }}
          />
        )
      })}
    </div>
  )
}
