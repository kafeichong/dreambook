import { contextBridge, ipcRenderer } from 'electron'

// 暴露受保护的方法给渲染进程使用
contextBridge.exposeInMainWorld('electronAPI', {
  // 平台信息
  platform: process.platform,

  // Windows 虚拟键盘控制
  showVirtualKeyboard: () => ipcRenderer.invoke('show-virtual-keyboard'),
  hideVirtualKeyboard: () => ipcRenderer.invoke('hide-virtual-keyboard'),

  // 应用控制
  restartApp: () => ipcRenderer.invoke('restart-app'),
  exitApp: () => ipcRenderer.invoke('exit-app'),

  // 切换用户（Windows）
  switchUser: () => ipcRenderer.invoke('sys:switch-user'),
})

// 类型声明，供 TypeScript 使用
declare global {
  interface Window {
    electronAPI?: {
      platform: string
      showVirtualKeyboard: () => Promise<boolean>
      hideVirtualKeyboard: () => Promise<boolean>
      restartApp: () => Promise<void>
      exitApp: () => Promise<void>
      switchUser: () => Promise<void>
    }
  }
}

