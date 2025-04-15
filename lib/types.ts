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

export interface TrendAnalysis {
  technology: string
  analysis: {
    marketPotential: 'high' | 'medium' | 'low'
    implementationComplexity: 'high' | 'medium' | 'low'
    industryImpact: string
    opportunities: string[]
    challenges: string[]
    recommendation: string
  }
}

export interface AIConfig {
  model: string
  temperature: number
  maxTokens: number
}

export interface GenerateContentRequest {
  trend: string
  context: string
  format: 'text' | 'json'
  industry: string
  requirements?: string
}

export interface GenerateContentResponse {
  success: boolean
  content?: string
  error?: string
}

export interface RiskAnalysis {
  risks: Array<{
    id: string
    category: 'technical' | 'operational' | 'security' | 'business'
    severity: 'low' | 'medium' | 'high' | 'critical'
    title: string
    description: string
    impact: string
    mitigation: string
    status: 'identified' | 'mitigated' | 'accepted'
  }>
  summary: {
    totalRisks: number
    criticalRisks: number
    highRisks: number
    mitigatedRisks: number
  }
  recommendations: string[]
} 