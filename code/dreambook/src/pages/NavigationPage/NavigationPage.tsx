import { useLayoutEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import gsap from 'gsap'
import { ParticleBackground } from '@components/ParticleBackground'
import { DreamCarousel } from '@components/DreamCarousel'
import { useDreamData } from '@hooks/index'
import { getAssetPath } from '@utils/assetPath'
import styles from './NavigationPage.module.css'

export const NavigationPage: React.FC = () => {
  const navigate = useNavigate()
  const { data, loading, error } = useDreamData()
  const homeButtonRef = useRef<HTMLButtonElement>(null)
  const aiButtonRef = useRef<HTMLButtonElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)
  const carouselRef = useRef<HTMLDivElement>(null)
  const carouselFooterRef = useRef<HTMLDivElement>(null)
  const navigatorRef = useRef<HTMLDivElement>(null)
  const qrSectionRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (!data) return

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

      // 返回首页按钮 - 从右上角滑入
      tl.to(homeButtonRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.6
      }, 0)

      // 标题 - 从上方淡入并下滑
      .to(titleRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.8
      }, 0.2)

      // 副标题 - 从上方淡入并下滑
      .to(subtitleRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.8
      }, 0.3)

      // 轮播 - 从下方淡入并上滑
      .to(carouselRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.8
      }, 0.4)

      // 轮播下方提示 - 从下方淡入并上滑
      .to(carouselFooterRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.6
      }, 0.6)

      // 相似梦境导航 - 从下方淡入并上滑
      .to(navigatorRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.6
      }, 0.7)

      // 二维码区域 - 从下方淡入并上滑
      .to(qrSectionRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.6
      }, 0.8)
    })

    return () => ctx.revert()
  }, [data])

  const handlePreviousDream = () => {
    // 查找轮播容器中的上一个按钮
    const carouselWrapper = document.querySelector('[data-testid="dream-carousel"]')
    if (carouselWrapper) {
      const prevButton = carouselWrapper.querySelector('button[aria-label="上一个"]') as HTMLButtonElement
      prevButton?.click()
    }
  }

  const handleNextDream = () => {
    // 查找轮播容器中的下一个按钮
    const carouselWrapper = document.querySelector('[data-testid="dream-carousel"]')
    if (carouselWrapper) {
      const nextButton = carouselWrapper.querySelector('button[aria-label="下一个"]') as HTMLButtonElement
      nextButton?.click()
    }
  }

  if (loading) {
    return (
      <div className={styles.navigationPage}>
        <ParticleBackground
          backgroundImage={getAssetPath('/assets/backgrounds/index_bg.webp')}
          particleCount={150}
          particleColor="hsl(180, 100%, 80%)"
        />
        <div className={styles.loading}>加载中...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.navigationPage}>
        <ParticleBackground
          backgroundImage={getAssetPath('/assets/backgrounds/index_bg.webp')}
          particleCount={150}
          particleColor="hsl(180, 100%, 80%)"
        />
        <div className={styles.error}>加载失败: {error.message}</div>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className={styles.navigationPage}>
      <ParticleBackground
        backgroundImage={getAssetPath('/assets/backgrounds/index_bg.webp')}
        particleCount={150}
        particleColor="hsl(180, 100%, 80%)"
      />

      <div className={styles.container}>
        {/* 返回首页按钮 */}
        <button ref={homeButtonRef} className={styles.homeButton} onClick={() => navigate('/')}>
          <svg className={styles.homeIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <polyline points="9 22 9 12 15 12 15 22" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          返回首页
        </button>

        {/* AI 解梦按钮 */}
        {/* <button ref={aiButtonRef} className={styles.aiButton} onClick={() => navigate('/ai-chat')}>
          <svg className={styles.aiIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M8 10h.01M12 10h.01M16 10h.01" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          AI 解梦
        </button> */}

        {/* 标题区域 */}
        <header className={styles.header}>
          <h1 ref={titleRef} className={styles.title}>最近做过什么梦？</h1>
        </header>

        {/* 提示文字 */}
        <p ref={subtitleRef} className={styles.subtitle}>
          十二种常见梦境场景测出你目前的心理状态
        </p>

        {/* 轮播组件 */}
        <div ref={carouselRef} style={{ opacity: 0, transform: 'translateY(30px)' }}>
          <DreamCarousel
            dreams={data.dreams}
            onDreamSelect={(dreamId) => navigate(`/dream/${dreamId}`)}
            animationDelay={0.5}
          />
        </div>

      

        {/* 选择相似梦境导航区域 */}
        <div ref={navigatorRef} className={styles.similarDreamNavigator} style={{ opacity: 0, transform: 'translateY(30px)' }}>
          <button
            className={`${styles.navArrowButton} ${styles.leftArrow}`}
            onClick={handlePreviousDream}
            aria-label="上一个梦境"
          >
            <svg viewBox="0 0 36 63" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 4L31.381 31.381C31.7716 31.7716 31.7716 32.4047 31.381 32.7953L5.86299 58.3133" stroke="white" strokeOpacity="0.7" strokeWidth="8" strokeLinecap="round"/>
            </svg>
          </button>

          <div className={styles.navigatorText}>
            <p>点击选择相似梦境</p>
          </div>

          <button
            className={`${styles.navArrowButton} ${styles.rightArrow}`}
            onClick={handleNextDream}
            aria-label="下一个梦境"
          >
            <svg viewBox="0 0 36 63" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 4L31.381 31.381C31.7716 31.7716 31.7716 32.4047 31.381 32.7953L5.86299 58.3133" stroke="white" strokeOpacity="0.7" strokeWidth="8" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* 底部二维码区域 */}
        <div ref={qrSectionRef} className={styles.qrSection} style={{ opacity: 0, transform: 'translateY(30px)' }}>
          <div className={styles.qrContainer}>
            <div className={styles.qrCodeWrapper}>
              <img src={getAssetPath('/ercode.png')} alt="QR Code" className={styles.qrCode} />
            </div>
            <div className={styles.qrText}>
            <img src={getAssetPath('/ercodetop.svg')} alt="QR Icon" className={styles.qrIcon} />

              <p className={styles.qrTitle}>扫描二维码进入"AI解梦"</p>
              <p className={styles.qrDesc}>为你解读更多梦境场景</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
