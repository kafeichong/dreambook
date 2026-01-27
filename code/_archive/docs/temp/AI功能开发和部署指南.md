# 梦境解析 AI 功能 - 开发和部署指南

## 📋 概览

已成功为梦境解析应用添加 AI 解梦功能。系统采用 **Electron + 本地 Node 后端** 的架构,所有代码打包在一起,无需额外服务器。

---

## 🎯 功能特性

- ✅ AI 智能解梦（基于 DeepSeek API）
- ✅ 本地后端服务（自动启动,用户无感知）
- ✅ 完整的前端 UI 界面
- ✅ 触摸屏优化的交互体验
- ✅ 错误处理和加载状态
- ✅ 安全的 API Key 管理

---

## 📁 项目结构

```
dreambook/
├── src/                          # 前端代码
│   ├── pages/
│   │   └── AIChat/              # AI 对话页面
│   │       ├── index.tsx
│   │       └── index.css
│   └── services/
│       └── aiService.ts         # AI 服务封装
│
├── backend/                      # 后端代码
│   ├── src/
│   │   ├── index.ts            # 服务入口
│   │   ├── config.ts           # 配置管理
│   │   ├── routes/
│   │   │   └── chat.ts         # 聊天路由
│   │   ├── services/
│   │   │   └── deepseek.ts     # DeepSeek API 调用
│   │   ├── prompts/
│   │   │   └── system.ts       # System Prompt
│   │   └── types/
│   │       └── index.ts        # 类型定义
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example            # 环境变量模板
│
├── electron/
│   └── main.ts                 # 修改：添加后端启动逻辑
│
├── scripts/
│   └── build-backend.ts        # 后端打包脚本
│
└── docs/
    └── AI功能后端架构方案.md    # 技术方案文档
```

---

## 🚀 开发环境搭建

### 1. 配置 DeepSeek API Key

**步骤 1**: 获取 API Key
- 访问 https://platform.deepseek.com/
- 注册并创建 API Key

**步骤 2**: 配置环境变量

创建 `backend/.env` 文件:
```bash
cd backend
cp .env.example .env
```

编辑 `.env` 文件:
```bash
DEEPSEEK_API_KEY=sk-your-api-key-here
DEEPSEEK_API_URL=https://api.deepseek.com
PORT=3000
NODE_ENV=development
```

### 2. 安装后端依赖

```bash
cd backend
npm install
```

### 3. 启动开发环境

**终端 1**: 启动后端服务
```bash
cd backend
npm run dev
```

**终端 2**: 启动前端 + Electron
```bash
# 回到项目根目录
cd ..
npm run electron:dev
```

---

## 🧪 测试功能

### 1. 测试后端服务

**健康检查**:
```bash
curl http://localhost:3000/health
```

**测试 AI 接口**:
```bash
curl -X POST http://localhost:3000/api/dream-chat \
  -H "Content-Type: application/json" \
  -d '{"question":"我梦见自己在天上飞"}'
```

### 2. 测试前端集成

1. 启动 Electron 应用
2. 点击"导航"进入梦境选择页面
3. 点击右下角的 **"AI 解梦"** 按钮（紫色渐变按钮）
4. 输入梦境描述,点击"开始解析"
5. 查看 AI 回答

---

## 📦 生产环境打包

### Windows 打包

**步骤 1**: 配置 API Key

有两种方式配置生产环境的 API Key:

**方式 A**: 修改 `electron/main.ts` (推荐，适合单机部署)
```typescript
// 在 startBackend() 函数中，将 API Key 硬编码
const DEEPSEEK_API_KEY = 'sk-your-production-api-key-here'
```

**方式 B**: 使用环境变量（更安全）
```bash
# Windows
set DEEPSEEK_API_KEY=sk-your-api-key
npm run electron:build:win

# macOS/Linux
export DEEPSEEK_API_KEY=sk-your-api-key
npm run build && electron-builder --mac
```

**步骤 2**: 打包应用
```bash
# Windows
npm run electron:build:win

# macOS
npm run electron:build:mac
```

**步骤 3**: 获取可执行文件

打包完成后,可执行文件位于:
```
dreambook/release/win-unpacked/梦境解析.exe
```

### 部署到触摸屏

1. 复制 `release/win-unpacked/` 整个文件夹到触摸屏机器
2. 双击 `梦境解析.exe` 启动应用
3. 应用会自动启动后端服务,无需额外操作

---

## 🔧 故障排查

### 问题 1: 后端启动失败

**症状**: AI 解梦功能不可用,提示"网络连接失败"

**解决方案**:

1. 检查后端是否正在运行:
   ```bash
   curl http://localhost:3000/health
   ```

2. 查看 Electron 控制台日志:
   - 开发环境: 浏览器开发者工具
   - 生产环境: 检查应用输出日志

3. 确认端口 3000 未被占用:
   ```bash
   # Windows
   netstat -ano | findstr :3000

   # macOS/Linux
   lsof -i :3000
   ```

### 问题 2: API Key 错误

**症状**: 后端日志显示 "DeepSeek API Key 无效"

**解决方案**:

1. 检查 `backend/.env` 文件是否存在且配置正确
2. 确认 API Key 格式正确（以 `sk-` 开头）
3. 验证 API Key 是否有效:
   ```bash
   curl https://api.deepseek.com/chat/completions \
     -H "Authorization: Bearer sk-your-api-key" \
     -H "Content-Type: application/json" \
     -d '{"model":"deepseek-chat","messages":[{"role":"user","content":"测试"}]}'
   ```

### 问题 3: 前端无法连接后端

**症状**: 点击"开始解析"后一直提示"网络连接失败"

**解决方案**:

1. 检查浏览器控制台的网络请求
2. 确认后端服务运行在 http://localhost:3000
3. 检查 CORS 配置（开发环境）
4. 确认防火墙未阻止本地连接

### 问题 4: 打包后无法使用

**症状**: 打包的 .exe 文件可以运行,但 AI 功能不可用

**解决方案**:

1. 检查 `dist-electron/backend/index.js` 文件是否存在
2. 确认 `electron/main.ts` 中的 API Key 配置
3. 查看 `release/` 目录下是否包含 `resources/backend/` 文件夹
4. 手动运行后端检查:
   ```bash
   node release/resources/backend/index.js
   ```

---

## 📝 API 文档

### POST /api/dream-chat

**描述**: 梦境解析接口

**请求体**:
```json
{
  "question": "我梦见自己在天上飞",
  "userId": "optional-user-id"
}
```

**成功响应** (200):
```json
{
  "answer": "梦见飞翔通常反映了你对自由的渴望..."
}
```

**错误响应** (400):
```json
{
  "error": "问题不能为空"
}
```

**错误响应** (500):
```json
{
  "error": "AI 服务暂时不可用,请稍后重试"
}
```

---

## 🎨 UI 页面说明

### AI 对话页面 (`/ai-chat`)

**功能**:
- 输入梦境描述（最多 500 字）
- 提交后显示加载动画
- 展示 AI 解析结果
- 支持清空重新输入

**设计特点**:
- 紫色渐变背景
- 大字体,触摸屏友好
- 加载状态和错误提示
- 响应式设计

**入口**:
- 导航页面右下角的"AI 解梦"按钮

---

## 💡 使用建议

### 对于开发者

1. **开发调试**: 使用两个终端分别运行前后端,方便调试
2. **API Key 管理**: 开发环境使用 `.env`,生产环境硬编码或环境变量
3. **日志查看**: 后端日志会输出到 Electron 控制台
4. **错误处理**: 注意 AI 回答可能失败,需要友好提示用户

### 对于用户

1. **网络要求**: 需要能访问 DeepSeek API (api.deepseek.com)
2. **输入建议**: 梦境描述越详细,AI 回答越准确
3. **等待时间**: AI 解析通常需要 2-5 秒
4. **结果参考**: AI 回答仅供参考,不能替代专业心理咨询

---

## 🔐 安全注意事项

1. **API Key 保护**:
   - 不要将 API Key 提交到 Git 仓库
   - `.env` 文件已添加到 `.gitignore`
   - 生产环境硬编码的 Key 需要定期更换

2. **CORS 配置**:
   - 后端已限制只允许本地访问
   - 生产环境仅允许 `file://*` 协议

3. **输入验证**:
   - 后端已限制问题长度（最大 500 字）
   - 防止 XSS 攻击,不渲染 HTML 标签

---

## 📊 性能指标

- **响应时间**: 平均 2-5 秒
- **API 成本**: 约 ¥0.001-0.003/次
- **内存占用**: 后端约 50-100MB
- **打包体积**: 增加约 5-10MB

---

## 🔄 未来扩展方向

### 短期优化 (1-2 周)
- [ ] 流式输出（SSE）
- [ ] 历史记录保存
- [ ] 语音输入支持

### 中期扩展 (1-2 月)
- [ ] RAG 知识库集成
- [ ] 多模型支持
- [ ] 数据统计分析

### 长期规划 (3+ 月)
- [ ] 多语言支持
- [ ] 离线本地 LLM
- [ ] 云端同步

---

## 📞 技术支持

如遇问题,请按以下步骤操作:

1. **查看日志**: 检查 Electron 控制台和后端日志
2. **参考文档**: 阅读 `docs/AI功能后端架构方案.md`
3. **测试接口**: 使用 curl 测试后端 API
4. **检查网络**: 确认能访问 DeepSeek API

---

## 📚 相关文档

- [技术方案文档](./AI功能后端架构方案.md)
- [DeepSeek API 文档](https://platform.deepseek.com/docs)
- [Electron 文档](https://www.electronjs.org/docs)
- [Express.js 文档](https://expressjs.com/)

---

**最后更新**: 2025-12-12
**版本**: v1.0.0
