/**
 * 获取资源文件路径
 * 在 Electron 环境中，需要根据运行环境返回正确的路径
 */
export function getAssetPath(path: string): string {
  // 如果路径已经是完整 URL，直接返回
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }

  // 移除开头的斜杠，确保是相对路径
  const cleanPath = path.startsWith('/') ? path.slice(1) : path

  // 在 Electron 打包环境中，使用相对路径
  if (typeof window !== 'undefined' && window.location.protocol === 'file:') {
    return `./${cleanPath}`
  }

  // 开发环境或其他环境，使用原始路径
  return `/${cleanPath}`
}

