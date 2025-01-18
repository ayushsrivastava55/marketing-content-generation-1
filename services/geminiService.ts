import { GoogleGenerativeAI } from '@google/generative-ai'

interface TrendData {
  technology: string
  popularity?: number
  growthRate?: number
  category?: string
  description?: string
  sources?: string[]
}

interface ContentRequest {
  trend: string
  context?: string
  industry?: string
  format?: 'blog' | 'summary' | 'analysis' | 'social' | 'json'
}

interface ContentResponse {
  content: string
  title?: string
  keywords?: string[]
  sentiment?: 'positive' | 'negative' | 'neutral'
}

interface TrendAnalysis {
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

export class GeminiService {
  private genAI: GoogleGenerativeAI
  private model: any

  constructor() {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY
    if (!apiKey) {
      throw new Error('NEXT_PUBLIC_GEMINI_API_KEY is required')
    }
    this.genAI = new GoogleGenerativeAI(apiKey)
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' })
  }

  private async generatePrompt(request: GenerateContentRequest): Promise<string> {
    const { trend, context, format, industry, requirements } = request

    const prompt = `
      Generate detailed content about ${trend} in the ${industry} industry.
      Context: ${context}
      
      ${format === 'json' ? `
      Return the response in the following JSON format:
      {
        "technology": "${trend}",
        "description": "detailed overview",
        "popularity": number between 0-100,
        "growthRate": number between 0-100,
        "category": "specific tech category",
        "sources": ["list of sources"],
        "companyAdoptions": [
          {
            "name": "company name",
            "description": "company's main business",
            "useCase": "detailed implementation example",
            "impact": "quantifiable results with metrics"
          }
        ],
        "technicalDetails": {
          "requirements": ["specific technical requirements"],
          "integrations": ["supported integrations"],
          "limitations": ["current limitations"]
        },
        "stackRecommendations": {
          "current": ["specific products being replaced"],
          "recommended": ["specific complementary products"],
          "benefits": ["quantifiable benefits with metrics"],
          "migrationComplexity": "Low|Medium|High",
          "estimatedTimeframe": "specific timeline"
        }
      }
      ` : `
      Key Focus Areas:
      1. Specific features and capabilities
      2. Real implementation examples
      3. Integration requirements
      4. Cost and ROI metrics
      5. Technical limitations and roadmap
      `}
      
      Please ensure the response is:
      - Focused on specific products/services
      - Based on verified implementations
      - Includes actual metrics and data
      - References real customer cases
      - Provides technical details
      
      ${requirements ? `Additional Requirements: ${requirements}` : ''}`

    return prompt
  }

  private cleanJsonString(str: string): string {
    // Remove any markdown code block markers
    str = str.replace(/```json\s*/g, '').replace(/```\s*$/g, '')
    
    // Find the first '{' and last '}'
    const start = str.indexOf('{')
    const end = str.lastIndexOf('}')
    
    if (start === -1 || end === -1) {
      throw new Error('No valid JSON object found in response')
    }
    
    // Extract just the JSON part
    return str.slice(start, end + 1)
  }

  public async generateContent(request: GenerateContentRequest): Promise<GenerateContentResponse> {
    try {
      const prompt = await this.generatePrompt(request)
      const result = await this.model.generateContent([prompt])
      const response = await result.response
      const text = response.text()
      
      // If format is not JSON, return the text directly
      if (request.format !== 'json') {
        return {
          success: true,
          content: text
        }
      }
      
      // For JSON format, clean and parse the response
      try {
        const cleanedJson = this.cleanJsonString(text)
        const parsed = JSON.parse(cleanedJson)
        
        // Ensure required fields exist with default values
        const normalized = {
          ...parsed,
          technology: parsed.technology || request.trend,
          description: parsed.description || '',
          popularity: Math.min(100, Math.max(0, Number(parsed.popularity) || 0)),
          growthRate: Math.min(100, Math.max(0, Number(parsed.growthRate) || 0)),
          category: parsed.category || request.industry || 'Technology',
          sources: parsed.sources || [],
          companyAdoptions: parsed.companyAdoptions || [],
          technicalDetails: {
            requirements: parsed.technicalDetails?.requirements || [],
            integrations: parsed.technicalDetails?.integrations || [],
            limitations: parsed.technicalDetails?.limitations || []
          },
          stackRecommendations: {
            current: parsed.stackRecommendations?.current || [],
            recommended: parsed.stackRecommendations?.recommended || [],
            benefits: parsed.stackRecommendations?.benefits || [],
            migrationComplexity: parsed.stackRecommendations?.migrationComplexity || 'Medium',
            estimatedTimeframe: parsed.stackRecommendations?.estimatedTimeframe || 'Not specified'
          }
        }

        return {
          success: true,
          content: JSON.stringify(normalized, null, 2)
        }
      } catch (e) {
        console.error('JSON Parsing Error:', e)
        return {
          success: false,
          error: 'Failed to parse JSON response'
        }
      }
    } catch (error) {
      console.error('Error generating content:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  public async analyzeTrends(trends: TrendData[]): Promise<TrendAnalysis[]> {
    if (!Array.isArray(trends) || trends.length === 0) {
      throw new Error('Invalid trends data: Expected non-empty array')
    }

    try {
      const trendSummaries = trends.map(trend => {
        const popularity = trend.popularity !== undefined ? `${trend.popularity}%` : 'N/A'
        const growthRate = trend.growthRate !== undefined ? `${trend.growthRate}%` : 'N/A'
        return `${trend.technology}: Popularity ${popularity}, Growth Rate ${growthRate}`
      })

      const prompt = `Analyze these technology trends:
        ${trendSummaries.join('\n')}

        For each trend, provide a detailed analysis in the following JSON format:
        {
          "technology": "name of the technology",
          "analysis": {
            "marketPotential": "high/medium/low",
            "implementationComplexity": "high/medium/low",
            "industryImpact": "detailed description of industry impact",
            "opportunities": ["list", "of", "key", "opportunities"],
            "challenges": ["list", "of", "potential", "challenges"],
            "recommendation": "strategic recommendation"
          }
        }

        Return the analysis as a valid JSON array containing one object per trend.
        Focus on practical business implications and actionable insights.
        Ensure the response is properly formatted as a JSON array.`

      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const text = response.text()

      try {
        const parsedResponse = JSON.parse(text) as TrendAnalysis[]
        if (!Array.isArray(parsedResponse)) {
          throw new Error('Response is not an array')
        }
        return parsedResponse
      } catch (parseError) {
        console.error('Failed to parse Gemini response:', parseError)
        // Attempt to extract JSON from text if direct parsing fails
        const jsonMatch = text.match(/\[\s*\{[\s\S]*\}\s*\]/)?.[0]
        if (jsonMatch) {
          const extracted = JSON.parse(jsonMatch) as TrendAnalysis[]
          if (!Array.isArray(extracted)) {
            throw new Error('Extracted response is not an array')
          }
          return extracted
        }
        throw new Error('Failed to parse trend analysis response')
      }
    } catch (error) {
      console.error('Error analyzing trends with Gemini:', error)
      throw error
    }
  }
}

export const geminiService = new GeminiService()
