/// <reference types="vite/client" />

// GLSL shader files
declare module '*.vert.glsl' {
  const content: string
  export default content
}

declare module '*.frag.glsl' {
  const content: string
  export default content
}

declare module '*.glsl' {
  const content: string
  export default content
}

// Image files
declare module '*.png' {
  const src: string
  export default src
}

declare module '*.jpg' {
  const src: string
  export default src
}

declare module '*.jpeg' {
  const src: string
  export default src
}

declare module '*.webp' {
  const src: string
  export default src
}

// Electron API 类型声明
declare global {
  interface Window {
    electronAPI?: {
      platform: string
      showVirtualKeyboard: () => Promise<boolean>
      hideVirtualKeyboard: () => Promise<boolean>
    }
  }
}

export {}
