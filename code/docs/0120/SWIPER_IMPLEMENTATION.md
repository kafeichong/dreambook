# NavigationPage Swiper 轮播实现方案（2025-01-20）

## ⚠️ 触摸屏应用特别说明

**本项目是触摸屏应用，此实现方案的所有代码均已移除键盘支持，完全采用触摸交互。**

- ❌ **不启用键盘导航**（无需 ArrowLeft/ArrowRight）
- ✅ **完全支持触摸滑动**（Swiper 原生支持）
- ✅ **完全支持鼠标点击箭头按钮**（虽然是触摸屏，也兼容鼠标）
- ✅ **禁用鼠标滚轮控制**（防止误触发）

---

## 📦 方案选择：使用 Swiper 库

### 为什么选择 Swiper？

| 优势 | 说明 |
|------|------|
| 🎯 **成熟稳定** | Swiper 是业界标准轮播库，被数百万网站使用 |
| 📱 **开箱即用** | 支持触摸、鼠标、键盘等多种交互 |
| 🎨 **丰富功能** | 导航、分页、自动播放、过渡效果等 |
| ⚡ **高性能** | 优化的渲染，60fps 动画 |
| 🔧 **易于定制** | 完整的 API 和事件系统 |
| 📦 **轻量** | Gzip 后仅 ~30KB |
| 🌐 **浏览器兼容** | 支持所有现代浏览器 + IE11 |

---

## 🚀 实现步骤

### 第一步：安装依赖

```bash
# 使用 yarn（项目使用的包管理器）
yarn add swiper

# 或使用 npm
npm install swiper
```

**验证安装**
```bash
yarn list swiper
# 应该显示类似：swiper@11.x.x
```

---

### 第二步：创建轮播组件

**新建文件**：`src/components/DreamCarousel/DreamCarousel.tsx`

```typescript
import { useRef, useState, useLayoutEffect } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation } from 'swiper/modules'
import type { Swiper as SwiperType } from 'swiper'
import gsap from 'gsap'
import { DreamSceneCard } from '@components/DreamSceneCard'
import type { Dream } from '@/types/dream'
import 'swiper/css'
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
  const swiperRef = useRef<SwiperType | null>(null)
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
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      <button className={`${styles.navButton} ${styles.nextButton}`} aria-label="下一个">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </div>
  )
}
```

---

### 第三步：创建样式文件

**新建文件**：`src/components/DreamCarousel/DreamCarousel.module.css`

```css
.carouselWrapper {
  position: relative;
  margin-bottom: 40px;
  display: flex;
  align-items: center;
  gap: 16px;
}

/* Swiper 容器 */
.swiper {
  flex: 1;
  position: relative;
}

.swiper :global(.swiper-wrapper) {
  align-items: stretch;
}

.slide {
  display: flex;
  align-items: center;
  justify-content: center;
  height: auto;
}

/* 导航按钮 */
.navButton {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  color: #fff;
  cursor: pointer;
  transition: all 0.3s ease;
  flex-shrink: 0;
  font-size: 20px;
  z-index: 10;
  padding: 0;
  line-height: 1;
}

.navButton:hover:not(.disabled) {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 16px rgba(255, 255, 255, 0.1);
  transform: scale(1.05);
}

.navButton:active:not(.disabled) {
  transform: scale(0.95);
}

/* 禁用状态 */
.navButton.disabled {
  opacity: 0.4;
  cursor: not-allowed;
  background: rgba(255, 255, 255, 0.05);
}

.prevButton {
  order: -1;
}

.nextButton {
  order: 1;
}

/* SVG 图标样式 */
.navButton svg {
  width: 24px;
  height: 24px;
  display: block;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .carouselWrapper {
    gap: 12px;
  }

  .navButton {
    width: 44px;
    height: 44px;
    font-size: 18px;
  }

  .navButton svg {
    width: 20px;
    height: 20px;
  }
}

@media (max-width: 768px) {
  .carouselWrapper {
    gap: 10px;
  }

  .navButton {
    width: 40px;
    height: 40px;
    font-size: 16px;
  }

  .navButton svg {
    width: 18px;
    height: 18px;
  }
}

@media (max-width: 480px) {
  .carouselWrapper {
    gap: 8px;
  }

  .navButton {
    width: 36px;
    height: 36px;
    font-size: 14px;
  }

  .navButton svg {
    width: 16px;
    height: 16px;
  }
}

/* 优化性能 */
.swiper {
  will-change: transform;
}

.slide {
  will-change: transform;
}

/* 移除 Swiper 默认样式冲突 */
.swiper :global(.swiper-slide) {
  width: auto;
  height: auto;
}

.swiper :global(.swiper-horizontal) > :global(.swiper-pagination-bullets),
.swiper :global(.swiper-pagination-bullets.swiper-pagination-horizontal) {
  display: none;
}

/* 过渡动画 */
.swiper :global(.swiper-wrapper) {
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}
```

---

### 第四步：创建导出文件

**新建文件**：`src/components/DreamCarousel/index.ts`

```typescript
export { DreamCarousel } from './DreamCarousel'
export type { DreamCarouselProps } from './DreamCarousel'
```

---

### 第五步：更新 NavigationPage

**修改文件**：`src/pages/NavigationPage/NavigationPage.tsx`

**删除部分**
```typescript
// 删除这些导入
import { DreamSceneCard } from '@components/DreamSceneCard'

// 删除这些 ref
const gridRef = useRef<HTMLDivElement>(null)

// 删除卡片网格相关的 GSAP 动画代码
const cards = gridRef.current?.querySelectorAll('[data-card]')
if (cards) {
  gsap.to(cards, { ... })
}

// 删除网格 JSX
<div ref={gridRef} className={styles.grid}>
  {data.dreams.map((dream: Dream, index: number) => (
    <DreamSceneCard ... />
  ))}
</div>
```

**新增部分**
```typescript
// 新增导入
import { DreamCarousel } from '@components/DreamCarousel'

// 新增轮播 JSX（替换原网格）
<DreamCarousel
  dreams={data.dreams}
  onDreamSelect={(dreamId) => navigate(`/dream/${dreamId}`)}
  animationDelay={0.5}
/>
```

**完整改后的 NavigationPage.tsx 核心部分**
```typescript
import { useLayoutEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import gsap from 'gsap'
import { ParticleBackground } from '@components/ParticleBackground'
import { DreamCarousel } from '@components/DreamCarousel'
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
  const subtitleRef = useRef<HTMLParagraphElement>(null)

  useLayoutEffect(() => {
    if (!data) return

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

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
      .to(subtitleRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.6
      }, '-=0.4')
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

        {/* 标题区域 */}
        <header className={styles.header}>
          <h1 ref={titleRef} className={styles.title}>最近做过什么梦？</h1>
        </header>

        {/* 提示文字 */}
        <p ref={subtitleRef} className={styles.subtitle}>
          十个梦境场景测出你目前的心理状态
        </p>

        {/* 轮播组件 */}
        <DreamCarousel
          dreams={data.dreams}
          onDreamSelect={(dreamId) => navigate(`/dream/${dreamId}`)}
          animationDelay={0.5}
        />
      </div>
    </div>
  )
}
```

---

### 第六步：删除原网格样式（可选）

**修改文件**：`src/pages/NavigationPage/NavigationPage.module.css`

**删除以下内容**
```css
/* 删除网格相关样式 */
.grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 20px;
  margin-bottom: 40px;
}

.grid [data-card] {
  opacity: 0;
  transform: translateY(40px) scale(0.9);
}

/* 删除响应式中的网格规则 */
@media (max-width: 1600px) {
  .grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

/* 等等... */
```

**保留部分**
```css
/* 保留其他样式如 homeButton, title, subtitle 等 */
```

---

### 第七步：更新类型定义（如需要）

**修改文件**：`src/components/DreamCarousel/DreamCarousel.tsx`

如果 Dream 类型需要调整：

```typescript
interface DreamCarouselProps {
  dreams: Dream[]
  onDreamSelect: (dreamId: string) => void
  animationDelay?: number
}

// Dream 类型应包含
interface Dream {
  id: string
  title: string
  mainTitle?: string
  displaySubtitle?: string
  image: string
}
```

---

## 📋 完整改版清单

### 新增文件（3 个）
```
✅ src/components/DreamCarousel/DreamCarousel.tsx
✅ src/components/DreamCarousel/DreamCarousel.module.css
✅ src/components/DreamCarousel/index.ts
```

### 修改文件（2 个）
```
✅ src/pages/NavigationPage/NavigationPage.tsx
✅ src/pages/NavigationPage/NavigationPage.module.css
```

### 删除/注释文件
```
○ 无需删除已有文件
✓ SearchBox 早已移除（前面改版）
```

### 依赖变更
```
✅ yarn add swiper
```

---

## 🧪 测试检查清单

### 基础功能
- [ ] 轮播加载正常，显示 5 个卡片
- [ ] 左箭头点击，显示前一屏卡片
- [ ] 右箭头点击，显示后一屏卡片
- [ ] 第一屏时左箭头禁用（灰色）
- [ ] 最后一屏时右箭头禁用（灰色）
- [ ] 点击卡片能进入详情页

### 动画和交互
- [ ] 卡片切换有平滑过渡（300ms）
- [ ] 入场动画正常（0.8s GSAP 动画）
- [ ] 箭头 hover 时有高亮效果
- [ ] 箭头 active 时有按压效果

### 响应式
- [ ] 1920×1080 显示 5 个卡片
- [ ] 1440×900 显示 4 个卡片
- [ ] 1024×768 显示 3 个卡片
- [ ] 768×1024 显示 2 个卡片
- [ ] 移动设备显示 1 个卡片

### 触摸屏交互 ✅（核心）
- [ ] 左右箭头可点击（48×48px）
- [ ] 触摸滑动能切换卡片（Swiper 自动支持）
- [ ] 没有卡顿或闪烁
- [ ] 虚拟键盘不会弹出（无输入框）
- [ ] 键盘事件完全禁用（不响应 ArrowLeft/ArrowRight）

### 性能
- [ ] 切换卡片时帧率稳定（60fps）
- [ ] 无内存泄漏
- [ ] 加载首屏 < 2s
- [ ] 网络请求正常

### 浏览器兼容性
- [ ] Chrome/Edge 最新版 ✓
- [ ] Firefox 最新版 ✓
- [ ] Safari 最新版 ✓
- [ ] 触摸屏设备 ✓

---

## 🎛️ Swiper 常用配置

### 基础配置
```typescript
{
  modules: [Navigation],           // 启用导航模块
  spaceBetween: 20,               // 卡片间距
  slidesPerView: 5,               // 显示的卡片数
  navigation: {...},              // 导航按钮配置
  breakpoints: {...},             // 响应式配置
}
```

### 可选高级配置
```typescript
{
  loop: false,                     // 不循环
  autoplay: false,                 // 不自动播放
  speed: 300,                      // 过渡速度(ms)
  effect: 'slide',                 // 过渡效果
  grabCursor: true,                // 鼠标悬停显示抓手
  touchRatio: 1,                   // 触摸灵敏度
  touchReleaseOnEdges: true,       // 到边界时释放
  mousewheel: false,               // 禁用鼠标滚轮
  keyboard: {
    enabled: false,                // 禁用键盘控制（触摸屏应用）
  },
}
```

### 添加自动播放
```typescript
import { Navigation, Autoplay } from 'swiper/modules'

<Swiper
  modules={[Navigation, Autoplay]}
  autoplay={{
    delay: 5000,                   // 5 秒切换
    disableOnInteraction: true,    // 交互后停止
  }}
  {...}
/>
```

### 添加分页指示器
```typescript
import { Navigation, Pagination } from 'swiper/modules'

<Swiper
  modules={[Navigation, Pagination]}
  pagination={{
    clickable: true,
    dynamicBullets: true,
  }}
  {...}
/>
```

---

## 🔗 引入 CSS 的两种方式

### 方式 1：在组件中导入（推荐）
```typescript
// DreamCarousel.tsx
import 'swiper/css'
import 'swiper/css/navigation'
```

### 方式 2：在全局样式中导入
```typescript
// src/main.tsx
import 'swiper/css'
import 'swiper/css/navigation'
```

---

## 📱 完整响应式参考

```typescript
breakpoints={{
  // 超小屏幕
  320: {
    slidesPerView: 1,
    spaceBetween: 8,
  },
  // 小屏幕（手机竖屏）
  480: {
    slidesPerView: 1,
    spaceBetween: 12,
  },
  // 平板竖屏
  768: {
    slidesPerView: 2,
    spaceBetween: 16,
  },
  // 平板横屏
  1024: {
    slidesPerView: 3,
    spaceBetween: 16,
  },
  // 小桌面
  1440: {
    slidesPerView: 4,
    spaceBetween: 20,
  },
  // 标准设计宽度
  1920: {
    slidesPerView: 5,
    spaceBetween: 20,
  },
  // 超宽屏
  2560: {
    slidesPerView: 6,
    spaceBetween: 24,
  },
}}
```

---

## ⚠️ 常见问题与解决

### 问题 1：样式冲突
**症状**：按钮位置错乱或样式不生效

**解决**
```typescript
// 确保在组件中导入 CSS
import 'swiper/css'
import 'swiper/css/navigation'
import styles from './DreamCarousel.module.css'

// 使用模块化 CSS 覆盖
.navButton {
  /* 你的样式 */
}

.navButton.disabled {
  /* 你的禁用样式 */
}
```

### 问题 2：响应式不生效
**症状**：改变窗口大小后卡片数不变

**解决**
```typescript
// 确保 breakpoints 配置正确
// Swiper 会自动监听窗口大小改变
breakpoints={{
  1920: { slidesPerView: 5 },
  1440: { slidesPerView: 4 },
  // ...
}}
```

### 问题 3：触摸不工作
**症状**：在触摸屏上无法滑动

**解决**
```typescript
// Swiper 默认启用触摸
// 确保没有禁用
<Swiper
  simulateTouch={true}           // 鼠标模拟触摸
  touchRatio={1}                 // 触摸灵敏度
  touchReleaseOnEdges={true}     // 边界释放
  {...}
/>
```

### 问题 4：导航按钮不显示
**症状**：左右箭头看不见

**解决**
```typescript
// 检查按钮类名是否匹配
navigation={{
  nextEl: `.${styles.nextButton}`,    // 确保类名正确
  prevEl: `.${styles.prevButton}`,
}}

// 或使用 ref
const nextButtonRef = useRef(null)
const prevButtonRef = useRef(null)

<button ref={prevButtonRef} />
<button ref={nextButtonRef} />

<Swiper
  navigation={{
    nextEl: nextButtonRef.current,
    prevEl: prevButtonRef.current,
  }}
/>
```

---

## 📊 工作量估算

| 任务 | 预计时间 | 完成度 |
|------|---------|--------|
| 安装依赖 | 5min | ✓ |
| 创建轮播组件 | 45min | ○ |
| 编写样式 | 30min | ○ |
| 更新 NavigationPage | 20min | ○ |
| 删除网格样式 | 10min | ○ |
| 测试功能 | 30min | ○ |
| 响应式调整 | 20min | ○ |
| 性能优化 | 15min | ○ |

**总计**：约 2.5-3 小时

---

## 🎓 参考资源

- [Swiper 官方文档](https://swiperjs.com/)
- [Swiper React 指南](https://swiperjs.com/react)
- [Swiper 演示](https://swiperjs.com/demos)
- [Swiper API](https://swiperjs.com/swiper-api)

---

## ✅ 执行建议

1. **创建分支**
   ```bash
   git checkout -b feature/carousel-redesign
   ```

2. **逐步实现**
   - 先创建组件，不集成
   - 本地测试组件功能
   - 再集成到 NavigationPage
   - 最后清理旧代码

3. **测试验证**
   - 所有断点都要测试
   - 触摸屏设备也要测试
   - 性能检查

4. **提交代码**
   ```bash
   git add .
   git commit -m "refactor: replace grid layout with swiper carousel"
   git push origin feature/carousel-redesign
   ```

---

**文档版本**：V1
**最后更新**：2025-01-20
**实现库**：Swiper 11.x
**适配框架**：React 19.x + TypeScript
