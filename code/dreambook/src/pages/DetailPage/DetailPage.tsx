import { useLayoutEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import gsap from 'gsap'
import { ParticleBackground } from '@components/ParticleBackground'
import { WaterWaveBackground } from '@components/WaterWaveBackground'
import { UnderwaterGodRaysBackground } from '@components/UnderwaterGodRaysBackground'
import { FlyingDreamBackground } from '@components/FlyingDreamBackground'
import { useDreamData } from '@hooks/index'
import { getAssetPath } from '@utils/assetPath'
import type { Dream } from '../../types/dream'
import styles from './DetailPage.module.css'

export const DetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data, loading, error } = useDreamData()
  const titleRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  const dream = data?.dreams.find((d: Dream) => d.id === id)

  // 计算梦境索引（用于切换）
  const dreamIndex = dream ? parseInt(dream.id) - 1 : -1
  const totalDreams = data?.dreams.length || 0
  const hasPrevious = dreamIndex > 0
  const hasNext = dreamIndex < totalDreams - 1

  const handlePreviousDream = () => {
    if (hasPrevious) {
      const prevId = String(dreamIndex).padStart(2, '0')
      navigate(`/dream/${prevId}`)
    }
  }

  const handleNextDream = () => {
    if (hasNext) {
      const nextId = String(dreamIndex + 2).padStart(2, '0')
      navigate(`/dream/${nextId}`)
    }
  }

  useLayoutEffect(() => {
    if (!dream) return

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

      // CSS 已经设置了初始状态，这里直接动画到最终状态
      // 标题淡入
      tl.to(titleRef.current, {
        opacity: 1,
        x: 0,
        duration: 0.8
      })

      // 卡片从右侧滑入
      tl.to(cardRef.current, {
        opacity: 1,
        x: 0,
        duration: 1
      }, '-=0.5')

      // 内容淡入
      tl.to(contentRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.8
      }, '-=0.6')
    })

    return () => ctx.revert()
  }, [dream])

  if (loading) {
    return (
      <div className={styles.detailPage}>
        <ParticleBackground
          backgroundImage={getAssetPath('/assets/backgrounds/index_bg.webp')}
          particleCount={100}
          particleColor="hsl(180, 100%, 80%)"
        />
        <div className={styles.loading}>加载中...</div>
      </div>
    )
  }

  if (error || !dream) {
    return (
      <div className={styles.detailPage}>
        <ParticleBackground
          backgroundImage={getAssetPath('/assets/backgrounds/index_bg.webp')}
          particleCount={100}
          particleColor="hsl(180, 100%, 80%)"
        />
        <div className={styles.error}>
          {error ? `加载失败: ${error.message}` : '未找到梦境内容'}
        </div>
      </div>
    )
  }

  return (
    <div className={styles.detailPage}>
      {/* 背景 */}
      {dream.id === '12' ? (
        <WaterWaveBackground
          backgroundImage={getAssetPath(`/assets/backgrounds/${dream.id}_bg.webp`)}
          personImage={getAssetPath(`/assets/backgrounds/${dream.id}_bg_preson.png`)}
          maskImage={getAssetPath(`/assets/backgrounds/${dream.id}_mask.png`)}
          waterMapImage={getAssetPath('/assets/water/water-normal.jpg')}
          displacementScale={60}
          animationSpeed={{ x: 0.8, y: 0.5 }}
        />
      ) : dream.id === '07' ? (
        <UnderwaterGodRaysBackground
          backgroundImage={getAssetPath(`/assets/backgrounds/${dream.id}_bg.webp`)}
          videoSrc={getAssetPath('/assets/videos/underwater-godrays.mp4')}
          videoOpacity={.3}
          particleCount={30}
        />
      ) : dream.id === '06' ? (
        <FlyingDreamBackground
          backgroundImage={getAssetPath(`/assets/backgrounds/${dream.id}_bg.webp`)}
          particleCount={50}
        />
      ) : (
        <ParticleBackground
          backgroundImage={getAssetPath(`/assets/backgrounds/${dream.id}_bg.webp`)}
          particleCount={100}
          particleColor="hsl(180, 100%, 80%)"
        />
      )}

      <div className={styles.container}>
        {/* 左上角标题 */}
        <div ref={titleRef} className={styles.pageTitle}>
          <p>
            <span className={styles.mainTitle}>梦境解析 ｜</span>
            <span className={styles.subTitle}>{dream.id} {dream.mainTitle}（{dream.displaySubtitle}）</span>
          </p>
        </div>

        {/* 中间左右切换提示 */}
        <div className={styles.similarDreamNavigator}>
          <button
            className={`${styles.navArrowButton} ${styles.leftArrow} ${!hasPrevious ? styles.disabled : ''}`}
            onClick={handlePreviousDream}
            disabled={!hasPrevious}
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
            className={`${styles.navArrowButton} ${styles.rightArrow} ${!hasNext ? styles.disabled : ''}`}
            onClick={handleNextDream}
            disabled={!hasNext}
            aria-label="下一个梦境"
          >
            <svg viewBox="0 0 36 63" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 4L31.381 31.381C31.7716 31.7716 31.7716 32.4047 31.381 32.7953L5.86299 58.3133" stroke="white" strokeOpacity="0.7" strokeWidth="8" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* 右下角按钮组 */}
        <div className={styles.buttonGroup}>
          <button className={styles.backButton} onClick={() => navigate('/navigation')}>
            <svg className={styles.buttonIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M19 12H5M12 19l-7-7 7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            返回聚合页
          </button>
          <button className={styles.homeButton} onClick={() => navigate('/')}>
            <svg className={styles.buttonIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <polyline points="9 22 9 12 15 12 15 22" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            返回首页
          </button>
        </div>

        {/* 右侧内容卡片 */}
        <div ref={cardRef} className={styles.contentCard}>
          {/* 标题 */}
          <h1 className={styles.dreamTitle}>
            <span className={styles.dreamTitleMain}>{dream.id}. {dream.mainTitle}</span>
            <span className={styles.dreamTitleSub}>/ {dream.displaySubtitle}</span>
          </h1>

          {/* 滚动内容区 */}
          <div ref={contentRef} className={styles.scrollContent}>
            <div className={styles.textContent}>
              {/* 梦境成因 */}
              <h2 className={styles.sectionTitle}>梦境成因</h2>
              <p className={styles.description}>{dream.description}</p>

              {/* 深度解读 */}
              {dream.interpretation && (
                <>
                  <h2 className={styles.sectionTitle}>深度解读</h2>
                  <p className={styles.interpretation}>{dream.interpretation}</p>
                </>
              )}

              {/* 行动建议 */}
              {dream.advice && dream.advice.length > 0 && (
                <>
                  <h2 className={styles.sectionTitle}>行动建议</h2>
                  {dream.advice.map((item, index) => (
                    <p key={index} className={styles.adviceItem}>
                      <span className={styles.adviceNumber}>{index + 1}.</span>
                      <span className={styles.adviceTitle}>{item.title}：</span>
                      <span className={styles.adviceContent}>{item.content}</span>
                    </p>
                  ))}
                </>
              )}

              {/* 文献参考 */}
              {dream.references && (
                <div className={styles.referencesSection}>
                  <span className={styles.referencesLabel}>文献参考：</span>
                  <div className={styles.referencesList}>
                    {dream.references.split(' ').filter(r => r.startsWith('《')).map((ref, index) => (
                      <p key={index} className={styles.referenceItem}>{ref}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
