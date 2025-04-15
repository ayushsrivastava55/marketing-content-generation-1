import type { OpenAI } from 'openai'

export interface AIResponse {
  content: string
  error?: string
}

// Define types based on the new SDK version
export type ChatCompletion = OpenAI.Chat.Completions.ChatCompletion
export type ChatCompletionMessage = OpenAI.Chat.Completions.ChatCompletionMessage

// ... other types 