import { useNavigate } from 'react-router-dom'
import { useEffect, useLayoutEffect, useState, useRef } from 'react'
import { ParticleBackground } from '@components/ParticleBackground'
// import { InteractiveLogo } from '@components/InteractiveLogo'
import gsap from 'gsap'
import { getAssetPath } from '@utils/assetPath'
import styles from './HomePage.module.css'

export const HomePage: React.FC = () => {
  const navigate = useNavigate()
  const [scale, setScale] = useState(1)
  const logoRef = useRef<HTMLImageElement>(null)
  const titleRef = useRef<HTMLImageElement>(null)
  const descriptionRef = useRef<HTMLParagraphElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)
  const highlightRef = useRef<HTMLParagraphElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const updateScale = () => {
      const designWidth = 1920
      const designHeight = 1080
      const scaleX = window.innerWidth / designWidth
      const scaleY = window.innerHeight / designHeight
      const newScale = Math.min(scaleX, scaleY)
      setScale(newScale)
    }

    updateScale()
    window.addEventListener('resize', updateScale)
    return () => window.removeEventListener('resize', updateScale)
  }, [])

  // Logo 入场动画 - 使用 useLayoutEffect 确保在绘制前设置好状态
  useLayoutEffect(() => {
    if (logoRef.current) {
      // CSS 已经设置了初始状态，这里直接动画到最终状态
      gsap.to(logoRef.current, {
        scale: 1,
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        duration: 2.0,
        ease: 'power2.out',
        delay: 0.3,
      })
    }
  }, [])

  // 右侧内容依次入场动画 - 使用 useLayoutEffect 确保在绘制前设置好状态
  useLayoutEffect(() => {
    const elements = [
      titleRef.current,
      descriptionRef.current,
      subtitleRef.current,
      highlightRef.current,
      buttonRef.current,
    ].filter(Boolean)

    if (elements.length > 0) {
      // CSS 已经设置了初始状态，这里直接动画到最终状态
      gsap.to(elements, {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        duration: 1.8,
        ease: 'power2.out',
        stagger: 0.3, // 每个元素间隔 0.3 秒依次出现
        delay: 0.5,
      })
    }
  }, [])

  const handleClick = () => {
    navigate('/navigation')
  }

  return (
    <div className={styles.homePage}>
      <ParticleBackground
        backgroundImage={getAssetPath('/assets/backgrounds/index_bg.webp')}
        particleCount={150}
        particleColor="hsl(180, 100%, 80%)"
      />

      <div className={styles.contentWrapper} style={{ transform: `scale(${scale})` }}>
        {/* 左侧：Logo */}
        <div className={styles.leftSection}>
          <img ref={logoRef} src={getAssetPath('/assets/logo.png')} alt="情绪星球" className={styles.logo} />
        </div>

        {/* 右侧：标题和文字 */}
        <div className={styles.rightSection}>
          <img ref={titleRef} src={getAssetPath('/assets/title.png')} alt="标题" className={styles.titleImage} />

          <p ref={descriptionRef} className={styles.description}>
            那些在醒来后迅速消散的梦境，并非虚无。
            <br />
            它们是内心深处泛起的涟漪，是身体向我们发出的古老信号。
          </p>

          <p ref={subtitleRef} className={styles.subtitle}>
            在这里，你可以：
            <br />
            选择一个萦绕心头的梦境，聆听它诉说的现代心语——关于你的渴望、担忧与成长。
          </p>

          <p ref={highlightRef} className={styles.highlight}>
            一分钟，读懂梦的"弦外之音"。
            <br />
            快来与你的潜意识对个话，发现梦境的终极奥秘！
          </p>

          <button ref={buttonRef} className={styles.startButton} onClick={handleClick}>
            点击开始梦境解码
          </button>
        </div>
      </div>
    </div>
  )
}
