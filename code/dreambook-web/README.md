# DreamBook Web

梦境解析网页版前端

## 功能

- 用户输入梦境描述
- 实时 AI 解析展示
- 精美的交互界面和动画效果
- 响应式设计

## 技术栈

- React 19
- TypeScript
- Vite
- React Router
- GSAP (动画)
- Three.js (3D 效果)

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 访问 http://localhost:5173
```

## 构建

```bash
# 构建生产版本
npm run build

# 产物在 dist/ 目录
# 大小：~2-3MB（压缩后）
```

## 部署

**不需要独立 Docker 容器！**

将构建产物复制到服务器现有的 Nginx 容器：

```bash
# 1. 构建
npm run build

# 2. 复制到 Nginx
docker cp dist emotion-library-nginx-prod:/usr/share/nginx/html/dreambook

# 3. 配置 Nginx（见 ../deploy/nginx-configs/）

# 4. 重载 Nginx
docker exec emotion-library-nginx-prod nginx -s reload
```

详细部署步骤见 `../deploy/README.md`

## 项目结构

```
src/
├── App.tsx              # 主应用组件
├── main.tsx             # 入口文件
├── pages/               # 页面组件
├── components/          # 公共组件
├── services/            # API 服务
├── hooks/               # 自定义 Hooks
├── utils/               # 工具函数
└── styles/              # 样式文件
```

## API 配置

前端默认通过当前域名 + `/api` 调用后端接口。

如需自定义 API 地址，在构建时设置环境变量：

```bash
VITE_API_URL=http://your-api-url npm run build
```

## 开发命令

```bash
npm run dev       # 启动开发服务器
npm run build     # 构建生产版本
npm run preview   # 预览生产构建
npm run lint      # 代码检查
```
