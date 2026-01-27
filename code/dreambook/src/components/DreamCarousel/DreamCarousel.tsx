import { useRef, useLayoutEffect } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation } from 'swiper/modules'
import gsap from 'gsap'
import { DreamSceneCard } from '@components/DreamSceneCard'
import type { Dream } from '@/types/dream'
// @ts-ignore - Swiper CSS 模块
import 'swiper/css'
// @ts-ignore - Swiper 导航 CSS 模块
import 'swiper/css/navigation'
import styles from './DreamCarousel.module.css'

interface DreamCarouselProps {
  dreams: Dream[]
  onDreamSelect: (dreamId: string) => void
  animationDelay?: number
}

export const DreamCarousel: React.FC<DreamCarouselProps> = ({
  dreams,
  onDreamSelect,
  animationDelay = 0
}) => {
  const swiperRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // 入场动画
  useLayoutEffect(() => {
    if (!containerRef.current) return

    gsap.to(containerRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'power2.out',
      delay: animationDelay,
    })
  }, [animationDelay])

  const handleDreamClick = (dreamId: string) => {
    onDreamSelect(dreamId)
  }

  return (
    <div
      ref={containerRef}
      className={styles.carouselWrapper}
      style={{ opacity: 0, transform: 'translateY(30px)' }}
      data-testid="dream-carousel"
    >
      <Swiper
        ref={swiperRef}
        modules={[Navigation]}
        spaceBetween={20}
        slidesPerView={5}
        navigation={{
          nextEl: `.${styles.nextButton}`,
          prevEl: `.${styles.prevButton}`,
          disabledClass: styles.disabled,
        }}
        keyboard={{ enabled: false }}
        mousewheel={false}
        grabCursor={true}
        touchRatio={1}
        touchReleaseOnEdges={true}
        breakpoints={{
          // 响应式设置
          1920: {
            slidesPerView: 5,
            spaceBetween: 20,
          },
          1440: {
            slidesPerView: 4,
            spaceBetween: 20,
          },
          1024: {
            slidesPerView: 3,
            spaceBetween: 16,
          },
          768: {
            slidesPerView: 2,
            spaceBetween: 16,
          },
          480: {
            slidesPerView: 1,
            spaceBetween: 12,
          },
        }}
        className={styles.swiper}
      >
        {dreams.map((dream) => (
          <SwiperSlide key={dream.id} className={styles.slide}>
            <DreamSceneCard
              id={dream.id}
              number={parseInt(dream.id)}
              title={dream.title}
              mainTitle={dream.mainTitle}
              displaySubtitle={dream.displaySubtitle}
              image={dream.image}
              onClick={() => handleDreamClick(dream.id)}
            />
          </SwiperSlide>
        ))}
      </Swiper>

      {/* 导航按钮 */}
      <button className={`${styles.navButton} ${styles.prevButton}`} aria-label="上一个">
        <svg viewBox="0 0 36 63" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.prevArrow}>
          <path d="M4 4L31.381 31.381C31.7716 31.7716 31.7716 32.4047 31.381 32.7953L5.86299 58.3133" stroke="white" strokeOpacity="0.7" strokeWidth="8" strokeLinecap="round"/>
        </svg>
      </button>

      <button className={`${styles.navButton} ${styles.nextButton}`} aria-label="下一个">
        <svg viewBox="0 0 36 63" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 4L31.381 31.381C31.7716 31.7716 31.7716 32.4047 31.381 32.7953L5.86299 58.3133" stroke="white" strokeOpacity="0.7" strokeWidth="8" strokeLinecap="round"/>
        </svg>
      </button>
    </div>
  )
}
