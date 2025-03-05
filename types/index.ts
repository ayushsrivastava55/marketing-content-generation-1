import type { ChatCompletion } from 'openai'

export interface AIResponse {
  content: string
  error?: string
}

// ... other types 