# 情绪书库 · 快速参考卡片

## 🎯 项目一览

| 项 | 内容 |
|----|------|
| **项目名** | 情绪书库（Emotion Library） |
| **目标** | 基于用户情绪推荐图书 |
| **用户** | 公共场所触屏应用用户 |
| **主要载体** | 电子书（二维码）+ 纸质书（索书码） |
| **技术栈** | React + TypeScript + Vite + Electron |

---

## 📊 数据系统

### 情绪分类

```
8大情绪 × 3个等级 = 24个情绪子类

悲恸    生气    焦虑    恐惧    厌恶    愉悦    惊讶    快乐
 ↓      ↓      ↓      ↓      ↓      ↓      ↓      ↓
轻度   轻度   轻度   轻度   轻度   轻度   轻度   轻度
中度   中度   中度   中度   中度   中度   中度   中度
重度   重度   重度   重度   重度   重度   重度   重度
```

### 图书类型

```
┌─ 电子书
│  ├─ 访问方式：二维码扫描
│  └─ 显示字段：QR码 + 外链
│
└─ 纸质书
   ├─ 访问方式：索书码查找
   └─ 显示字段：索书码 + 6F楼层码 + 位置说明
```

---

## 📄 页面结构

### 首页 (HomePage)
```
[返回主页]
┌──────────────────────────────────┐
│     情绪书库                      │
│   找到属于你心情的那本书          │
├──────────────────────────────────┤
│  [书1] [书2] [书3] [书4]         │
│  [书5] [书6] [书7] [书8]         │
│  [书9][书10][书11][书12]         │
├──────────────────────────────────┤
│         1 / 2                    │ （分页指示）
└──────────────────────────────────┘
```

### 列表页 (BookListPage)
```
[筛选条件]
情绪类别：[悲恸▼] 等级：[全部▼] 类型：[全部▼]
[搜索...]

┌──────────────────────────────────┐
│  [书籍卡片行]                     │
│  [书籍卡片行]                     │
│  [书籍卡片行]                     │
└──────────────────────────────────┘

[返回]
```

### 详情页 (BookDetailPage)
```
[封面图]
书名
作者

【情绪标签】

┌─ 电子书版本
│  [二维码]
│  "扫描二维码即可阅读"
│  [打开电子书链接]
│
└─ 纸质书版本
   索书码：I210/123
   楼层：6F
   位置：社科类 G 区

[返回]
```

---

## 🗂️ 文件数据格式

### public/data/books.json
```json
{
  "books": [
    {
      "id": "ebook_001",
      "title": "拥抱情绪",
      "author": "作者名",
      "publisher": "出版社",
      "cover": "/assets/covers/001.jpg",
      "medium": "ebook",
      "emotions": [
        {"category": "anxiety", "level": "light", "name": "紧张"}
      ],
      "qrCode": "/assets/qrcodes/001.svg",
      "externalUrl": "https://..."
    },
    {
      "id": "physical_001",
      "title": "走出悲伤",
      "medium": "physical",
      "catalogCode": "I565/123",
      "floorCode": "6F",
      "location": "文学类 H 区"
    }
  ]
}
```

### public/data/emotions.json
```json
{
  "emotions": [
    {
      "category": "grief",
      "names": ["孤独", "低谷", "失落"],
      "color": "#7B68B6",
      "description": "与失去、孤单相关的情绪"
    }
  ]
}
```

---

## 💻 核心类型定义

```typescript
type EmotionCategory = 'grief'|'anger'|'anxiety'|'fear'|'disgust'|'joy'|'surprise'|'happiness'
type EmotionLevel = 'light' | 'medium' | 'heavy'
type BookMedium = 'ebook' | 'physical'

interface Book {
  id: string
  title: string
  medium: BookMedium
  emotions: { category, level, name }[]
  // 电子书字段
  qrCode?: string
  externalUrl?: string
  // 纸质书字段
  catalogCode?: string
  floorCode?: string
  location?: string
}
```

---

## 🚀 快速启动

### 前置准备
```
□ 50-100 本书籍数据
□ 电子书二维码链接
□ 纸质书索书码信息
□ 书籍封面图片
```

### 项目初始化
```bash
# 创建分支
git checkout -b feature/phase-2-main

# 安装依赖
yarn install

# 启动开发
yarn dev

# 创建数据文件
# public/data/books.json
# public/data/emotions.json
```

### 关键任务顺序
```
1. 类型定义 (types/book.d.ts)
   ↓
2. 静态数据 (public/data/*.json)
   ↓
3. BookCard 组件
   ↓
4. 首页开发
   ↓
5. 详情页开发
   ↓
6. 列表页开发
   ↓
7. 路由集成
```

---

## 📱 关键交互流程

### 用户使用流程 1：浏览首页
```
进入应用
  ↓
显示首页（12本推荐书）
  ↓
用户点击某本书
  ↓
跳转详情页
  ↓
显示 QR 码 或 索书码
  ↓
返回首页
```

### 用户使用流程 2：按情绪筛选
```
进入应用
  ↓
点击"浏览全部"或"按情绪筛选"
  ↓
选择情绪类别（如：悲恸）
  ↓
选择强度（如：重度）
  ↓
列表显示匹配的书籍
  ↓
点击某本书查看详情
```

---

## ⚡ 开发检查清单

### 每日检查
- [ ] 代码能正常编译（`yarn build`）
- [ ] TypeScript 无错误（`yarn tsc --noEmit`）
- [ ] ESLint 通过（`yarn lint`）
- [ ] 功能能在 1920x1080 设备上正常运行

### 功能完成检查
- [ ] 数据正确加载
- [ ] 路由导航正常
- [ ] 电子书和纸质书显示区别
- [ ] 筛选逻辑正确
- [ ] 返回按钮有效

### 质量检查
- [ ] 无 TypeScript 类型错误
- [ ] 无控制台警告
- [ ] 响应式设计合理
- [ ] 性能可接受

---

## 🔗 资源链接

| 资源 | 位置 |
|------|------|
| 详细规划 | `/code/docs/PHASE_2_PLAN.md` |
| 开发路线图 | `/code/docs/PHASE_2_ROADMAP.md` |
| 总体总结 | `/code/docs/PHASE_2_SUMMARY.md` |
| 新的结构规范 | `/code2/docs/结构.md` |

---

## ❓ 常见问题

**Q：能复用一期代码吗？**
A：工具链可以复用（Vite、Electron），但业务逻辑需要重新写

**Q：初期需要后端吗？**
A：不需要，使用 JSON 文件即可；后期可选择添加 API

**Q：如何处理那么多书籍？**
A：初期 MVP 用虚拟列表或分页；后期考虑接入数据库

**Q：二维码怎么生成？**
A：前端可用库生成，或预先准备 SVG 文件

**Q：一期能保留吗？**
A：可以，建议在同一项目中使用不同分支或文件夹

---

**版本：** 1.0
**日期：** 2025-01-25
**状态：** 待审批

