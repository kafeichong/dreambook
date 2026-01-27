// 情绪书库 · 核心类型定义
// src/types/book.d.ts

/**
 * 情绪类别：对应 8 大基础情绪
 */
export type EmotionCategory =
  | 'grief'      // 悲恸
  | 'anger'      // 生气
  | 'anxiety'    // 焦虑
  | 'fear'       // 恐惧
  | 'disgust'    // 厌恶
  | 'joy'        // 愉悦
  | 'surprise'   // 惊讶
  | 'happiness'  // 快乐

/**
 * 情绪强度：每个情绪大类有 3 个等级
 */
export type EmotionLevel = 'light' | 'medium' | 'heavy'

/**
 * 图书载体类型
 */
export type BookMedium = 'ebook' | 'physical'

/**
 * 情绪标签：包含分类、强度和中文名称
 */
export interface EmotionTag {
  category: EmotionCategory
  level: EmotionLevel
  name: string  // 中文名称：孤独、低谷、失落等
}

/**
 * 图书基础信息
 */
export interface BaseBook {
  id: string
  title: string
  author: string
  publisher: string
  cover: string                  // 封面图片路径
  description?: string           // 图书描述
  tags?: string[]               // 其他标签
  emotions: EmotionTag[]        // 对应的情绪列表
  rating?: number               // 评分 0-5
}

/**
 * 电子书信息
 * 用户通过扫描二维码访问
 */
export interface EBook extends BaseBook {
  medium: 'ebook'
  qrCode: string                // 二维码图片路径或生成方式
  externalUrl: string           // 电子书外链
}

/**
 * 纸质书信息
 * 用户通过索书码在图书馆查找
 */
export interface PhysicalBook extends BaseBook {
  medium: 'physical'
  catalogCode: string           // 索书码（如 I210/123）
  floorCode: string             // 楼层编码（如 6F）
  location?: string             // 具体位置描述
}

/**
 * 图书联合类型：电子书或纸质书
 * 使用 discriminated union 实现类型安全
 */
export type Book = EBook | PhysicalBook

/**
 * 类型守卫函数
 */
export function isEBook(book: Book): book is EBook {
  return book.medium === 'ebook'
}

export function isPhysicalBook(book: Book): book is PhysicalBook {
  return book.medium === 'physical'
}

/**
 * 情绪配置信息
 */
export interface EmotionConfig {
  category: EmotionCategory
  levels: EmotionLevel[]        // ['light', 'medium', 'heavy']
  names: string[]               // 对应的中文名称
  color: string                 // 情绪主色
  bgColor?: string              // 背景色
  description: string           // 情绪描述
}

/**
 * 图书馆配置
 */
export interface BookLibraryConfig {
  institution: string           // 机构名称
  version: string              // 数据版本
  lastUpdated: string          // 最后更新时间
  totalBooks: number           // 总书数
  books: Book[]                // 书籍列表
}

/**
 * 筛选条件接口
 */
export interface BookFilterOptions {
  emotionCategory?: EmotionCategory | null
  emotionLevel?: EmotionLevel | null
  medium?: BookMedium | null
  searchText?: string
}
