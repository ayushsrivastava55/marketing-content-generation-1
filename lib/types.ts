import type { ChatCompletion } from 'openai'

export interface AIResponse {
  success: boolean
  content?: string
  error?: string
}

export interface TrendData {
  technology: string
  description: string
  popularity: number
  growthRate: number
  category: string
  whyUseIt: string[]
  sources: string[]
  companyAdoptions: Array<{
    name: string
    description: string
    useCase: string
    impact: string
  }>
}

export interface AIConfig {
  model: string
  temperature: number
  maxTokens: number
} 