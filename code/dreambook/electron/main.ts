import { app, BrowserWindow, Menu, screen, ipcMain, globalShortcut } from 'electron'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { exec, spawn, ChildProcess } from 'child_process'
import { createWriteStream, WriteStream, existsSync } from 'fs'
import { homedir } from 'os'

// ES 模块中获取 __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// 日志文件路径（用户主目录）
const logDir = join(homedir(), 'dreambook-logs')
const logFile = join(logDir, `app-${new Date().toISOString().split('T')[0]}.log`)
let logStream: WriteStream | null = null

// 创建日志目录和日志流
import { existsSync, mkdirSync } from 'fs'
if (!existsSync(logDir)) {
  mkdirSync(logDir, { recursive: true })
}
logStream = createWriteStream(logFile, { flags: 'a' })

// 日志函数
function log(message: string): void {
  const timestamp = new Date().toISOString()
  const logMessage = `[${timestamp}] ${message}\n`
  console.log(message)
  logStream?.write(logMessage)
}

log(`===== 应用启动 =====`)
log(`日志文件: ${logFile}`)
log(`====================`)

// 禁用默认菜单栏（适合触摸屏应用）
Menu.setApplicationMenu(null)

// 启用硬件加速
app.commandLine.appendSwitch('enable-gpu-rasterization')
app.commandLine.appendSwitch('enable-zero-copy')

// 测试模式：打包后也显示 DevTools（方便调试虚拟键盘）
// 正式发布请保持为 false，避免自动弹出调试窗口
const ENABLE_DEVTOOLS_IN_PRODUCTION = false

// 错误处理：捕获未处理的异常
process.on('uncaughtException', (error) => {
  log(`❌ 未捕获的异常: ${error.message}`)
  log(`堆栈: ${error.stack}`)
  console.error('Uncaught Exception:', error)
})

process.on('unhandledRejection', (reason, promise) => {
  log(`❌ 未处理的 Promise 拒绝: ${reason}`)
  console.error('Unhandled Rejection at:', promise, 'reason:', reason)
})

let mainWindow: BrowserWindow | null = null
let backendProcess: ChildProcess | null = null
let isQuitting = false // 是否正在退出应用（用于窗口关闭保护）

// ============ 后端服务管理 ============

/**
 * 启动后端服务
 *
 * 为什么需要这个功能？
 * 1. AI 解梦功能需要后端服务调用 DeepSeek API
 * 2. API Key 不能暴露在前端代码中,必须由后端调用
 * 3. Electron 应用启动时自动启动本地后端服务,用户无感知
 */
async function startBackend(): Promise<void> {
  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged

  if (isDev) {
    // 开发环境：假设手动启动后端 (cd backend && npm run dev)
    log('===== 后端服务 (开发模式) =====')
    log('请手动启动后端服务: cd backend && npm run dev')
    log('================================')
    return
  }

  // 生产环境：启动打包后的后端
  try {
    // 根据平台选择可执行文件
    const isWindows = process.platform === 'win32'
    const backendExeName = isWindows ? 'backend.exe' : 'backend'
    const backendPath = join(process.resourcesPath, 'backend', backendExeName)

    log('===== 后端服务 (生产模式) =====')
    log(`后端路径: ${backendPath}`)
    log(`资源路径: ${process.resourcesPath}`)
    log(`平台: ${process.platform}`)

    // 检查后端文件是否存在
    if (!existsSync(backendPath)) {
      log(`❌ 错误: 后端可执行文件不存在: ${backendPath}`)
      log('可能原因:')
      log('  1. 打包时后端 exe 没有正确生成')
      log('  2. electron-builder 配置中 extraResources 配置有误')
      log('  3. build-backend-exe.ts 脚本执行失败')
      log('================================')
      return
    }

    log('✅ 后端可执行文件存在')

    // 配置 DeepSeek API Key
    // 注意：单机部署可以硬编码，如果需要更安全的方式，可以使用配置文件
    const DEEPSEEK_API_KEY = 'sk-f38cfcc0a0904d87b12637da0ca794bc'

    if (!DEEPSEEK_API_KEY || DEEPSEEK_API_KEY === 'sk-xxxxxxxxxxxxxxxxxxxxxxxx') {
      log('❌ 错误: DEEPSEEK_API_KEY 未配置')
      log('请在 electron/main.ts 中配置有效的 API Key')
      log('================================')
      return
    }

    log(`API Key 已配置: ${DEEPSEEK_API_KEY.substring(0, 10)}...`)

    // 直接运行打包后的可执行文件（不需要系统安装 Node.js）
    backendProcess = spawn(backendPath, [], {
      stdio: ['ignore', 'pipe', 'pipe'],
      env: {
        ...process.env,
        PORT: '3000',
        NODE_ENV: 'production',
        DEEPSEEK_API_KEY: DEEPSEEK_API_KEY,
        DEEPSEEK_API_URL: 'https://api.deepseek.com',
      },
    })

    // 监听后端输出
    backendProcess.stdout?.on('data', (data) => {
      log(`[Backend] ${data.toString().trim()}`)
    })

    backendProcess.stderr?.on('data', (data) => {
      log(`[Backend Error] ${data.toString().trim()}`)
    })

    backendProcess.on('error', (error) => {
      log(`❌ 后端服务启动失败: ${error.message}`)
    })

    backendProcess.on('close', (code) => {
      log(`后端服务进程退出, 退出码: ${code}`)
      backendProcess = null
    })

    log(`✅ 后端进程已启动 (PID: ${backendProcess.pid})`)
    log('等待后端服务启动...')

    // 等待后端服务真正启动（健康检查）
    const maxRetries = 15 // 最多重试 15 次
    const retryInterval = 500 // 每次间隔 500ms
    let retries = 0
    let backendReady = false

    while (retries < maxRetries && !backendReady) {
      await new Promise((resolve) => setTimeout(resolve, retryInterval))
      retries++

      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 1000)

        const response = await fetch('http://localhost:3000/health', {
          method: 'GET',
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        if (response.ok) {
          backendReady = true
          const data = await response.json()
          log(`✅ 后端服务启动成功! (尝试 ${retries} 次)`)
          log(`   版本: ${data.version || 'unknown'}`)
          log(`   地址: http://localhost:3000`)
          log('================================')
        }
      } catch (error) {
        // 忽略健康检查失败，继续重试
        if (retries % 3 === 0) {
          log(`后端健康检查失败，继续等待... (${retries}/${maxRetries})`)
        }
      }
    }

    if (!backendReady) {
      log('❌ 后端服务启动超时')
      log('后端进程已启动，但健康检查失败')
      log('可能原因:')
      log('  1. 端口 3000 被占用')
      log('  2. 后端可执行文件损坏或不兼容')
      log('  3. 防火墙阻止了端口访问')
      log('请按 F12 打开开发者工具查看详细日志')
      log('================================')
    }
  } catch (error) {
    log(`❌ 启动后端服务异常: ${error}`)
    log('================================')
  }
}

/**
 * 关闭后端服务
 */
function stopBackend(): void {
  if (backendProcess) {
    console.log('正在关闭后端服务...')
    backendProcess.kill('SIGTERM')
    backendProcess = null
    console.log('✅ 后端服务已关闭')
  }
}

// ============ Windows 任务栏控制 ============

/**
 * 隐藏/显示 Windows 任务栏
 */
function setTaskbarVisibility(visible: boolean): void {
  if (process.platform !== 'win32') return

  const action = visible ? '显示' : '隐藏'
  log(`[任务栏] 正在${action}任务栏...`)

  // 使用 nircmd 或 PowerShell 隐藏任务栏
  // 方法：直接隐藏任务栏窗口
  const hideCmd = `powershell -Command "$taskbar = [System.Runtime.InteropServices.Marshal]::GetDelegateForFunctionPointer((Add-Type -MemberDefinition '[DllImport(\\\"user32.dll\\\")] public static extern IntPtr FindWindow(string a, string b);' -Name W -PassThru)::FindWindow('Shell_TrayWnd',''), [Func[IntPtr]]); $hwnd = (Get-Process -Name explorer | Where-Object {$_.MainWindowHandle -ne 0}).MainWindowHandle; Add-Type -MemberDefinition '[DllImport(\\\"user32.dll\\\")] public static extern bool ShowWindow(IntPtr h, int c);' -Name S -PassThru; [S]::ShowWindow([W]::FindWindow('Shell_TrayWnd',''), ${visible ? '5' : '0'})"`

  exec(hideCmd, (error) => {
    if (error) {
      log(`[任务栏] 方法1失败，尝试备用方法...`)
      // 备用方法：直接用简单的命令
      const simpleCmd = visible
        ? 'powershell -Command "(New-Object -ComObject Shell.Application).ToggleDesktop()"'
        : 'powershell -Command "& {Add-Type -Name W -Namespace N -MemberDefinition \'[DllImport(\"user32.dll\")] public static extern int FindWindow(string c, string w); [DllImport(\"user32.dll\")] public static extern int ShowWindow(int h, int s);\'; [N.W]::ShowWindow([N.W]::FindWindow(\"Shell_TrayWnd\", \"\"), 0)}"'

      exec(simpleCmd, (err2) => {
        if (err2) {
          log(`[任务栏] ${action}失败: ${err2.message}`)
        } else {
          log(`[任务栏] ✅ 已${action}（备用方法）`)
        }
      })
    } else {
      log(`[任务栏] ✅ 已${action}`)
    }
  })
}

// ============ Windows 虚拟键盘 ============

/**
 * 显示 Windows 虚拟键盘
 *
 * 为什么需要这个功能？
 * 1. Windows 触摸屏设备上，Electron 应用中的输入框获取焦点时，系统不会自动弹出虚拟键盘
 * 2. 需要主进程调用 Windows 系统的虚拟键盘程序（TabTip.exe 或 osk.exe）
 * 3. 前端代码无法直接调用系统程序，必须通过 Electron IPC 通信
 *
 * 优化说明：
 * - 支持 32位/64位系统路径检测
 * - 添加延迟和重试机制，提升触摸屏兼容性
 * - 防止重复调用
 * - 详细日志记录，便于调试
 */

// 虚拟键盘进程状态
let isKeyboardStarting = false
let keyboardStartTime = 0
const KEYBOARD_DEBOUNCE_TIME = 1000 // 1秒内不重复调用

/**
 * 查找 TabTip.exe 路径（支持 32位/64位）
 */
function findTabTipPath(): string {
  const isDev = !app.isPackaged
  const possiblePaths = [
    'C:\\Program Files\\Common Files\\microsoft shared\\ink\\TabTip.exe',
    'C:\\Program Files (x86)\\Common Files\\microsoft shared\\ink\\TabTip.exe',
  ]

  if (isDev) {
    console.log('[虚拟键盘] 可能的 TabTip.exe 路径:', possiblePaths)
  }

  // 返回第一个路径（通常是 64位路径）
  return possiblePaths[0]
}

/**
 * 使用 PowerShell 调用虚拟键盘（Win11 更可靠的方式）
 */
function showKeyboardViaPowerShell(): void {
  const isDev = !app.isPackaged

  // PowerShell 脚本：通过 COM 接口调用虚拟键盘
  const psScript = `
    Add-Type -AssemblyName System.Windows.Forms;
    $signature = @'
    [DllImport("user32.dll", CharSet = CharSet.Auto)]
    public static extern IntPtr FindWindow(string className, string windowTitle);
    [DllImport("user32.dll")]
    public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);
'@;
    $showWindow = Add-Type -MemberDefinition $signature -Name Win32ShowWindow -Namespace Win32Functions -PassThru;
    $tabtip = $showWindow::FindWindow("IPTip_Main_Window", $null);
    if ($tabtip -eq [IntPtr]::Zero) {
      Start-Process "ms-availableinsettings:touch-keyboard" -ErrorAction SilentlyContinue
      Start-Sleep -Milliseconds 200
      $tabtip = $showWindow::FindWindow("IPTip_Main_Window", $null);
    }
    if ($tabtip -ne [IntPtr]::Zero) {
      $showWindow::ShowWindow($tabtip, 9) | Out-Null;
    }
  `.trim()

  if (isDev) {
    log('[虚拟键盘] 使用 PowerShell COM 接口调用')
  }

  exec(
    `powershell -NoProfile -ExecutionPolicy Bypass -Command "${psScript.replace(/"/g, '`"')}"`,
    (error) => {
      if (error) {
        if (isDev) {
          log(`[虚拟键盘] PowerShell 调用失败: ${error.message}`)
        }
      } else {
        log('[虚拟键盘] ✅ PowerShell 调用成功')
      }
    }
  )
}

/**
 * 尝试启动虚拟键盘
 */
function showWindowsVirtualKeyboard(): void {
  if (process.platform !== 'win32') {
    console.log('[虚拟键盘] 非 Windows 平台，跳过')
    return
  }

  const isDev = !app.isPackaged
  const now = Date.now()

  // 防抖：防止短时间内重复调用
  if (isKeyboardStarting && now - keyboardStartTime < KEYBOARD_DEBOUNCE_TIME) {
    if (isDev) {
      console.log('[虚拟键盘] 防抖：键盘正在启动中，跳过重复调用')
    }
    return
  }

  isKeyboardStarting = true
  keyboardStartTime = now

  log('[虚拟键盘] ===== 开始启动虚拟键盘 =====')
  log(`[虚拟键盘] 时间戳: ${new Date().toISOString()}`)

  // 添加小延迟，确保触摸事件已处理完成
  setTimeout(() => {
    try {
      // 方法 1：使用 PowerShell COM 接口（Win11 推荐）
      log('[虚拟键盘] 方法 1: PowerShell COM 接口')
      showKeyboardViaPowerShell()

      // 方法 2：TabTip.exe（备用）- 添加强制启动参数
      setTimeout(() => {
        const tabtipPath = findTabTipPath()
        log(`[虚拟键盘] 方法 2: 尝试启动 TabTip.exe: ${tabtipPath}`)

        // 使用 /input.touchkeyboard.launchtype auto 参数强制启动键盘
        exec(`"${tabtipPath}" /input.touchkeyboard.launchtype auto`, (error) => {
          if (error) {
            log(`[虚拟键盘] TabTip.exe 启动失败: ${error.message}`)

            // 方法 3：使用 URI 协议
            log('[虚拟键盘] 方法 3: 使用 URI 协议')
            exec('explorer.exe ms-availableinsettings:touch-keyboard', (uriError) => {
              if (uriError) {
                log(`[虚拟键盘] URI 协议失败: ${uriError.message}`)

                // 方法 4：osk.exe（最后的备用方案）
                log('[虚拟键盘] 方法 4: 尝试 osk.exe')
                exec('osk.exe', (oskError) => {
                  if (oskError) {
                    log(`[虚拟键盘] ❌ 所有方法均失败: ${oskError.message}`)
                  } else {
                    log('[虚拟键盘] ✅ 已启动传统屏幕键盘 (osk.exe)')
                  }
                  isKeyboardStarting = false
                })
              } else {
                log('[虚拟键盘] ✅ 已通过 URI 协议启动')
                isKeyboardStarting = false
              }
            })
          } else {
            log('[虚拟键盘] ✅ 已强制启动触摸键盘 (TabTip.exe + launchtype auto)')
            isKeyboardStarting = false
          }
        })
      }, 300) // 300ms 后尝试 TabTip.exe

      // 1秒后重置防抖标志
      setTimeout(() => {
        isKeyboardStarting = false
        log('[虚拟键盘] 防抖标志已重置')
      }, 1000)
    } catch (err) {
      log(`[虚拟键盘] ❌ 启动异常: ${err}`)
      isKeyboardStarting = false
    }
  }, 50) // 50ms 延迟，确保触摸事件已处理

  log('[虚拟键盘] ===========================')
}

/**
 * 隐藏 Windows 虚拟键盘
 */
function hideWindowsVirtualKeyboard(): void {
  if (process.platform !== 'win32') return

  try {
    // 关闭 TabTip 进程
    exec('taskkill /IM TabTip.exe /F', (error) => {
      if (error && !error.message.includes('not found')) {
        console.log(`关闭触摸键盘失败: ${error.message}`)
      } else {
        console.log('已关闭触摸键盘')
      }
    })

    // 关闭 osk 进程
    exec('taskkill /IM osk.exe /F', (error) => {
      if (error && !error.message.includes('not found')) {
        console.log(`关闭屏幕键盘失败: ${error.message}`)
      }
    })
  } catch (err) {
    console.error(`关闭虚拟键盘异常: ${err}`)
  }
}

function createWindow() {
  // 开发环境加载本地服务器，生产环境加载构建后的文件
  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged

  log('===== 创建窗口 =====')
  log(`开发模式: ${isDev}`)
  log(`App Path: ${app.getAppPath()}`)
  log(`__dirname: ${__dirname}`)
  log(`process.resourcesPath: ${process.resourcesPath}`)

  // 获取主显示器信息
  const primaryDisplay = screen.getPrimaryDisplay()
  const { width, height } = primaryDisplay.workAreaSize
  log(`屏幕尺寸: ${width}x${height}`)

  // 获取预加载脚本路径
  // 使用 .cjs 扩展名，明确表示 CommonJS 格式（不受 package.json 的 "type": "module" 影响）
  const preloadPath = isDev
    ? join(__dirname, 'preload.cjs')
    : join(app.getAppPath(), 'dist-electron', 'preload.cjs')

  log(`Preload 路径: ${preloadPath}`)

  // 检查 preload 文件是否存在
  if (!existsSync(preloadPath)) {
    log(`❌ 错误: Preload 文件不存在: ${preloadPath}`)
  } else {
    log(`✅ Preload 文件存在`)
  }

  // 创建浏览器窗口
  // 注意：不使用 fullscreen: true 或 kiosk: true，这会阻止 Windows 触摸键盘弹出
  // 改用 setFullScreen(true) 方法来实现全屏，更灵活且允许系统交互
  try {
    mainWindow = new BrowserWindow({
      width,
      height,
      fullscreen: false, // 不在初始化时设置全屏，稍后用 setFullScreen() 方法
      frame: false, // 隐藏边框，视觉上像 Kiosk
      resizable: isDev, // 开发模式可调整大小
      alwaysOnTop: false,
      webPreferences: {
        preload: preloadPath,
        nodeIntegration: false,
        contextIsolation: true,
        webSecurity: true,
        enableRemoteModule: false,
        sandbox: false
      },
      // 触摸屏优化：禁用 kiosk 模式以允许系统键盘弹出
      kiosk: false,
      show: false // 先不显示，等加载完成后再显示
    })
    log('✅ 窗口创建成功')
  } catch (error) {
    log(`❌ 窗口创建失败: ${error}`)
    throw error
  }

  // 监听页面加载错误
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error('Failed to load:', validatedURL)
    console.error('Error code:', errorCode)
    console.error('Error description:', errorDescription)
  })

  // 监听控制台消息
  mainWindow.webContents.on('console-message', (event, level, message) => {
    console.log(`[Console ${level}]:`, message)
  })

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
    // 开发环境下打开开发者工具
    mainWindow.webContents.openDevTools({ mode: 'detach' }) // detach 模式，独立窗口显示
    log('[开发模式] DevTools 已自动打开')
  } else {
    // 生产环境：electron-builder 会自动处理 asar 路径
    const htmlPath = join(app.getAppPath(), 'dist', 'index.html')
    log('===== 生产模式启动 =====')
    log(`HTML 路径: ${htmlPath}`)
    log(`应用路径: ${app.getAppPath()}`)
    log(`是否打包: ${app.isPackaged}`)
    log(`测试模式: ${ENABLE_DEVTOOLS_IN_PRODUCTION ? '开启' : '关闭'}`)

    // 检查 HTML 文件是否存在
    if (existsSync(htmlPath)) {
      log('✅ HTML 文件存在')
    } else {
      log('❌ HTML 文件不存在，尝试查找...')
      // 尝试其他可能的路径
      const altPath = join(process.resourcesPath, 'app.asar', 'dist', 'index.html')
      log(`尝试路径: ${altPath}`)
      if (existsSync(altPath)) {
        log('✅ 在 resources 中找到 HTML 文件')
      }
    }
    log('========================')

    mainWindow.loadFile(htmlPath)
      .then(() => {
        log('✅ HTML 加载成功')
      })
      .catch((err) => {
        log(`❌ 加载 index.html 失败: ${err}`)
        log(`尝试的路径: ${htmlPath}`)

        // 显示错误对话框
        if (mainWindow) {
          const { dialog } = require('electron')
          dialog.showErrorBox('加载失败', `无法加载页面:\n${htmlPath}\n\n错误: ${err.message}`)
        }
      })

    // 测试模式：打包后也打开 DevTools
    if (ENABLE_DEVTOOLS_IN_PRODUCTION) {
      log('[测试模式] 正在打开 DevTools...')
      // 延迟打开，确保窗口已经创建完成
      setTimeout(() => {
        if (mainWindow) {
          mainWindow.webContents.openDevTools({ mode: 'detach' })
          log('[测试模式] DevTools 已打开')
        }
      }, 1000)
    }
  }

  // 窗口准备好后显示，避免闪烁
  mainWindow.once('ready-to-show', () => {
    log('===== 窗口准备显示 =====')
    mainWindow?.show()
    log('✅ 窗口已显示')

    // 生产环境：使用"伪全屏"模式
    // Windows 检测到窗口完全覆盖屏幕时会进入 legacy mode，阻止虚拟键盘显示
    // 解决方案：让窗口比屏幕小1像素，Windows 就不会认为是全屏应用
    if (!isDev) {
      const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize
      // 设置窗口大小为屏幕尺寸减1像素，并居中
      mainWindow?.setBounds({
        x: 0,
        y: 0,
        width: screenWidth,
        height: screenHeight - 1  // 关键：高度减1像素
      })
      log(`✅ 窗口已设置为伪全屏模式 (${screenWidth}x${screenHeight - 1})，允许触摸键盘显示`)
    }
  })

  // 强制显示窗口（3秒后，如果还没显示）
  setTimeout(() => {
    if (mainWindow && !mainWindow.isVisible()) {
      log('⚠️  窗口 3 秒后仍未显示，强制显示')
      mainWindow.show()
      mainWindow.center() // 居中显示
    }
  }, 3000)

  // 页面加载完成后检查
  mainWindow.webContents.on('did-finish-load', () => {
    log('===== 页面加载完成 =====')
    log(`开发模式: ${isDev}`)
    log(`测试模式: ${ENABLE_DEVTOOLS_IN_PRODUCTION}`)
    log(`DevTools 状态: ${mainWindow?.webContents.isDevToolsOpened() ? '已打开' : '未打开'}`)
    log('======================')

    // 开发环境或测试模式：确保 DevTools 打开
    if ((isDev || ENABLE_DEVTOOLS_IN_PRODUCTION) && !mainWindow?.webContents.isDevToolsOpened()) {
      log('正在重新打开 DevTools...')
      setTimeout(() => {
        mainWindow?.webContents.openDevTools({ mode: 'detach' })
        log('DevTools 已重新打开')
      }, 500)
    }
  })

  // 监听渲染进程错误
  mainWindow.webContents.on('render-process-gone', (event, details) => {
    console.error('Render process crashed:', details)
    // 生产环境不自动打开开发者工具，错误信息已输出到控制台
    // 如需调试，可以临时取消下面的注释
    // if (isDev) {
    //   mainWindow?.webContents.openDevTools()
    // }
  })

  // 监听未捕获的异常
  mainWindow.webContents.on('unresponsive', () => {
    console.error('Page became unresponsive')
    // 生产环境不自动打开开发者工具，错误信息已输出到控制台
    // 如需调试，可以临时取消下面的注释
    // if (isDev) {
    //   mainWindow?.webContents.openDevTools()
    // }
  })

  // 防止窗口被关闭（生产环境保护，必须通过管理面板退出）
  const isDev2 = process.env.NODE_ENV === 'development' || !app.isPackaged
  if (!isDev2) {
    mainWindow.on('close', (event) => {
      if (!isQuitting) {
        event.preventDefault()
        log('[窗口保护] 阻止窗口关闭，请通过右上角点击5次打开管理面板退出')
      }
    })
  }

  // 当窗口被关闭时
  mainWindow.on('closed', () => {
    mainWindow = null
  })

  // 处理外部链接（如果需要）
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    // 可以选择阻止外部链接或使用系统默认浏览器打开
    return { action: 'deny' }
  })

  // 阻止导航到外部 URL
  mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl)
    
    if (parsedUrl.origin !== 'http://localhost:5173' && !isDev) {
      event.preventDefault()
    }
  })
}

// ============ IPC 处理 ============

function setupIPC(): void {
  // 显示/隐藏虚拟键盘（Windows 触摸屏）
  ipcMain.handle('show-virtual-keyboard', () => {
    if (process.platform === 'win32') {
      // 确保窗口获得焦点后再调用键盘，避免键盘被覆盖
      if (mainWindow) {
        mainWindow.focus()
        log('[虚拟键盘] 窗口已获得焦点，准备显示键盘')
      }
      showWindowsVirtualKeyboard()
      return true
    }
    return false
  })

  ipcMain.handle('hide-virtual-keyboard', () => {
    if (process.platform === 'win32') {
      hideWindowsVirtualKeyboard()
      return true
    }
    return false
  })

  // 重启应用
  ipcMain.handle('restart-app', () => {
    log('[管理面板] 手动触发应用重启')
    isQuitting = true
    app.relaunch()
    app.exit(0)
  })

  // 退出应用
  ipcMain.handle('exit-app', () => {
    log('[管理面板] 手动触发应用退出')
    isQuitting = true
    app.quit()
  })
}

// Electron 初始化完成后创建窗口
app.whenReady().then(async () => {
  log('===== Electron Ready =====')
  log(`Electron 版本: ${process.versions.electron}`)
  log(`Node 版本: ${process.versions.node}`)
  log(`Chrome 版本: ${process.versions.chrome}`)
  log(`平台: ${process.platform}`)
  log(`架构: ${process.arch}`)
  log('========================')

  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged
  log(`开发模式: ${isDev}`)

  try {
    // 设置 IPC 通信
    setupIPC()
    log('✅ IPC 通信设置完成')

    // 只在开发模式下注册调试快捷键
    if (isDev) {
      // 注册全局快捷键
      // F12: 打开/关闭 DevTools（用于调试）
      globalShortcut.register('F12', () => {
        const focusedWindow = BrowserWindow.getFocusedWindow()
        if (focusedWindow) {
          if (focusedWindow.webContents.isDevToolsOpened()) {
            focusedWindow.webContents.closeDevTools()
            log('[DevTools] 已关闭开发者工具 (F12)')
          } else {
            focusedWindow.webContents.openDevTools({ mode: 'detach' })
            log('[DevTools] 已打开开发者工具 (F12)')
          }
        }
      })

      // Ctrl+Shift+I 或 Cmd+Option+I: 打开 DevTools（备用快捷键）
      const devToolsShortcut = process.platform === 'darwin' ? 'Cmd+Option+I' : 'Ctrl+Shift+I'
      globalShortcut.register(devToolsShortcut, () => {
        const focusedWindow = BrowserWindow.getFocusedWindow()
        if (focusedWindow) {
          focusedWindow.webContents.toggleDevTools()
          log(`[DevTools] 切换开发者工具 (${devToolsShortcut})`)
        }
      })

      // CommandOrControl+Shift+C: 打开 DevTools (Chrome 默认快捷键)
      globalShortcut.register('CommandOrControl+Shift+C', () => {
        const focusedWindow = BrowserWindow.getFocusedWindow()
        if (focusedWindow) {
          if (focusedWindow.webContents.isDevToolsOpened()) {
            focusedWindow.webContents.closeDevTools()
            log('[DevTools] 已关闭开发者工具 (Ctrl/Cmd+Shift+C)')
          } else {
            focusedWindow.webContents.openDevTools({ mode: 'detach' })
            log('[DevTools] 已打开开发者工具 (Ctrl/Cmd+Shift+C)')
          }
        }
      })

      // F11: 切换全屏（方便测试）
      globalShortcut.register('F11', () => {
        const focusedWindow = BrowserWindow.getFocusedWindow()
        if (focusedWindow) {
          const isFullScreen = focusedWindow.isFullScreen()
          focusedWindow.setFullScreen(!isFullScreen)
          log(`[全屏] ${!isFullScreen ? '已进入' : '已退出'}全屏模式 (F11)`)
        }
      })

      log(``)
      log(`===== 快捷键列表 (开发模式) =====`)
      log(`  F12                   - 打开/关闭 DevTools`)
      log(`  ${devToolsShortcut.padEnd(20)} - 切换 DevTools`)
      log(`  Ctrl/Cmd+Shift+C      - 打开/关闭 DevTools`)
      log(`  F11                   - 切换全屏`)
      log(`=================================`)
      log(``)
      log(`💡 Windows 触摸屏测试:`)
      log(`  1. 点击输入框查看虚拟键盘是否弹出`)
      log(`  2. 打开 DevTools (F12) 查看 Console 中的 [虚拟键盘] 日志`)
      log(`  3. 日志文件位置: ${logFile}`)
      log(``)
    } else {
      log('[生产模式] DevTools 快捷键已禁用')
    }

    if (!isDev && ENABLE_DEVTOOLS_IN_PRODUCTION) {
      log(`⚠️  测试模式已启用，DevTools 将自动打开`)
      log(`   正式发布前请将 ENABLE_DEVTOOLS_IN_PRODUCTION 设为 false`)
    }

    // 启动后端服务并等待完成
    log('准备启动后端服务...')
    await startBackend()
    log('后端服务启动流程完成')

    // 生产环境：隐藏任务栏（配合伪全屏使用）
    if (!isDev) {
      setTaskbarVisibility(false)
    }

    // 后端启动完成后创建窗口
    log('准备创建主窗口...')
    createWindow()
    log('主窗口创建流程完成')

    // macOS 特殊处理：当应用被激活时创建窗口
    app.on('activate', () => {
      log('App activated')
      if (BrowserWindow.getAllWindows().length === 0) {
        log('没有窗口，创建新窗口')
        createWindow()
      }
    })

    log('===== 应用启动完成 =====')
  } catch (error) {
    log(`❌ 应用启动失败: ${error}`)
    console.error('App startup error:', error)
  }
})

// 所有窗口关闭时退出应用（除了 macOS）
app.on('window-all-closed', () => {
  // 注销所有快捷键
  globalShortcut.unregisterAll()
  log('✅ 已注销所有全局快捷键')

  // 恢复任务栏显示
  if (process.platform === 'win32') {
    setTaskbarVisibility(true)
  }

  // 关闭后端服务
  stopBackend()

  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// 安全：阻止新窗口创建
app.on('web-contents-created', (_, contents) => {
  contents.on('new-window', (event, navigationUrl) => {
    event.preventDefault()
  })
})

// 快捷键：退出应用（Ctrl+Q 或 Cmd+Q）
app.on('ready', () => {
  // 可以添加全局快捷键，但触摸屏应用通常不需要
})

