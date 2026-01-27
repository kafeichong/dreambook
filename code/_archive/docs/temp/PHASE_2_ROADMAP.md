# 情绪书库 · 开发路线图与任务分解

## 🚀 快速启动清单

### 前期准备（开始前必须完成）

```
□ 确认最终书籍列表（建议 50-100 本）
  - 每个情绪大类需要均匀分布
  - 每个情绪等级都要有代表作品
  - 示例：8 大类 × 3 等级 = 24 个子类，每个子类 2-3 本

□ 获取所有书籍的二维码链接
  - 电子书来源确认
  - 二维码或链接格式统一

□ 获取纸质书的索书码
  - 需要与图书馆系统对接
  - 6F 楼层编码规则确认

□ 设计稿完整度检查
  - 详情页（电子书版本）
  - 详情页（纸质书版本）
  - 情绪轮盘交互流程
  - 筛选器 UI 设计

□ 视觉资源准备
  - 书籍封面高清图片
  - 情绪图标或色块
  - 返回按钮等通用图标
```

---

## 📅 具体开发周期规划

### Week 1-2: 项目搭建 & 数据层

#### Task 1.1: 项目初始化（1天）
**目标：** 创建新的项目分支和基础结构

```bash
# 创建新分支
git checkout -b feature/phase-2-emotion-library

# 创建项目目录
code/dreambook-phase2/          # 或在现有项目中创建分支结构
├── src/
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   ├── types/
│   ├── utils/
│   └── services/
├── public/
│   ├── data/
│   ├── assets/
│   │   ├── covers/            # 书籍封面
│   │   ├── qrcodes/           # 二维码
│   │   └── icons/             # 图标
│   └── ...
└── package.json
```

**检查清单：**
- [ ] 项目能正常启动 `yarn dev`
- [ ] TypeScript 配置正确
- [ ] 路由系统基础搭建

#### Task 1.2: 数据模型定义（1-2天）

**创建文件：** `src/types/book.d.ts`

```typescript
// 完整的类型定义
export type EmotionCategory =
  | 'grief'      // 悲恸
  | 'anger'      // 生气
  | 'anxiety'    // 焦虑
  | 'fear'       // 恐惧
  | 'disgust'    // 厌恶
  | 'joy'        // 愉悦
  | 'surprise'   // 惊讶
  | 'happiness'  // 快乐

export type EmotionLevel = 'light' | 'medium' | 'heavy'
export type BookMedium = 'ebook' | 'physical'

export interface EmotionTag {
  category: EmotionCategory
  level: EmotionLevel
  name: string
}

export interface BaseBook {
  id: string
  title: string
  author: string
  publisher: string
  cover: string
  description?: string
  tags?: string[]
  emotions: EmotionTag[]
}

export interface EBook extends BaseBook {
  medium: 'ebook'
  qrCode: string
  externalUrl: string
}

export interface PhysicalBook extends BaseBook {
  medium: 'physical'
  catalogCode: string
  floorCode: string
  location?: string
}

export type Book = EBook | PhysicalBook

export interface BookLibraryConfig {
  institution: string
  version: string
  lastUpdated: string
  totalBooks: number
  books: Book[]
}

export interface EmotionConfig {
  category: EmotionCategory
  levels: EmotionLevel[]
  color: string
  bgColor?: string
  description: string
  keywords?: string[]
}
```

**检查清单：**
- [ ] 类型定义完整
- [ ] TypeScript 无错误提示
- [ ] 类型关系清晰

#### Task 1.3: 静态数据准备（2-3天）

**创建文件：** `public/data/books.json`

```json
{
  "institution": "情绪书库",
  "version": "1.0",
  "lastUpdated": "2025-01-25",
  "totalBooks": 0,
  "books": [
    {
      "id": "ebook_001",
      "title": "拥抱你的情绪",
      "author": "玛丽·皮帕",
      "publisher": "中信出版社",
      "cover": "/assets/covers/ebook_001.jpg",
      "description": "一本关于理解和接纳情绪的指南",
      "medium": "ebook",
      "emotions": [
        { "category": "anxiety", "level": "light", "name": "紧张" },
        { "category": "joy", "level": "medium", "name": "温和" }
      ],
      "qrCode": "/assets/qrcodes/ebook_001.svg",
      "externalUrl": "https://..."
    },
    {
      "id": "physical_001",
      "title": "走出悲伤",
      "author": "冬范",
      "publisher": "人民文学出版社",
      "cover": "/assets/covers/physical_001.jpg",
      "description": "走出生活的低谷，重获生命的意义",
      "medium": "physical",
      "emotions": [
        { "category": "grief", "level": "heavy", "name": "失落" }
      ],
      "catalogCode": "I565/123",
      "floorCode": "6F",
      "location": "文学类 H 区"
    }
  ]
}
```

**创建文件：** `public/data/emotions.json`

```json
{
  "emotions": [
    {
      "category": "grief",
      "levels": ["light", "medium", "heavy"],
      "names": ["孤独", "低谷", "失落"],
      "color": "#7B68B6",
      "bgColor": "#E8E4F3",
      "description": "与失去、孤单、悲伤相关的情绪"
    },
    {
      "category": "anger",
      "levels": ["light", "medium", "heavy"],
      "names": ["愤怒", "对抗", "失控"],
      "color": "#E63946",
      "bgColor": "#FADBD8",
      "description": "与愤怒、冲突、失控相关的情绪"
    },
    {
      "category": "anxiety",
      "levels": ["light", "medium", "heavy"],
      "names": ["紧张", "担忧", "关注"],
      "color": "#F4A261",
      "bgColor": "#FCE8D8",
      "description": "与紧张、担忧、压力相关的情绪"
    },
    {
      "category": "fear",
      "levels": ["light", "medium", "heavy"],
      "names": ["未知", "不安", "压迫"],
      "color": "#2A4A6B",
      "bgColor": "#D5E1F0",
      "description": "与恐惧、不安、压迫感相关的情绪"
    },
    {
      "category": "disgust",
      "levels": ["light", "medium", "heavy"],
      "names": ["排斥", "抵触", "不悦"],
      "color": "#A0714F",
      "bgColor": "#EDE0D7",
      "description": "与厌恶、排斥、不满相关的情绪"
    },
    {
      "category": "joy",
      "levels": ["light", "medium", "heavy"],
      "names": ["放松", "温和", "轻快"],
      "color": "#F9D871",
      "bgColor": "#FEF5D6",
      "description": "与愉悦、放松、舒适相关的情绪"
    },
    {
      "category": "surprise",
      "levels": ["light", "medium", "heavy"],
      "names": ["新奇", "突破", "震撼"],
      "color": "#D4AF5A",
      "bgColor": "#F9F5EF",
      "description": "与新奇、意外、震撼相关的情绪"
    },
    {
      "category": "happiness",
      "levels": ["light", "medium", "heavy"],
      "names": ["轻盈", "分享", "明亮"],
      "color": "#6FBF82",
      "bgColor": "#E0F3E8",
      "description": "与快乐、幸福、光明相关的情绪"
    }
  ]
}
```

**检查清单：**
- [ ] 至少 30 本示例书籍数据完整
- [ ] 情绪配置覆盖全部 8 类
- [ ] JSON 格式校验无误
- [ ] 书籍 ID 无重复

---

### Week 2-3: 核心页面开发

#### Task 2.1: 首页开发（2-3天）

**创建文件结构：**
```
src/
├── components/
│   ├── BookCard/
│   │   ├── BookCard.tsx
│   │   └── BookCard.module.css
│   ├── BookGrid/
│   │   ├── BookGrid.tsx
│   │   └── BookGrid.module.css
│   └── Pagination/
│       ├── Pagination.tsx
│       └── Pagination.module.css
└── pages/
    └── HomePage/
        ├── HomePage.tsx
        └── HomePage.module.css
```

**HomePage.tsx 结构：**
```typescript
import { useState, useEffect } from 'react'
import BookCard from '@components/BookCard'
import Pagination from '@components/Pagination'
import { Book } from '@types/book'

export default function HomePage() {
  const [books, setBooks] = useState<Book[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const booksPerPage = 12

  useEffect(() => {
    // 加载数据
    fetch('/data/books.json')
      .then(r => r.json())
      .then(data => setBooks(data.books))
  }, [])

  const totalPages = Math.ceil(books.length / booksPerPage)
  const displayBooks = books.slice(
    (currentPage - 1) * booksPerPage,
    currentPage * booksPerPage
  )

  return (
    <div className="home-page">
      <header className="home-header">
        <h1>情绪书库</h1>
        <p>找到属于你心情的那本书</p>
        <button className="return-btn" onClick={() => window.history.back()}>
          返回首页
        </button>
      </header>

      <div className="book-grid">
        {displayBooks.map(book => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>

      <Pagination
        current={currentPage}
        total={totalPages}
        onChange={setCurrentPage}
      />
    </div>
  )
}
```

**检查清单：**
- [ ] 首页能正常加载
- [ ] 显示 12 本书的网格布局
- [ ] 分页功能正常
- [ ] 点击书籍能导航到详情页
- [ ] 响应式设计合理

#### Task 2.2: 详情页开发（2-3天）

**DetailPage.tsx 关键结构：**
```typescript
import { useParams, useNavigate } from 'react-router-dom'
import { Book, EBook, PhysicalBook } from '@types/book'

export default function DetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [book, setBook] = useState<Book | null>(null)

  // 条件渲染：电子书 vs 纸质书
  const isEbook = (book?: Book): book is EBook => book?.medium === 'ebook'
  const isPhysical = (book?: Book): book is PhysicalBook => book?.medium === 'physical'

  return (
    <div className="detail-page">
      {/* 书籍基本信息 */}
      <img src={book?.cover} alt={book?.title} className="book-cover" />
      <h1>{book?.title}</h1>
      <p className="author">{book?.author}</p>

      {/* 情绪标签 */}
      <div className="emotion-tags">
        {book?.emotions.map(emotion => (
          <span key={emotion.category} className={`tag ${emotion.level}`}>
            {emotion.name}
          </span>
        ))}
      </div>

      {/* 条件渲染：电子书 */}
      {isEbook(book) && (
        <div className="ebook-section">
          <img src={book.qrCode} alt="QR Code" className="qrcode" />
          <p>扫描二维码即可阅读</p>
          <a href={book.externalUrl} target="_blank">打开电子书</a>
        </div>
      )}

      {/* 条件渲染：纸质书 */}
      {isPhysical(book) && (
        <div className="physical-section">
          <div className="catalog-code">
            <label>索书码</label>
            <code>{book.catalogCode}</code>
          </div>
          <div className="floor-code">
            <label>楼层</label>
            <span>{book.floorCode}</span>
          </div>
          <div className="location">
            <label>位置</label>
            <p>{book.location}</p>
          </div>
        </div>
      )}

      <button onClick={() => navigate(-1)}>返回</button>
    </div>
  )
}
```

**检查清单：**
- [ ] 详情页能正确加载书籍数据
- [ ] 电子书显示 QR 码
- [ ] 纸质书显示索书码+楼层
- [ ] 情绪标签正确显示
- [ ] 返回按钮功能正常

#### Task 2.3: 列表页开发（2-3天）

**BookListPage.tsx 关键结构：**
```typescript
import { useState, useMemo } from 'react'
import { Book, EmotionCategory, EmotionLevel } from '@types/book'
import EmotionFilter from '@components/EmotionFilter'
import BookList from '@components/BookList'

export default function BookListPage() {
  const [books, setBooks] = useState<Book[]>([])
  const [filters, setFilters] = useState({
    emotionCategory: null as EmotionCategory | null,
    emotionLevel: null as EmotionLevel | null,
    medium: null as 'ebook' | 'physical' | null,
  })

  // 筛选逻辑
  const filteredBooks = useMemo(() => {
    return books.filter(book => {
      if (filters.emotionCategory || filters.emotionLevel) {
        const hasEmotion = book.emotions.some(e => {
          const categoryMatch = !filters.emotionCategory || e.category === filters.emotionCategory
          const levelMatch = !filters.emotionLevel || e.level === filters.emotionLevel
          return categoryMatch && levelMatch
        })
        if (!hasEmotion) return false
      }

      if (filters.medium && book.medium !== filters.medium) return false

      return true
    })
  }, [books, filters])

  return (
    <div className="book-list-page">
      <EmotionFilter
        filters={filters}
        onChange={setFilters}
      />
      <BookList books={filteredBooks} />
    </div>
  )
}
```

**检查清单：**
- [ ] 列表页能显示所有书籍
- [ ] 情绪筛选功能正常
- [ ] 媒体类型筛选正常
- [ ] 多条件联合筛选正确
- [ ] 无结果时有友好提示

---

### Week 3-4: 路由整合 & 优化

#### Task 3.1: 路由配置（1天）

**App.tsx：**
```typescript
import { HashRouter, Routes, Route } from 'react-router-dom'
import HomePage from '@pages/HomePage'
import BookListPage from '@pages/BookListPage'
import BookDetailPage from '@pages/BookDetailPage'

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/list" element={<BookListPage />} />
        <Route path="/book/:id" element={<BookDetailPage />} />
      </Routes>
    </HashRouter>
  )
}
```

#### Task 3.2: 数据 Hook 开发（1-2天）

**hooks/useBookData.ts：**
```typescript
import { useState, useEffect } from 'react'
import { Book, BookLibraryConfig, EmotionConfig } from '@types/book'

export function useBookData() {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    Promise.all([
      fetch('/data/books.json').then(r => r.json()),
      fetch('/data/emotions.json').then(r => r.json())
    ])
      .then(([booksData, emotionsData]) => {
        setBooks(booksData.books)
      })
      .catch(err => setError(err))
      .finally(() => setLoading(false))
  }, [])

  return { books, loading, error }
}

export function useEmotionConfig() {
  const [emotions, setEmotions] = useState<EmotionConfig[]>([])

  useEffect(() => {
    fetch('/data/emotions.json')
      .then(r => r.json())
      .then(data => setEmotions(data.emotions))
  }, [])

  return emotions
}
```

---

### Week 4: 动画和优化

#### Task 4.1: 背景动画调整（1-2天）

根据新主题调整背景，参考一期的动画组件

#### Task 4.2: 性能优化（1-2天）

- 图片懒加载
- 虚拟列表（书籍数量较多时）
- CSS 动画优化
- 数据缓存

---

## 📋 日常开发提示

### 每日构建检查

```bash
# 启动开发服务器
yarn dev

# 类型检查
yarn tsc --noEmit

# 代码审查
yarn lint

# 构建测试
yarn build
```

### Git 工作流

```bash
# 每个 Task 创建新的 feature 分支
git checkout -b feature/homepage-dev
git commit -m "feat: implement homepage with book grid"
git push origin feature/homepage-dev

# 完成后创建 PR
gh pr create --title "feat: add homepage" --body "..."
```

### 调试技巧

```typescript
// 快速测试数据加载
useEffect(() => {
  fetch('/data/books.json')
    .then(r => r.json())
    .then(data => console.log('Books loaded:', data))
}, [])

// 检查 TypeScript 错误
yarn tsc --strict
```

---

## 🎯 成功标志

✅ 完成所有 Week 1-2 任务 = 项目基础完成
✅ 完成所有 Week 2-3 任务 = 核心功能完成
✅ 完成所有 Week 3-4 任务 = 项目可发布

