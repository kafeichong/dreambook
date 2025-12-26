import { execSync } from 'child_process'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { existsSync, unlinkSync } from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/**
 * 将后端打包成独立可执行文件
 *
 * 使用 pkg 将 esbuild 打包后的 JS 文件编译成 exe
 * 这样目标机器不需要安装 Node.js
 */
async function buildBackendExe() {
  console.log('📦 开始将后端打包成可执行文件...')

  const backendDir = join(__dirname, '../dist-electron/backend')
  const inputFile = join(backendDir, 'index.js')
  const outputFile = join(backendDir, 'backend')  // pkg 会自动添加 .exe 后缀

  // 检查输入文件是否存在
  if (!existsSync(inputFile)) {
    console.error('❌ 错误: 请先运行 build:backend 生成 index.js')
    console.error(`   缺少文件: ${inputFile}`)
    process.exit(1)
  }

  try {
    // 检测当前平台，决定打包目标
    const platform = process.platform
    let target: string

    if (platform === 'win32') {
      target = 'node18-win-x64'
    } else if (platform === 'darwin') {
      // 在 macOS 上构建 Windows exe（交叉编译）
      target = 'node18-win-x64'
      console.log('⚠️  在 macOS 上交叉编译 Windows exe')
    } else {
      target = 'node18-linux-x64'
    }

    console.log(`🎯 目标平台: ${target}`)
    console.log(`📄 输入文件: ${inputFile}`)
    console.log(`📦 输出文件: ${outputFile}.exe`)

    // 调用 pkg 打包
    const cmd = `npx pkg "${inputFile}" --target ${target} --output "${outputFile}" --compress GZip`
    console.log(`🔧 执行命令: ${cmd}`)

    execSync(cmd, {
      stdio: 'inherit',
      cwd: join(__dirname, '..')
    })

    // 删除原来的 index.js（不再需要）
    if (existsSync(inputFile)) {
      unlinkSync(inputFile)
      console.log('🗑️  已删除 index.js（不再需要）')
    }

    console.log('✅ 后端可执行文件打包成功!')
    console.log(`   输出路径: ${outputFile}.exe`)
  } catch (error) {
    console.error('❌ 打包失败:', error)
    process.exit(1)
  }
}

// 执行打包
buildBackendExe()
