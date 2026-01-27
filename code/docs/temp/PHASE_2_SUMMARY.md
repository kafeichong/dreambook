# 情绪书库 · 二期项目总体规划总结

## 📊 一期 vs 二期对比

### 项目定位

| 维度 | 一期（DreamBook） | 二期（情绪书库） |
|------|------------------|------------------|
| **核心功能** | 梦境解释 + AI 咨询 | 图书推荐系统 |
| **用户场景** | 用户提问梦境 → AI 分析 | 用户选择情绪 → 推荐相应图书 |
| **内容来源** | 预设梦境库 + DeepSeek API | 图书馆图书库 + 二维码/索书码 |
| **交互复杂度** | 中等（AI 对话） | 低（列表筛选） |
| **后端需求** | 必需（API 调用） | 可选（初期不需要） |

### 技术栈对比

| 技术 | 一期 | 二期 | 说明 |
|------|-----|-----|------|
| **前端框架** | React + Vite | React + Vite | 直接复用 ✅ |
| **路由** | React Router + Hash | React Router + Hash | 复用配置 ✅ |
| **TypeScript** | 严格模式 | 严格模式 | 继续使用 ✅ |
| **后端** | Express + DeepSeek | 静态 JSON | 架构完全不同 ❌ |
| **数据存储** | 预设数据 | JSON / 数据库 | 两种都可以 |
| **认证** | 不需要 | 不需要 | 都无需认证 |

### 页面结构对比

**一期页面：**
```
/ (首页介绍)
/navigation (梦境选择)
/dream/:id (梦境详情)
/ai-chat (AI 对话)
```

**二期页面：**
```
/ (首页 - 12本书展示)
/list (列表页 - 按情绪分类)
/book/:id (书籍详情 - 条件渲染)
/emotion-wheel (情绪轮盘 - 可选)
```

---

## 🔄 一期参考价值

### ✅ 完全可复用

1. **项目架构**
   - Vite 配置（已验证可行）
   - TypeScript 配置（严格模式）
   - 路由系统框架
   - Electron 打包脚本

2. **React 组件范例**
   - 卡片组件设计模式
   - 按钮交互逻辑
   - 页面布局组织
   - 状态管理思路

3. **开发工作流**
   - Git 分支策略
   - 构建和打包流程
   - 开发环境配置
   - 调试工具设置

4. **一些 UI 组件**
   - 背景动画系统（可修改）
   - Toast 通知组件
   - Loading 加载状态
   - 响应式设计思想

### ⚠️ 需要改进的部分

1. **数据结构调整**
   - 一期：Dream → 二期：Book
   - 一期：emotionTag (5种) → 二期：emotions[] (8×3 = 24种)
   - 一期：advice[] → 二期：catalogCode, floorCode

2. **后端架构重构**
   - 移除 DeepSeek 集成
   - 移除 AI 对话系统
   - 改为静态数据查询（JSON）或简单 API

3. **UI 设计更新**
   - 梦境主题 → 图书馆主题
   - 紫蓝色渐变 → 8色情绪系统
   - 动画风格调整
   - 信息密度不同

4. **业务逻辑重写**
   - 梦解析逻辑 → 图书筛选逻辑
   - AI 对话流程 → 情绪选择流程
   - 参考资源链接 → 二维码/索书码呈现

---

## 📁 建议的文件组织

### 选项 A：在现有项目中创建分支目录

```
code/dreambook/                      # 一期保持不变
├── src/
│   ├── pages/
│   │   ├── HomePage/               # 梦之书首页
│   │   ├── NavigationPage/         # 梦之书导航
│   │   ├── DetailPage/             # 梦之书详情
│   │   └── AIChat/                 # 梦之书 AI
│   ├── ...
│   └── version.ts                  # 标记为 v1.0
│
├── public/data/
│   └── dreamData.json              # 梦之书数据
│
└── electron/                        # 一期 Electron

code/dreambook-phase2/               # 二期新项目
├── src/
│   ├── pages/
│   │   ├── HomePage/               # 情绪书库首页
│   │   ├── BookListPage/           # 情绪书库列表
│   │   ├── BookDetailPage/         # 情绪书库详情
│   │   └── EmotionWheelPage/       # 情绪轮盘（可选）
│   ├── components/
│   │   ├── BookCard/
│   │   ├── EmotionFilter/
│   │   ├── QRCodeDisplay/
│   │   └── ...
│   ├── types/
│   │   └── book.d.ts               # 书籍类型定义
│   ├── services/
│   │   └── bookService.ts          # 书籍数据服务
│   └── ...
│
├── public/data/
│   ├── books.json                  # 二期书籍数据
│   └── emotions.json               # 情绪配置
│
└── electron/                        # 二期 Electron（可共享一期）

docs/
├── PHASE_1_COMPLETE.md             # 一期总结
├── PHASE_2_PLAN.md                 # ← 你现在看的
├── PHASE_2_ROADMAP.md              # ← 任务分解
├── MIGRATION_GUIDE.md              # 迁移指南（可选）
└── ...
```

### 选项 B：完全独立的新项目

```
dreambook-v1/                       # 一期项目
dreambook-v2/                       # 二期项目
shared/                             # 共享的 UI 库（可选）
docs/                               # 共享文档
```

**推荐选择：** 选项 A
- 历史可追溯性好
- 共享代码配置
- 便于对比学习

---

## 🎯 核心决策树

```
┌─ 如何开始二期？
│
├─ 选择：在现有项目中创建新分支（推荐）
│  ├─ git checkout -b feature/phase-2-main
│  ├─ 保留一期代码用于参考
│  └─ 可共享 Electron 和打包配置
│
├─ 数据怎么存？
│  ├─ 初期（MVP）：JSON 文件 ✅ 推荐
│  │  ├─ 快速迭代
│  │  ├─ 无需后端
│  │  └─ 便于测试
│  │
│  └─ 后期（完整版）：数据库
│     ├─ 支持动态编辑
│     ├─ 需要后端 API
│     └─ 可接入管理系统
│
├─ 后端需要吗？
│  ├─ MVP 阶段：不需要（纯静态）
│  ├─ 扩展阶段：可选
│  │  ├─ 简单 API：GET /api/books
│  │  ├─ 数据管理：POST/PUT/DELETE /api/books
│  │  └─ 可复用一期的 Express 框架
│  │
│  └─ 生产阶段：可能需要
│     └─ 与图书馆系统对接
│
└─ UI 组件如何组织？
   ├─ 复用一期的通用组件
   ├─ 创建二期专用组件
   └─ 考虑未来的共享 UI 库
```

---

## 📝 立即行动清单

### 第一周要完成

- [ ] **资料收集**
  - [ ] 确认 50-100 本书籍列表
  - [ ] 获取所有电子书的二维码
  - [ ] 获取所有纸质书的索书码
  - [ ] 收集书籍封面高清图片

- [ ] **项目初始化**
  - [ ] 创建 feature/phase-2 分支
  - [ ] 复制前端项目结构
  - [ ] 定义 TypeScript 类型
  - [ ] 创建 books.json 和 emotions.json

- [ ] **基础开发**
  - [ ] 搭建首页框架
  - [ ] 实现 BookCard 组件
  - [ ] 验证数据加载
  - [ ] 路由基本配置

### 持续维护

- [ ] 每周回顾进度
- [ ] 及时调整时间表
- [ ] 保持代码质量（TypeScript + ESLint）
- [ ] 记录技术决策

---

## 💡 架构建议

### 分层设计

```
┌─────────────────────────────────┐
│      Pages (页面层)              │
│  HomePage, BookListPage, etc    │
└──────────────┬──────────────────┘
               │
┌──────────────▼──────────────────┐
│    Components (组件层)           │
│  BookCard, Filter, QRCode, etc   │
└──────────────┬──────────────────┘
               │
┌──────────────▼──────────────────┐
│    Hooks (逻辑层)               │
│  useBookData, useEmotionFilter  │
└──────────────┬──────────────────┘
               │
┌──────────────▼──────────────────┐
│    Services (数据层)             │
│  bookService, emotionConfig     │
└──────────────┬──────────────────┘
               │
┌──────────────▼──────────────────┐
│    Types (类型层)               │
│  Book, Emotion, EmotionCategory │
└─────────────────────────────────┘
```

### 数据流

```
用户交互
   ↓
Pages (路由)
   ↓
Components (UI 渲染)
   ↑↓
Hooks (状态管理)
   ↓
Services (数据操作)
   ↓
JSON / API (数据源)
```

---

## 🚨 常见坑点

### 1. 情绪分类混乱
❌ 错误：直接复用一期的 5 个情绪标签
✅ 正确：创建新的 8×3 情绪体系，独立维护

### 2. 数据结构不统一
❌ 错误：有时候用 emotion 字符串，有时候用 emotions 数组
✅ 正确：统一使用 `emotions: { category, level }[]`

### 3. 二维码和索书码混淆
❌ 错误：电子书也显示索书码
✅ 正确：使用 Union Types (EBook | PhysicalBook) 确保类型安全

### 4. 性能问题
❌ 错误：一次性加载 1000 本书，渲染卡顿
✅ 正确：虚拟滚动或分页加载

### 5. 返回按钮逻辑
❌ 错误：所有页面都用 `window.history.back()`
✅ 正确：考虑用户流程，某些情况直接返回首页

---

## 📚 参考文档位置

- `/Users/steven/works/20251130dreambook/code/docs/结构.md` - 新的数据结构规范
- `/Users/steven/works/20251130dreambook/code/docs/PHASE_2_PLAN.md` - 详细规划（本文件）
- `/Users/steven/works/20251130dreambook/code/docs/PHASE_2_ROADMAP.md` - 开发路线图
- `/Users/steven/works/20251130dreambook/code/CLAUDE.md` - 一期项目信息

---

## ✨ 最后的话

**二期项目虽然和一期共享技术栈，但：**

1. 业务逻辑完全不同（梦解析 → 图书推荐）
2. 数据模型需要重新设计（Dream → Book）
3. UI 设计和交互流程不同（AI 对话 → 情绪筛选）

**因此建议：**
- 不要盲目复用一期代码
- 参考一期的架构思想和工具链
- 但独立设计二期的核心功能
- 这样二期会更清晰、更易维护

---

**文档版本：** 1.0
**最后更新：** 2025-01-25
**状态：** 待客户审批 ⏳

