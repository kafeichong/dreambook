import { useLayoutEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import gsap from 'gsap'
import { ParticleBackground } from '@components/ParticleBackground'
import { SearchBox } from '@components/SearchBox'
import { DreamSceneCard } from '@components/DreamSceneCard'
import { useDreamData } from '@hooks/index'
import { getAssetPath } from '@utils/assetPath'
import type { Dream } from '../../types/dream'
import styles from './NavigationPage.module.css'

export const NavigationPage: React.FC = () => {
  const navigate = useNavigate()
  const { data, loading, error } = useDreamData()
  const homeButtonRef = useRef<HTMLButtonElement>(null)
  const aiButtonRef = useRef<HTMLButtonElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const searchSectionRef = useRef<HTMLDivElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  const handleSearch = (query: string) => {
    console.log('搜索梦境:', query)
    // 跳转到 AI 解梦页面，并传递问题
    navigate('/ai-chat', { state: { question: query } })
  }

  useLayoutEffect(() => {
    if (!data) return

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

      // CSS 已经设置了初始状态，这里直接动画到最终状态
      // 顺序动画
      tl.to([homeButtonRef.current, aiButtonRef.current], {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.1
      })
      .to(titleRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.8
      }, '-=0.4')
      .to(searchSectionRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        scale: 1,
        transformOrigin: 'center center'
      }, '-=0.5')
      .to(subtitleRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.6
      }, '-=0.4')

      // 卡片阶梯动画 - CSS 已经设置了初始状态
      const cards = gridRef.current?.querySelectorAll('[data-card]')
      if (cards) {
        gsap.to(cards, {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          stagger: {
            each: 0.08,
            from: 'start'
          },
          ease: 'back.out(1.2)'
        })
      }
    })

    return () => ctx.revert()
  }, [data])

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
          <h1 ref={titleRef} className={styles.title}>描述你的梦境</h1>
        </header>

        {/* 搜索框 */}
        <div ref={searchSectionRef} className={styles.searchSection}>
          <SearchBox onSearch={handleSearch} />
        </div>

        {/* 提示文字 */}
        <p ref={subtitleRef} className={styles.subtitle}>
          最近做过什么梦？十个梦境场景测出你目前的心理状态
        </p>

        {/* 梦境场景卡片网格 */}
        <div ref={gridRef} className={styles.grid}>
          {data.dreams.map((dream: Dream, index: number) => (
            <div key={dream.id} data-card>
              <DreamSceneCard
                id={dream.id}
                number={parseInt(dream.id)}
                title={dream.title}
                mainTitle={dream.mainTitle}
                displaySubtitle={dream.displaySubtitle}
                image={getAssetPath(`/assets/backgrounds/${dream.id}_bg.webp`)}
                onClick={() => navigate(`/dream/${dream.id}`)}
                animationDelay={index * 0.1}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
