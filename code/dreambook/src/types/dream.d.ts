// 梦境数据类型定义

export type EmotionTag = 'JOY' | 'SAD' | 'FEAR' | 'CALM' | 'STRESS'

export interface Reason {
  title: string
  content: string
}

export interface Solution {
  title: string
  content: string
}

export interface Advice {
  title: string
  content: string
}

export interface BackgroundConfig {
  gradient: string
  particleColor: string
  particleSpeed: number
  particleDirection: string
  fogSpeed: number
}

export interface Dream {
  id: string
  title: string
  mainTitle?: string
  displaySubtitle?: string
  subtitle: string
  emotion: string
  emotionTag: EmotionTag
  image: string
  description: string
  intro: string
  interpretation?: string
  advice?: Advice[]
  references?: string
  // Legacy fields for backwards compatibility
  reasons?: Reason[]
  solutions?: Solution[]
  summary?: string
  backgroundConfig: BackgroundConfig
}

export interface EmotionType {
  name: string
  color: string
  description: string
}

export interface DreamData {
  dreams: Dream[]
  emotionTypes: Record<EmotionTag, EmotionType>
}
