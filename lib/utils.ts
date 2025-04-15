import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Sanitizes AI response text, particularly for JSON parsing
 */
export function sanitizeAIResponse(text: string): string {
  // Strip any markdown code block indicators
  let cleaned = text.replace(/```json/g, '').replace(/```/g, '')
  
  // Remove any non-JSON content before or after the JSON object
  const jsonStart = cleaned.indexOf('{')
  const jsonEnd = cleaned.lastIndexOf('}')
  
  if (jsonStart >= 0 && jsonEnd >= 0) {
    cleaned = cleaned.substring(jsonStart, jsonEnd + 1)
  }
  
  return cleaned
}

/**
 * Handles AI errors in a consistent way
 */
export function handleAIError(error: Error | { response?: { data?: { error?: { message?: string } } } }): string {
  console.error('AI Error:', error)
  
  if ('response' in error && error.response?.data?.error) {
    return `AI Service Error: ${error.response.data.error.message || 'Unknown API error'}`
  }
  
  return error instanceof Error ? error.message : 'An unexpected error occurred with the AI service'
}
