# 情绪书库 · 二期项目规划

## 📋 项目概述

**应用名称：** 情绪书库（Emotion Library）
**主要功能：** 基于用户情绪推荐图书，包含电子书（二维码）和纸质书（索书码）两种载体
**目标用户：** 公共场所（图书馆、书店等）的互动触屏应用用户
**参考资料：** 一期 DreamBook 项目的技术架构可复用

---

## 🏗️ 数据模型设计

### 1. 新的数据结构

#### 情绪分类体系（8大情绪）

```typescript
// 情绪定义
type EmotionCategory = 'grief' | 'anger' | 'anxiety' | 'fear' | 'disgust' | 'joy' | 'surprise' | 'happiness'

type EmotionLevel = 'light' | 'medium' | 'heavy'  // 轻度 | 中度 | 重度

interface Emotion {
  category: EmotionCategory
  level: EmotionLevel
  name: string           // 中文名称
  color: string         // UI配色
  description: string
}

// 8大情绪映射
const EmotionMap = {
  grief: ['孤独', '低谷', '失落'],        // light, medium, heavy
  anger: ['愤怒', '对抗', '失控'],
  anxiety: ['紧张', '担忧', '关注'],
  fear: ['未知', '不安', '压迫'],
  disgust: ['排斥', '抵触', '不悦'],
  joy: ['放松', '温和', '轻快'],
  surprise: ['新奇', '突破', '震撼'],
  happiness: ['轻盈', '分享', '明亮']
}
```

#### 图书类型

```typescript
type BookMedium = 'ebook' | 'physical'  // 电子书 | 纸质书

interface Book {
  id: string
  title: string
  author: string
  publisher: string
  cover: string                    // 图书封面
  medium: BookMedium

  // 基础信息
  description: string
  category: string

  // 情绪分类
  emotions: {
    category: EmotionCategory
    level: EmotionLevel
  }[]                             // 一本书可能对应多个情绪

  // 电子书专有字段
  qrCode?: string                 // 二维码链接或图片
  externalUrl?: string            // 电子书外链

  // 纸质书专有字段
  catalogCode?: string            // 索书码
  floorCode?: string              // 6F 楼层定位码
  location?: string               // 物理位置描述

  // 通用字段
  rating?: number
  tags?: string[]
  updatedAt?: string
}
```

#### 书库配置

```typescript
interface BookLibraryConfig {
  institution: string             // 机构名称（如图书馆名）
  books: Book[]
  emotionCategories: EmotionCategory[]
  totalBooks: number
}
```

---

## 📊 功能模块设计

### 1. 首页（Home）
- **UI布局：** 网格展示 12 本代表书籍
- **核心元素：**
  - 情绪书库标题 + 副标题
  - 12 本精选书籍的卡片展示
  - 返回按钮（右上角）
  - 底部分页指示（1/2）

**交互流程：**
```
首页显示 12 本书
  → 用户点击书籍
  → 跳转到详情页
  → 显示完整信息（QR/索书码）
```

### 2. 列表页（Book List）
- **按情绪分类展示所有书籍**
- **筛选功能：**
  - 情绪大类筛选（8个）
  - 情绪等级筛选（轻度/中度/重度）
  - 书籍类型筛选（电子书/纸质书）

**UI布局：**
```
[顶部：筛选条件]
┌─────────────────────────┐
│ 筛选器：情绪类别  等级  类型  │
└─────────────────────────┘
[列表区域]
└─ 书籍卡片行
└─ 书籍卡片行
└─ 书籍卡片行
[底部：返回按钮]
```

### 3. 详情页（Book Detail）
- **显示内容：**
  - 书籍封面
  - 基本信息（书名、作者、出版社）
  - 情绪标签展示
  - 条件路由：
    - **电子书：** 显示 QR 码 + 扫码提示
    - **纸质书：** 显示索书码 + 6F 楼层码 + 位置说明
  - 返回按钮

### 4. 情绪轮盘页面（可选 - 参考设计图）
- **展示 8 大情绪的关系图**
- **选择情绪后：** 快速跳转到该情绪的书籍列表

---

## 🗄️ 数据库设计

### 从一期迁移的问题

**一期数据模型：**
```typescript
Dream {
  id, title, emotion, emotionTag: 'JOY'|'SAD'|'FEAR'|'CALM'|'STRESS'
  image, description, advice[]
}
```

**新阶段问题：**
- ❌ 情绪分类不匹配（只有5种 vs 需要8种+3个等级）
- ❌ 数据用途完全不同（梦解析 vs 图书推荐）
- ❌ 字段结构差异大（advice vs emotions+catalogCode）

### 二期数据库结构

#### 方案A：文件系统 + JSON（快速上手，适合初期）
```
public/data/
├── books.json           # 所有书籍数据
├── emotions.json        # 情绪配置
└── config.json          # 应用配置
```

**books.json 结构：**
```json
{
  "books": [
    {
      "id": "ebook_001",
      "title": "《拥抱情绪》",
      "author": "xxx",
      "cover": "/assets/covers/001.jpg",
      "medium": "ebook",
      "emotions": [
        { "category": "anxiety", "level": "light" },
        { "category": "joy", "level": "medium" }
      ],
      "qrCode": "/assets/qrcodes/001.svg",
      "externalUrl": "https://..."
    },
    {
      "id": "physical_002",
      "title": "《走出悲伤》",
      "author": "yyy",
      "cover": "/assets/covers/002.jpg",
      "medium": "physical",
      "emotions": [
        { "category": "grief", "level": "heavy" }
      ],
      "catalogCode": "I210/123",
      "floorCode": "6F",
      "location": "社科类图书区 G区"
    }
  ]
}
```

#### 方案B：数据库（MongoDB/PostgreSQL，更好的扩展性）
```
Collection: books
{
  _id: ObjectId,
  id: String (unique),
  title: String,
  author: String,
  medium: Enum ['ebook', 'physical'],
  emotions: [{ category, level }],
  ebook: { qrCode, externalUrl },
  physical: { catalogCode, floorCode, location },
  metadata: { createdAt, updatedAt }
}

Collection: emotions (参考数据)
{
  category: String,
  levels: [String],
  color: String,
  description: String
}
```

**推荐选择：**
- **初期（MVP）:** 方案A（JSON）- 快速迭代，无需后端数据库
- **后期（完整版）:** 方案B - 支持动态内容管理、后台编辑系统

---

## 🛠️ 技术架构

### 前端架构（继承一期）

**核心技术栈：**
- React 18 + TypeScript
- Vite（快速开发）
- React Router（页面路由）
- CSS Modules（样式隔离）
- Three.js / GSAP（背景动画）

**项目结构：**
```
src/
├── components/
│   ├── BookCard/           # 书籍卡片组件
│   ├── EmotionFilter/      # 情绪筛选器
│   ├── QRCodeDisplay/      # 二维码显示
│   ├── CatalogCodeDisplay/ # 索书码显示
│   ├── Background/         # 背景动画（复用）
│   └── ...
├── pages/
│   ├── HomePage/           # 首页（12本书展示）
│   ├── BookListPage/       # 列表页（按情绪分类）
│   ├── BookDetailPage/     # 详情页
│   ├── EmotionWheelPage/   # 情绪轮盘（可选）
│   └── ...
├── hooks/
│   ├── useBookData/        # 书籍数据管理
│   ├── useEmotionFilter/   # 情绪筛选逻辑
│   └── ...
├── types/
│   └── book.d.ts          # 书籍数据类型定义
├── utils/
│   ├── bookFilter.ts      # 书籍筛选工具
│   ├── emotionConfig.ts   # 情绪配置
│   └── ...
├── services/
│   ├── bookService.ts     # 书籍数据服务
│   └── ...
└── styles/
    └── global.css
```

### 后端架构（可选，取决于需求）

**如果需要动态管理书籍内容：**
```
backend/
├── src/
│   ├── routes/
│   │   ├── books.ts       # GET /api/books, POST /api/books
│   │   └── emotions.ts    # GET /api/emotions
│   ├── services/
│   │   └── bookService.ts
│   ├── models/
│   │   └── Book.ts
│   └── index.ts
```

**API 端点：**
- `GET /api/books` - 获取所有书籍
- `GET /api/books?emotion=anxiety&level=light` - 按情绪筛选
- `GET /api/emotions` - 情绪配置
- `POST /api/books` - 添加新书籍（管理员）

---

## 📱 UI/UX 设计要点

### 色彩方案（参考设计稿）

基于 8 大情绪的渐变配色：
```
悲恸 (Grief)     → 灰蓝色
生气 (Anger)     → 红色系
焦虑 (Anxiety)   → 橙色
恐惧 (Fear)      → 深紫色
厌恶 (Disgust)   → 棕/褐色
愉悦 (Joy)       → 黄色
惊讶 (Surprise)  → 金色
快乐 (Happiness) → 绿色
```

### 响应式设计

- **桌面触屏（1920x1080）：** 主要目标设备
- **平板（1024x768）：** 备选方案
- **手机（375x667）：** 可选支持

### 无障碍设计

- 高对比度的文字和背景
- 清晰的触屏按钮尺寸（最小 44x44px）
- 支持屏幕阅读器

---

## 📌 实现步骤（优先级排序）

### Phase 2.1 - 基础功能（2-3周）

| 优先级 | 任务 | 描述 | 依赖 |
|--------|------|------|------|
| 1 | 数据模型定义 | 定义 Book, Emotion 类型 | 无 |
| 2 | 静态数据准备 | 创建 books.json, emotions.json | Task 1 |
| 3 | 首页开发 | 12本书网格显示 + 分页 | Task 2 |
| 4 | 详情页开发 | 书籍详情展示 + 条件渲染 | Task 2 |
| 5 | 列表页开发 | 书籍列表 + 基础筛选 | Task 2, 4 |
| 6 | 路由整合 | 页面导航逻辑 | Task 3, 4, 5 |

### Phase 2.2 - 增强功能（1-2周）

| 优先级 | 任务 | 描述 | 依赖 |
|--------|------|------|------|
| 7 | 情绪筛选增强 | 多条件联合筛选 | Task 5 |
| 8 | 动画和过渡 | 页面切换动画、卡片动画 | Task 6 |
| 9 | 背景设计 | 针对新主题的背景动画 | Task 3 |
| 10 | 二维码功能 | QR码生成和扫码引导 | Task 4 |

### Phase 2.3 - 管理功能（可选）

| 优先级 | 任务 | 描述 | 依赖 |
|--------|------|------|------|
| 11 | 后端 API | 书籍数据 CRUD | 无 |
| 12 | 管理面板 | 书籍内容编辑界面 | Task 11 |
| 13 | 数据库迁移 | 从 JSON 迁移到数据库 | Task 11 |

---

## 🔄 与一期的联系与差异

### 可复用的部分

| 组件 | 备注 |
|------|------|
| React + TypeScript 框架 | 完整复用 |
| Vite 配置 | 完整复用 |
| 路由系统 | 部分复用（页面不同） |
| 背景动画组件 | 可修改复用 |
| Electron 打包配置 | 大部分复用 |
| 样式系统 | 部分复用（颜色/主题调整） |

### 需要完全重做的部分

| 模块 | 理由 |
|------|------|
| 数据模型 | 梦 vs 书籍，完全不同 |
| 页面布局 | UI 设计从梦解析改为图书展示 |
| 业务逻辑 | 解梦咨询 vs 图书推荐 |
| 后端 API | DeepSeek 集成移除，改为数据查询 |

### 一期参考价值

1. **技术方案验证：** 已验证 Electron + React 的可行性
2. **构建流程：** 打包脚本可直接借鉴
3. **UI 组件库：** 卡片、按钮、动画组件可改进后复用
4. **开发经验：** 触屏应用的注意事项已积累

---

## 🎯 验收标准

### MVP（最小可行产品）
- ✅ 首页能展示 12 本书
- ✅ 详情页显示电子书/纸质书信息
- ✅ 列表页支持按情绪筛选
- ✅ 能在 1920x1080 触屏设备上正常使用

### 完整版
- ✅ 所有 Phase 2.1 和 2.2 任务完成
- ✅ 响应式设计支持多种分辨率
- ✅ 后台管理系统可编辑书籍
- ✅ 性能优化（首屏加载 < 2s）

---

## 📝 后续决策项

1. **数据存储选择：** JSON 文件 vs 数据库？
2. **后端是否需要：** 静态内容 vs 动态管理？
3. **QR 码生成：** 前端生成 vs 预先准备？
4. **设计交付物：** Figma 文件是否包含所有页面？
5. **部署方式：** Electron 应用 vs Web 应用？

---

## 📚 资源清单

### 设计资料
- [ ] 首页设计稿 ✅
- [ ] 列表页设计稿 ✅
- [ ] 情绪轮盘设计稿 ✅
- [ ] 详情页设计稿 ⚠️ 待确认
- [ ] 设计规范文档 ⚠️ 待提供

### 内容资料
- [ ] 12 本精选书籍列表 ⚠️ 待提供
- [ ] 所有图书的详细信息 ⚠️ 待提供
- [ ] 二维码链接 ⚠️ 待收集
- [ ] 索书码和楼层信息 ⚠️ 待提供

### 其他
- [ ] 机构信息（机构名称、LOGO 等） ⚠️ 待确认

