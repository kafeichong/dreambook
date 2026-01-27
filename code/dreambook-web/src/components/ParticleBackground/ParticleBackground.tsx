import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { getAssetPath } from '@utils/assetPath'
import styles from './ParticleBackground.module.css'

interface ParticleBackgroundProps {
  backgroundImage?: string
  particleCount?: number
  particleColor?: string
}

export const ParticleBackground: React.FC<ParticleBackgroundProps> = ({
  backgroundImage,
  particleCount = 200,
  particleColor = 'hsl(180, 100%, 80%)'
}) => {
  // 处理背景图路径：如果没有提供，使用默认路径；如果提供了，使用提供的路径（假设调用方已经处理过路径）
  const finalBackgroundImage = backgroundImage || getAssetPath('/assets/backgrounds/index_bg.webp')
  const containerRef = useRef<HTMLDivElement>(null)
  const particlesRef = useRef<HTMLDivElement[]>([])

  useEffect(() => {
    if (!containerRef.current) return

    // 使用 GSAP 创建粒子动画 - 风卷旋转效果
    particlesRef.current.forEach((particle) => {
      if (!particle) return

      const delay = Math.random() * 37
      const duration = 28 + Math.random() * 9
      const startX = Math.random() * 100
      const startY = 100 + Math.random() * 10
      const endY = -100 - Math.random() * 30

      // 旋转参数
      const spiralRadius = 10 + Math.random() * 20 // 螺旋半径（vw）
      const rotations = 2 + Math.random() * 3 // 旋转圈数
      const rotationDirection = Math.random() > 0.5 ? 1 : -1 // 随机旋转方向

      gsap.set(particle, {
        x: `${startX}vw`,
        y: `${startY}vh`,
        opacity: 0,
        rotation: 0
      })

      // 创建时间轴动画
      const tl = gsap.timeline({
        delay: delay,
        repeat: -1,
        onRepeat: () => {
          // 每次重复时随机化起始位置
          const newStartX = Math.random() * 100
          gsap.set(particle, {
            x: `${newStartX}vw`,
            y: `${startY}vh`,
            opacity: 0,
            rotation: 0
          })
        }
      })

      // 主要的螺旋上升动画
      tl.to(particle, {
        y: `${endY}vh`,
        opacity: 1,
        duration: duration,
        ease: 'none',
        onUpdate: function() {
          // 在上升过程中计算螺旋轨迹
          const progress = this.progress()
          const angle = progress * rotations * Math.PI * 2 * rotationDirection
          const currentRadius = spiralRadius * (1 - progress * 0.3) // 半径逐渐缩小
          const offsetX = Math.sin(angle) * currentRadius

          gsap.set(particle, {
            x: `${startX + offsetX}vw`
          })
        }
      })

      // 粒子自身旋转
      tl.to(particle, {
        rotation: 360 * rotations * rotationDirection,
        duration: duration,
        ease: 'none'
      }, 0)

      // 添加淡入淡出效果 - 随机参数让每个粒子独特
      const circle = particle.querySelector(`.${styles.circle}`)
      if (circle) {
        const fadeDelay = Math.random() * 8 // 0-8秒随机延迟
        const fadeDuration = 1.5 + Math.random() * 2.5 // 1.5-4秒随机时长
        const minOpacity = 0.4 + Math.random() * 0.3 // 0.4-0.7 随机最小透明度

        gsap.to(circle, {
          opacity: minOpacity,
          duration: fadeDuration,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: fadeDelay
        })
      }

      // 添加水平飘动效果（模拟风吹）
      gsap.to(particle, {
        x: `+=${5 + Math.random() * 10}vw`,
        duration: 8 + Math.random() * 6,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: Math.random() * 5
      })
    })
  }, [particleCount])

  // 生成粒子
  const particles = Array.from({ length: particleCount }, (_, index) => {
    const size = Math.random() * 8 + 2
    const scaleDelay = Math.random() * 4 // 缩放动画随机延迟 0-4秒
    const scaleDuration = 1.5 + Math.random() * 1.5 // 缩放动画随机时长 1.5-3秒

    return (
      <div
        key={index}
        ref={(el) => {
          if (el) particlesRef.current[index] = el
        }}
        className={styles.circleContainer}
        style={{
          width: `${size}px`,
          height: `${size}px`
        }}
      >
        <div
          className={styles.circle}
          style={{
            backgroundImage: `radial-gradient(${particleColor}, ${particleColor} 10%, transparent 56%)`,
            animationDelay: `${scaleDelay}s`,
            animationDuration: `${scaleDuration}s`
          }}
        />
      </div>
    )
  })

  return (
    <div ref={containerRef} className={styles.container}>
      {finalBackgroundImage && (
        <img
          src={finalBackgroundImage}
          alt="Background"
          className={styles.background}
        />
      )}
      {particles}
    </div>
  )
}
