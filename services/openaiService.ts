import OpenAI from 'openai'

interface GenerateContentRequest {
  trend: string
  context: string
  format: string
  industry: string
  requirements?: string
}

interface GenerateContentResponse {
  success: boolean
  content?: string
  error?: string
}

class OpenAIService {
  private openai: OpenAI

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  }

  async generateContent(request: GenerateContentRequest): Promise<GenerateContentResponse> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4-1106-preview",
        messages: [
          {
            role: "system",
            content: `You are a technology trend analyst expert. Generate content about technology trends that is:
              - Specific and factual
              - Based on real industry data
              - Focused on business value and implementation
              - Includes concrete examples and metrics
              Format: ${request.format}
              Industry Focus: ${request.industry}
              ${request.requirements ? `Additional Requirements: ${request.requirements}` : ''}`
          },
          {
            role: "user",
            content: `Generate content about: ${request.trend}
              Context: ${request.context}`
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
        response_format: request.format === 'json' ? { type: "json_object" } : undefined
      })

      const content = completion.choices[0]?.message?.content

      if (!content) {
        return {
          success: false,
          error: 'No content generated'
        }
      }

      return {
        success: true,
        content
      }
    } catch (error: any) {
      console.error('OpenAI API Error:', error)
      return {
        success: false,
        error: error.message || 'Failed to generate content'
      }
    }
  }
}

export const openaiService = new OpenAIService()
