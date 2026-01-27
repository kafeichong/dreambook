# NavigationPage 改版方案 - 网格布局 → 轮播布局（2025-01-20）

## 📊 设计对比分析

### 原始布局（当前实现）

**形式**：网格布局（Grid）
- **排列方式**：5 列网格，全部卡片在一屏显示
- **卡片数**：一次性展示 10 个梦境卡片
- **交互方式**：直接点击卡片进入详情页
- **优点**：
  - 信息密度高，全局可见
  - 用户可快速浏览所有选项
  - 实现简单，无需复杂状态管理
- **缺点**：
  - 1920×1080 屏幕显示 5 个卡片比较拥挤
  - 响应式调整困难
  - 页面信息过多

**CSS 实现**
```css
.grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);  /* 5 列 */
  gap: 20px;
  margin-bottom: 40px;
}
```

### 新设计布局（轮播形式）

**形式**：轮播/走马灯（Carousel）
- **排列方式**：一行显示约 5 个卡片，支持左右滑动
- **卡片数**：每屏显示 5 个，可翻页切换
- **交互方式**：
  - 左箭头：查看前面的卡片
  - 右箭头：查看后面的卡片
  - 点击卡片：进入详情页
- **优点**：
  - 更干净清爽的界面
  - 卡片显示更大，更容易点击
  - 符合现代 Web 设计趋势
  - 触摸屏友好（轻扫切换）
- **缺点**：
  - 需要多步才能看到全部卡片
  - 实现更复杂，状态管理增加

**设计稿显示**
```
[<] [卡片1] [卡片2] [卡片3] [卡片4] [卡片5] [>]
     ↑______ 一行显示 ______↑    ↑_____ 可水平滚动 _____↑
```

---

## 🎯 改版修改步骤

### 第一阶段：创建轮播组件框架

#### 1️⃣ 创建 Carousel 容器组件

**新建文件**：`src/components/DreamCarousel/DreamCarousel.tsx`

**功能需求**
- 显示梦境卡片轮播
- 管理当前展示的卡片索引
- 提供左右箭头控制翻页
- 支持自动滚动（可选）

**组件框架**
```typescript
interface DreamCarouselProps {
  dreams: Dream[]
  visibleCount?: number      // 每屏显示数量，默认 5
  onDreamSelect: (dreamId: string) => void
  animationDelay?: number
}

export const DreamCarousel: React.FC<DreamCarouselProps> = ({
  dreams,
  visibleCount = 5,
  onDreamSelect,
  animationDelay = 0
}) => {
  const [currentIndex, setCurrentIndex] = useState(0)

  const handlePrev = () => { /* 向前翻页 */ }
  const handleNext = () => { /* 向后翻页 */ }

  const visibleDreams = dreams.slice(
    currentIndex,
    currentIndex + visibleCount
  )

  return (
    <div className={styles.carousel}>
      {/* 左箭头 */}
      {/* 卡片容器 */}
      {/* 右箭头 */}
    </div>
  )
}
```

#### 2️⃣ 创建 Carousel 样式文件

**新建文件**：`src/components/DreamCarousel/DreamCarousel.module.css`

**关键样式**
```css
.carousel {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 40px;
  position: relative;
}

.arrowButton {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  color: #fff;
  cursor: pointer;
  transition: all 0.3s ease;
  flex-shrink: 0;
  font-size: 20px;
}

.arrowButton:hover {
  background: rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 12px rgba(255, 255, 255, 0.1);
}

.arrowButton:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.cardsContainer {
  flex: 1;
  display: flex;
  gap: 20px;
  overflow: hidden;
  /* 不需要 overflow-x 自动，由 flex 控制 */
}

.cardsWrapper {
  display: flex;
  gap: 20px;
  transition: transform 0.3s ease;
  /* 用 transform 来实现平滑的水平滚动 */
}
```

### 第二阶段：实现轮播逻辑

#### 3️⃣ 完善翻页逻辑

**核心逻辑**
```typescript
const maxIndex = Math.max(0, dreams.length - visibleCount)

const handlePrev = () => {
  setCurrentIndex(prev => Math.max(0, prev - 1))
}

const handleNext = () => {
  setCurrentIndex(prev => Math.min(maxIndex, prev + 1))
}

// 或者使用一次翻一屏的逻辑
const handlePrev = () => {
  setCurrentIndex(prev => Math.max(0, prev - visibleCount))
}

const handleNext = () => {
  setCurrentIndex(prev => Math.min(maxIndex, prev + visibleCount))
}
```

**禁用条件**
```typescript
const canPrev = currentIndex > 0
const canNext = currentIndex < maxIndex
```

#### 4️⃣ 添加过渡动画

**使用 CSS Transform**
```typescript
const offset = currentIndex * (cardWidth + gap)

<div
  className={styles.cardsWrapper}
  style={{
    transform: `translateX(-${offset}px)`,
  }}
>
  {dreams.map(dream => (
    <DreamSceneCard key={dream.id} {...dream} />
  ))}
</div>
```

#### 5️⃣ 集成 GSAP 动画（可选）

```typescript
useLayoutEffect(() => {
  if (!containerRef.current) return

  gsap.to(containerRef.current, {
    opacity: 1,
    y: 0,
    duration: 0.8,
    ease: 'power2.out',
    delay: animationDelay
  })
}, [animationDelay])
```

### 第三阶段：更新 NavigationPage

#### 6️⃣ 替换网格为轮播

**修改文件**：`src/pages/NavigationPage/NavigationPage.tsx`

**改动内容**
```typescript
// 删除
import { DreamSceneCard } from '@components/DreamSceneCard'

// 新增
import { DreamCarousel } from '@components/DreamCarousel'

// 删除网格渲染
{/*
  <div ref={gridRef} className={styles.grid}>
    {data.dreams.map((dream: Dream, index: number) => (
      <DreamSceneCard ... />
    ))}
  </div>
*/}

// 新增轮播渲染
<DreamCarousel
  dreams={data.dreams}
  visibleCount={5}
  onDreamSelect={(dreamId) => navigate(`/dream/${dreamId}`)}
  animationDelay={animationDelay}
/>
```

#### 7️⃣ 移除相关 GSAP 动画代码

**删除**：GridRef 相关的动画逻辑
```typescript
// 删除这部分
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
```

### 第四阶段：样式和响应式调整

#### 8️⃣ 更新 CSS 样式

**修改文件**：`src/pages/NavigationPage/NavigationPage.module.css`

```css
/* 原来的 .grid 可以删除或保留备份 */

/* 轮播响应式 */
@media (max-width: 1600px) {
  /* 保持 5 列显示 */
}

@media (max-width: 1200px) {
  /* 可显示 4 个卡片 */
  .carousel {
    /* 调整间距 */
  }
}

@media (max-width: 768px) {
  /* 显示 3 个卡片 */
}

@media (max-width: 480px) {
  /* 显示 2 个卡片 */
}
```

#### 9️⃣ 卡片尺寸调整

- 当前：网格自动分列，每个卡片宽度 = (容器宽度 - 间距) / 5
- 新的：需要计算固定卡片宽度以匹配设计稿
- 建议：固定卡片宽度（如 240px），由容器大小决定显示数

### 第五阶段：增强功能

#### 🔟 添加键盘支持

```typescript
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') handlePrev()
    if (e.key === 'ArrowRight') handleNext()
  }

  window.addEventListener('keydown', handleKeyDown)
  return () => window.removeEventListener('keydown', handleKeyDown)
}, [currentIndex])
```

#### 1️⃣1️⃣ 添加触摸支持（适配触摸屏）

```typescript
const [touchStart, setTouchStart] = useState(0)
const [touchEnd, setTouchEnd] = useState(0)

const handleTouchStart = (e: React.TouchEvent) => {
  setTouchStart(e.targetTouches[0].clientX)
}

const handleTouchEnd = (e: React.TouchEvent) => {
  setTouchEnd(e.changedTouches[0].clientX)

  if (touchStart - touchEnd > 50) {
    handleNext()  // 向左滑动
  }

  if (touchEnd - touchStart > 50) {
    handlePrev()  // 向右滑动
  }
}
```

#### 1️⃣2️⃣ 添加指示器（可选）

```typescript
<div className={styles.indicators}>
  {Array.from({ length: totalPages }).map((_, i) => (
    <button
      key={i}
      className={`${styles.indicator} ${i === currentPage ? styles.active : ''}`}
      onClick={() => setCurrentIndex(i * visibleCount)}
    />
  ))}
</div>
```

---

## 📝 改版文件清单

### 新增文件
```
src/components/DreamCarousel/
├── DreamCarousel.tsx            (轮播组件主文件)
├── DreamCarousel.module.css     (轮播样式)
└── index.ts                     (导出文件)
```

### 修改文件
```
src/pages/NavigationPage/
├── NavigationPage.tsx           (替换网格为轮播)
├── NavigationPage.module.css    (删除 .grid，可保留备份)
└── NavigationPage.module.css.bak (原备份)

package.json                     (无需新增依赖，使用原有库)
```

### 可删除文件（如果轮播完全取代网格）
```
src/components/DreamSceneCard/DreamSceneCard.tsx  (保留，轮播内使用)
```

---

## 🔄 轮播库选择方案

### 方案 A：手动实现（推荐）✅
- **优点**：无额外依赖，完全控制，性能最优
- **缺点**：需要手写逻辑
- **工作量**：3-4 小时

### 方案 B：使用轻量级库
```bash
# swiper 库
yarn add swiper

# embla-carousel
yarn add embla-carousel embla-carousel-react
```

**swiper 集成示例**
```typescript
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'

<Swiper
  modules={[Navigation]}
  navigation
  spaceBetween={20}
  slidesPerView={5}
>
  {dreams.map(dream => (
    <SwiperSlide key={dream.id}>
      <DreamSceneCard {...dream} />
    </SwiperSlide>
  ))}
</Swiper>
```

**优点**：成熟稳定，功能丰富
**缺点**：额外依赖，体积增加

---

## 🧪 测试检查清单

### 功能测试
- [ ] 左箭头点击后卡片向右移动，显示前面的内容
- [ ] 右箭头点击后卡片向左移动，显示后面的内容
- [ ] 到达最后一屏时，右箭头禁用
- [ ] 到达第一屏时，左箭头禁用
- [ ] 点击卡片能进入详情页面
- [ ] 能正确显示卡片数量（5 个/屏）

### 动画测试
- [ ] 卡片切换有平滑过渡
- [ ] 入场动画正常播放
- [ ] 没有闪烁或卡顿

### 响应式测试
- [ ] 1920×1080 显示 5 个卡片 ✓（设计稿）
- [ ] 1440×900 显示 4 个卡片
- [ ] 1024×768 显示 3 个卡片
- [ ] 768×1024 显示 2 个卡片
- [ ] 375×667（手机）显示 1-2 个卡片

### 触摸屏测试
- [ ] 左右箭头可点击
- [ ] 触摸滑动可切换（如启用）
- [ ] 键盘箭头可控制（如启用）

### 性能测试
- [ ] 切换卡片时无卡顿
- [ ] 内存占用正常
- [ ] 帧率保持在 60fps

---

## ⏰ 工作量估算

| 任务 | 预计工作量 | 优先级 |
|------|-----------|--------|
| 创建轮播组件框架 | 1h | 🔴 高 |
| 实现翻页逻辑 | 1.5h | 🔴 高 |
| CSS 样式与动画 | 1.5h | 🔴 高 |
| 更新 NavigationPage | 0.5h | 🔴 高 |
| 响应式设计 | 1h | 🟡 中 |
| 增强功能（键盘/触摸） | 1h | 🟢 低 |
| 测试与调试 | 1.5h | 🔴 高 |

**总预计工作量**：7-8 小时

---

## 🎨 UI/UX 建议

### 箭头按钮设计
- 位置：卡片左右两侧
- 大小：48×48px（便于点击）
- 样式：半透明玻璃态，hover 时加深
- 禁用状态：50% 透明度 + 不可点击

### 卡片动画
- 切换时间：300ms
- 缓动函数：`ease-in-out` 或 `cubic-bezier(0.4, 0, 0.2, 1)`
- 卡片间距：20px（与设计稿一致）

### 过渡效果
- 无 Snap 滚动，平滑过渡
- 支持多个步长切换（可选）
- 鼠标悬停时可显示预告（可选）

---

## 📌 注意事项

1. **卡片宽度计算**
   - 需要精确计算每个卡片的宽度
   - 考虑间距（gap）和容器宽度
   - 公式：`cardWidth = (containerWidth - gaps) / visibleCount`

2. **边界条件处理**
   - 当梦境数 < visibleCount 时的处理
   - 最后一屏可能不满 5 个卡片

3. **性能优化**
   - 使用 `willChange` 优化动画性能
   - 考虑虚拟滚动（如果卡片数很多）

4. **无障碍设计**
   - 添加 ARIA 标签
   - 支持键盘导航
   - 保留 tabIndex

5. **兼容性**
   - 测试 Transform3d 支持
   - 考虑 Safari 兼容性
   - 触摸屏设备兼容

---

**文档版本**：V1
**最后更新**：2026-01-20
**适配设计稿**：Figma node-id=1-5i                                                                                                                                                                                      
