# DreamBook 改版方案 V2（2025-01-20）

## 📋 项目改版背景

### 主要驱动因素
1. **触摸屏虚拟键盘问题**：由于技术原因，虚拟键盘无法稳定弹出
2. **产品决策**：客户决定移除搜索功能，只保留展示功能
3. **功能升级**：集成二维码，支持用户通过扫码与后端交互
4. **架构演进**：准备将后端从单机部署迁移到服务器

---

## 📊 现状分析

### 当前架构

#### 前端应用（Electron + React）
```
NavigationPage
├── SearchBox (搜索框) ← 需要移除
│   ├── 虚拟键盘集成 (useVirtualKeyboard hook)
│   └── 搜索触发跳转到 AIChat
├── DreamSceneCard (梦境卡片网格) ← 保留
│   └── 点击卡片进入 DetailPage
└── AIChat (AI 解梦页面) ← 保留

DetailPage
└── 梦境详情展示 ← 需要增强（添加二维码）
```

#### 后端服务（Express.js）
- **部署方式**：本地运行 (localhost:3000)
- **主要接口**：`POST /api/dream-chat`
- **集成服务**：DeepSeek API for AI 梦境解析

#### 触摸屏问题根源
- Windows TabTip.exe 虚拟键盘调用不稳定
- SearchBox 中已有虚拟键盘处理代码但效果不佳
- 根本原因：一些 Windows 系统版本和驱动程序不兼容

---

## 💡 改版方案

### 方案总体思路：渐进式迁移 + 功能优化

采用**两阶段改版**，第一阶段立即执行（移除搜索、添加二维码），第二阶段后续执行（服务器部署）

---

## 🎯 方案详解

### 方案一：前端改动（搜索功能移除）

#### 1️⃣ 移除 SearchBox 组件

**涉及文件**
- `src/pages/NavigationPage/NavigationPage.tsx`
- `src/components/SearchBox/` 整个文件夹

**修改内容**
```typescript
// 删除以下内容：
- import { SearchBox } from '@components/SearchBox'
- <SearchBox onSearch={handleSearch} />
- handleSearch 函数定义
- searchSectionRef 的创建和动画
```

**好处**
- 完全消除虚拟键盘问题
- 简化 UI 复杂度
- 减少维护代码量

#### 2️⃣ 删除虚拟键盘相关逻辑

**涉及文件**
- `src/hooks/useVirtualKeyboard.ts`（可选保留，用于其他输入框）
- `src/pages/NavigationPage/NavigationPage.tsx`（搜索相关调用删除）

**删除项**
```typescript
- const handleWrapperClick
- const handleTouchStart
- onClick 和 onTouchStart 事件处理
- 虚拟键盘相关的 ref 和 setState
```

#### 3️⃣ 优化梦境卡片交互

**保留的功能**
- 梦境卡片网格展示（10 个预设梦境）
- 点击卡片进入详情页面 (DetailPage)
- 支持从 DetailPage 进行 AI 解梦

**UI 优化**
- 卡片可增加 "扫码解梦" 或 "AI 解析" 提示
- 保留现有的卡片动画效果

---

### 方案二：新增二维码功能

#### 1️⃣ 在 DetailPage 中添加二维码区域

**涉及文件**
- `src/pages/DetailPage/DetailPage.tsx`
- `src/pages/DetailPage/DetailPage.module.css`

**修改内容**
```typescript
// 新增导入
import QRCode from 'qrcode.react'

// 在 DetailPage 中新增二维码区域
<div className={styles.qrcodeSection}>
  <p className={styles.qrcodeLabel}>扫码进行 AI 解梦</p>
  <QRCode
    value={generateQRUrl(dreamId)}
    size={200}
    level="H"
    includeMargin={true}
  />
  <p className={styles.qrcodeHint}>用手机扫描二维码，进行 AI 梦境解析</p>
</div>
```

**二维码链接格式**
```
第一阶段（单机环境）:
https://localhost:3000/dream/{dreamId}/chat

第二阶段（服务器环境）:
https://api.dreambook.com/dream/{dreamId}/chat
或
https://dream.link/s/{shareToken}
```

#### 2️⃣ 添加 qrcode.react 依赖

```bash
yarn add qrcode.react
```

#### 3️⃣ 二维码显示位置
- DetailPage 底部或右侧
- 宽度自适应，在手机上也能清晰显示
- 配套文字说明

---

### 方案三：后端 API 架构改动

#### 当前 API（单机）

```
POST /api/dream-chat
  ├─ 请求体: { question: string, userId?: string }
  └─ 响应: { answer: string }
```

#### 第二阶段扩展 API（服务器）

```
GET  /health                          ← 健康检查
GET  /api/dreams                      ← 获取梦境列表
GET  /api/dreams/{dreamId}            ← 获取单个梦境详情
GET  /api/dreams/{dreamId}/qrcode     ← 生成二维码
POST /api/dreams/{dreamId}/chat       ← 该梦境的 AI 解析
POST /api/dreams/{dreamId}/share      ← 生成分享链接
GET  /api/share/{shareId}             ← 访问分享页面
GET  /health                          ← 健康检查
```

#### API 响应格式示例

```json
// POST /api/dreams/{dreamId}/chat
{
  "dreamId": "1",
  "question": "我梦见自己在飞...",
  "answer": "这个梦境反映了...",
  "timestamp": 1705779600000
}

// GET /api/dreams/{dreamId}/qrcode
{
  "dreamId": "1",
  "qrcodeUrl": "https://api.dreambook.com/dream/1/chat",
  "qrcodeImage": "data:image/png;base64,...",
  "expiresIn": 2592000
}
```

---

### 方案四：配置管理与部署

#### 环境配置分离

**前端环境变量** (`code/dreambook/.env`)
```
VITE_API_BASE_URL=http://localhost:3000      # 开发环境
# 或
VITE_API_BASE_URL=https://api.dreambook.com  # 生产环境
```

**后端环境变量** (`code/dreambook/backend/.env`)
```
NODE_ENV=development
PORT=3000
DEEPSEEK_API_KEY=sk-xxxxx
DEEPSEEK_API_URL=https://api.deepseek.com

# 第二阶段添加
DB_URL=mysql://user:pass@host/dreambook
REDIS_URL=redis://host:6379
QRCODE_BASEURL=https://api.dreambook.com
```

#### 单机 vs 服务器切换

**Electron 主进程** (`electron/main.ts`)
```typescript
// 开发/测试：启动本地后端
if (isDevelopment) {
  startBackendProcess()
}

// 生产/服务器：使用远程 API
const backendURL = process.env.BACKEND_URL || 'https://api.dreambook.com'
```

---

## 📝 改版执行清单

### 第一阶段（立即执行）✅

| 序号 | 任务 | 文件 | 优先级 | 预计工作量 | 状态 |
|------|------|------|-------|----------|------|
| 1.1 | 删除 SearchBox 组件和使用 | `NavigationPage.tsx` | 🔴 高 | 30min | 待做 |
| 1.2 | 删除搜索相关函数和事件 | `NavigationPage.tsx` | 🔴 高 | 20min | 待做 |
| 1.3 | 删除虚拟键盘相关代码 | `NavigationPage.tsx` | 🔴 高 | 15min | 待做 |
| 1.4 | 删除 SearchBox 组件文件夹 | `src/components/SearchBox/` | 🔴 高 | 5min | 待做 |
| 1.5 | 新增二维码区域 | `DetailPage.tsx` | 🟡 中 | 45min | 待做 |
| 1.6 | 二维码样式 | `DetailPage.module.css` | 🟡 中 | 30min | 待做 |
| 1.7 | 安装 qrcode.react 依赖 | `package.json` | 🟢 低 | 5min | 待做 |
| 1.8 | 测试和验证 | - | 🟡 中 | 30min | 待做 |

**第一阶段总预计工作量**：约 2.5-3 小时

### 第二阶段（后续执行）⏳

| 序号 | 任务 | 文件 | 优先级 | 预计工作量 | 状态 |
|------|------|------|-------|----------|------|
| 2.1 | 服务器选型与购买 | - | 🔴 高 | 准备 | 待做 |
| 2.2 | 后端 API 扩展 | `backend/src/routes/` | 🟡 中 | 4-6h | 待做 |
| 2.3 | 数据库设计 | - | 🟡 中 | 2-3h | 待做 |
| 2.4 | 环境配置分离 | `config.ts` 等 | 🟡 中 | 1-2h | 待做 |
| 2.5 | 前端 API 调用更新 | `aiService.ts` 等 | 🟡 中 | 2-3h | 待做 |
| 2.6 | 服务器部署脚本 | - | 🟡 中 | 2-3h | 待做 |
| 2.7 | SSL/HTTPS 配置 | - | 🔴 高 | 1-2h | 待做 |
| 2.8 | H5 分享页面开发 | - | 🟡 中 | 3-4h | 待做 |
| 2.9 | 测试与优化 | - | 🟡 中 | 2-3h | 待做 |

**第二阶段总预计工作量**：约 20-30 小时

---

## 🔄 迁移路径图

```
当前状态（V1）
│
├─ 第一阶段改版
│  ├─ ✅ 删除 SearchBox
│  ├─ ✅ 添加二维码
│  └─ ✅ UI 优化
│
└─ V1.1 版本（单机 + 二维码）
   │
   ├─ 第二阶段改版
   │  ├─ ✅ API 扩展
   │  ├─ ✅ 服务器部署
   │  ├─ ✅ 前端改造
   │  └─ ✅ 分享功能
   │
   └─ V2.0 版本（分布式 + 社交分享）
      └─ ✅ 完整的云端解决方案
```

---

## 📂 文件变更汇总

### 需要删除的文件
```
src/components/SearchBox/
├── SearchBox.tsx
├── SearchBox.module.css
└── index.ts
```

### 需要修改的文件
```
src/pages/NavigationPage/
├── NavigationPage.tsx          (删除搜索逻辑)
└── NavigationPage.module.css   (删除搜索样式)

src/pages/DetailPage/
├── DetailPage.tsx              (新增二维码区域)
└── DetailPage.module.css       (新增二维码样式)

package.json                    (新增 qrcode.react 依赖)
```

### 需要新增的文件
```
src/utils/qrcode.ts             (可选：二维码生成工具函数)
```

---

## ✨ 核心优势

| 优势 | 说明 |
|------|------|
| 🎯 **立即解决痛点** | 完全消除虚拟键盘问题，提高用户体验 |
| 🔒 **保留核心功能** | 用户仍可通过卡片和二维码进行 AI 解梦 |
| 📱 **增强互动性** | 二维码扫描带来新的交互方式和分享潜力 |
| 🚀 **易于扩展** | 为后续服务器部署和社交分享做好准备 |
| 📦 **最小改动** | 第一阶段改动主要集中在 UI 层，业务逻辑无需重构 |
| 💰 **成本控制** | 渐进式改造，分阶段投入，风险可控 |

---

## ⚠️ 风险评估

| 风险 | 影响 | 缓解方案 |
|------|------|--------|
| 用户习惯改变 | 部分用户可能不适应无搜索框 | 增强二维码引导文案 |
| 网络依赖 | 扫码功能依赖网络连接 | 单机仍可运行，网络故障时降级 |
| 二维码显示 | 在高分辨率屏幕可能显示过小 | 支持二维码大小调整 |
| 服务器迁移复杂度 | 第二阶段难度较高 | 充分测试，制定回滚方案 |

---

## 🧪 测试计划

### 第一阶段测试
- [ ] NavigationPage 正常加载（无 SearchBox）
- [ ] 梦境卡片可点击跳转
- [ ] DetailPage 二维码正常显示
- [ ] 二维码内容正确
- [ ] 响应式布局测试（1920x1080, 1080x1920 等）
- [ ] 触摸屏交互测试
- [ ] 虚拟键盘完全不弹出（验证问题解决）

### 第二阶段测试
- [ ] 服务器 API 响应正常
- [ ] 二维码 URL 有效
- [ ] H5 分享页面加载正常
- [ ] 扫码流程完整
- [ ] 性能测试（并发用户）
- [ ] 安全测试（API 认证、数据加密）

---

## 📞 后续行动

1. **确认方案**：与产品团队、客户确认改版方案
2. **时间规划**：确定第一阶段、第二阶段的执行时间
3. **资源分配**：分配开发、测试、部署资源
4. **版本管理**：创建 feature 分支进行开发
5. **文档更新**：根据实际改版进展更新此文档

---

## 📎 附录

### 相关参考文件
- 项目 README：`../README.md`
- 架构指南：`code/CLAUDE.md`
- 前端开发指南：`code/docs/`
- Electron 打包指南：`code/docs/0113/ELECTRON_PACKAGING_METHOD.md`

### 相关技术文档
- [qrcode.react 官方文档](https://github.com/davidcreate/react-qr-code)
- [Express.js 官方文档](https://expressjs.com/)
- [Electron 官方文档](https://www.electronjs.org/)
- [React Router 官方文档](https://reactrouter.com/)

### 联系方式
- 产品决策：待定
- 开发负责人：待定
- 测试负责人：待定

---

**文档版本**：V2
**最后更新**：2025-01-20
**下一次审查**：第一阶段完成后
