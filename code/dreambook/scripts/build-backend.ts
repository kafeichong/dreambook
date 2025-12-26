import { build } from 'esbuild'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { existsSync, mkdirSync } from 'fs'
import { pnpPlugin } from '@yarnpkg/esbuild-plugin-pnp'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/**
 * 打包后端代码
 *
 * 使用 esbuild 将 backend/src 下的 TypeScript 代码打包成单个 JS 文件
 * 输出到 dist-electron/backend 目录，供 Electron 在生产环境使用
 */
async function buildBackend() {
  console.log('📦 开始打包后端代码...')

  const backendSrcDir = join(__dirname, '../backend/src')
  const outDir = join(__dirname, '../dist-electron/backend')

  // 确保输出目录存在
  if (!existsSync(outDir)) {
    mkdirSync(outDir, { recursive: true })
  }

  try {
    await build({
      // 入口文件
      entryPoints: [join(backendSrcDir, 'index.ts')],

      // 输出配置
      outfile: join(outDir, 'index.js'),
      bundle: true,
      platform: 'node',
      target: 'node18',
      format: 'cjs',  // 使用 CommonJS 格式，便于 pkg 打包成 exe

      // 使用 Yarn PnP 插件解析依赖
      plugins: [pnpPlugin()],

      // 外部依赖（只保留 Node.js 内置模块为 external）
      // 将 express、cors 等第三方依赖打包进去，避免运行时找不到依赖
      external: [],

      // 优化配置
      minify: true,
      sourcemap: false,
      treeShaking: true,

      // 其他配置
      logLevel: 'info',
      color: true,
    })

    console.log('✅ 后端代码打包成功!')
    console.log(`   输出路径: ${outDir}/index.js`)
  } catch (error) {
    console.error('❌ 后端代码打包失败:', error)
    process.exit(1)
  }
}

// 执行打包
buildBackend()
