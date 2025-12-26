import { build } from 'esbuild'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { existsSync, mkdirSync } from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const isDev = process.env.NODE_ENV !== 'production'
const outputDir = join(__dirname, '../dist-electron')

// 确保输出目录存在
if (!existsSync(outputDir)) {
  mkdirSync(outputDir, { recursive: true })
}

// 并行构建 Electron 主进程和预加载脚本
Promise.all([
  // 构建 Electron 主进程
  build({
    entryPoints: [join(__dirname, '../electron/main.ts')],
    bundle: true,
    platform: 'node',
    target: 'node20',
    outfile: join(outputDir, 'main.js'),
    format: 'esm', // 使用 ES 模块格式以匹配 package.json 的 "type": "module"
    external: ['electron'],
    sourcemap: isDev,
    minify: !isDev,
    define: {
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production')
    },
    inject: [] // 不注入任何代码
  }),
  // 构建 Electron 预加载脚本
  // 注意：preload 脚本必须是 CommonJS 格式，因为 Electron 使用 require() 加载它
  // 使用 .cjs 扩展名，这样即使 package.json 有 "type": "module" 也会被当作 CommonJS
  build({
    entryPoints: [join(__dirname, '../electron/preload.ts')],
    bundle: true,
    platform: 'node',
    target: 'node20',
    outfile: join(outputDir, 'preload.cjs'), // 使用 .cjs 扩展名
    format: 'cjs', // Preload 脚本必须是 CommonJS 格式
    external: ['electron'],
    sourcemap: isDev,
    minify: !isDev,
    define: {
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production')
    }
  })
])
  .then(() => {
    console.log('✓ Electron files built successfully!')
  })
  .catch((error) => {
    console.error('✗ Failed to build Electron files:', error)
    process.exit(1)
  })

