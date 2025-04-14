import OpenAI from 'openai'
import { AI_CONFIG } from '@/lib/config'
import { handleAIError, sanitizeAIResponse } from '@/lib/utils'
import type { TrendData, TrendAnalysis, GenerateContentRequest, GenerateContentResponse, RiskAnalysis } from '@/lib/types'

export class OpenAIService {
  private openai: OpenAI

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY
    if (!apiKey) {
      console.error('Environment variables:', {
        OPENAI_API_KEY: !!process.env.OPENAI_API_KEY,
        NEXT_PUBLIC_OPENAI_API_KEY: !!process.env.NEXT_PUBLIC_OPENAI_API_KEY
      })
      throw new Error('Missing environment variable: OPENAI_API_KEY')
    }
    this.openai = new OpenAI({ apiKey })
  }

  private async generatePrompt(request: GenerateContentRequest): Promise<string> {
    const { trend, context, format, industry, requirements } = request

    return `
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
  }

  public async generateContent(request: GenerateContentRequest): Promise<GenerateContentResponse> {
    try {
      const prompt = await this.generatePrompt(request)

      const response = await this.openai.chat.completions.create({
        model: AI_CONFIG.model,
        messages: [{ role: "user", content: prompt }],
        temperature: AI_CONFIG.temperature,
        max_tokens: AI_CONFIG.maxTokens,
        response_format: request.format === 'json' ? { type: "json_object" } : undefined
      })

      const text = response.choices[0]?.message?.content

      if (!text) {
        return {
          success: false,
          error: 'No content generated'
        }
      }

      // If format is not JSON, return the text directly
      if (request.format !== 'json') {
        return {
          success: true,
          content: text
        }
      }

      // For JSON format, clean and parse the response
      try {
        const cleanedJson = sanitizeAIResponse(text)
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
        Focus on practical business implications and actionable insights.`

      const response = await this.openai.chat.completions.create({
        model: AI_CONFIG.model,
        messages: [{ role: "user", content: prompt }],
        temperature: AI_CONFIG.temperature,
        max_tokens: AI_CONFIG.maxTokens,
        response_format: { type: "json_object" }
      })

      const content = response.choices[0]?.message?.content

      if (!content) {
        throw new Error('No content generated')
      }

      const parsedResponse = JSON.parse(sanitizeAIResponse(content)) as TrendAnalysis[]
      if (!Array.isArray(parsedResponse)) {
        throw new Error('Response is not an array')
      }
      return parsedResponse
    } catch (error) {
      console.error('Error analyzing trends:', error)
      throw error
    }
  }

  private trendCache: {
    trends: TrendData[] | null;
    timestamp: number;
  } | null = null;

  private readonly CACHE_DURATION = 0; // Disable caching to get fresh trends every time

  public async generateTrends(): Promise<TrendData[] | null> {
    // Check cache first
    if (this.trendCache && (Date.now() - this.trendCache.timestamp < this.CACHE_DURATION)) {
      console.log('Returning cached trends...');
      return this.trendCache.trends;
    }

    try {
      console.log('Generating new trends with OpenAI...');
      const prompt = `Generate a list of 5 emerging technological trends for 2025 in different categories (AI, Cloud, DevOps, Security, etc.).
      Focus on innovative technologies that are transforming the digital landscape.
      Return ONLY a JSON object with the following structure:
      {
        "trends": [
          {
            "technology": "specific technology name",
            "description": "detailed description",
            "popularity": number between 1-100,
            "growthRate": number between 1-100,
            "category": "specific category",
            "whyUseIt": ["benefit 1", "benefit 2", "benefit 3"],
            "sources": ["credible source 1", "credible source 2"],
            "companyAdoptions": [
              {
                "name": "real company name",
                "description": "what the company does",
                "useCase": "specific implementation",
                "impact": "measurable results"
              }
            ]
          }
        ]
      }`;

      const response = await this.openai.chat.completions.create({
        model: "gpt-4o", // Using the latest model
        messages: [
          {
            role: "system",
            content: "You are a technology trend analyst. Provide accurate, up-to-date information about emerging technologies in valid JSON format."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: AI_CONFIG.maxTokens,
        response_format: { type: "json_object" }
      });

      const content = response.choices[0]?.message?.content;
      console.log('Raw OpenAI Response:', content);

      if (!content) {
        throw new Error('No content generated');
      }

      try {
        const parsed = JSON.parse(content);
        console.log('Parsed response:', parsed);

        if (!parsed.trends || !Array.isArray(parsed.trends)) {
          throw new Error('Invalid response format: missing trends array');
        }

        // Validate and normalize each trend
        const normalizedTrends = parsed.trends.map(trend => ({
          technology: trend.technology || 'Unknown Technology',
          description: trend.description || '',
          popularity: Math.min(100, Math.max(0, Number(trend.popularity) || 0)),
          growthRate: Math.min(100, Math.max(0, Number(trend.growthRate) || 0)),
          category: trend.category || 'Technology',
          whyUseIt: Array.isArray(trend.whyUseIt) ? trend.whyUseIt : [],
          sources: Array.isArray(trend.sources) ? trend.sources : [],
          companyAdoptions: Array.isArray(trend.companyAdoptions) ? trend.companyAdoptions.map(adoption => ({
            name: adoption.name || '',
            description: adoption.description || '',
            useCase: adoption.useCase || '',
            impact: adoption.impact || ''
          })) : []
        }));

        console.log('Normalized trends:', normalizedTrends);

        // Store in cache
        this.trendCache = {
          trends: normalizedTrends,
          timestamp: Date.now()
        };

        return normalizedTrends;
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError);
        console.error('Response content:', content);
        return null;
      }
    } catch (error) {
      console.error('OpenAI API Error:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message);
      }
      return null;
    }
  }

  public async generateMigrationPlan(prompt: string) {
    try {
      const response = await this.openai.chat.completions.create({
        model: AI_CONFIG.model,
        messages: [
          {
            role: "system",
            content: "You are a technology migration expert who creates detailed, practical migration plans."
          },
          {
            role: "user",
            content: `${prompt}
            
            Return the response in this JSON format:
            {
              "currentStack": ["current tech 1", "current tech 2"],
              "recommendedStack": ["recommended tech 1", "recommended tech 2"],
              "timeline": "timeline description",
              "effort": "effort description",
              "risks": ["risk 1", "risk 2"],
              "benefits": ["benefit 1", "benefit 2"],
              "steps": [
                {
                  "phase": "phase name",
                  "duration": "duration estimate",
                  "tasks": ["task 1", "task 2"],
                  "resources": ["resource 1", "resource 2"]
                }
              ],
              "costEstimate": {
                "training": "cost",
                "tools": "cost",
                "infrastructure": "cost",
                "total": "total cost"
              },
              "teamImpact": {
                "requiredSkills": ["skill 1", "skill 2"],
                "trainingNeeds": ["training 1", "training 2"],
                "teamStructure": "team structure recommendation"
              }
            }`
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
        response_format: { type: "json_object" }
      })

      const content = response.choices[0]?.message?.content

      if (!content) {
        throw new Error('No content generated')
      }

      return JSON.parse(content)
    } catch (error) {
      console.error('Error generating migration plan:', error)
      throw error
    }
  }

  public async generateRiskAnalysis(prompt: string): Promise<RiskAnalysis> {
    try {
      const response = await this.openai.chat.completions.create({
        model: AI_CONFIG.model,
        messages: [
          {
            role: "system",
            content: "You are a risk assessment expert. Return your analysis in JSON format."
          },
          {
            role: "user",
            content: `${prompt}

            Return the response in this JSON format:
            {
              "risks": [
                {
                  "id": "unique-id",
                  "category": "technical|operational|security|business",
                  "severity": "low|medium|high|critical",
                  "title": "risk title",
                  "description": "detailed description",
                  "impact": "potential impact",
                  "mitigation": "mitigation strategy",
                  "status": "identified"
                }
              ],
              "summary": {
                "totalRisks": 0,
                "criticalRisks": 0,
                "highRisks": 0,
                "mitigatedRisks": 0
              },
              "recommendations": [
                "recommendation 1",
                "recommendation 2"
              ]
            }`
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
        response_format: { type: "json_object" }
      })

      const content = response.choices[0]?.message?.content

      if (!content) {
        throw new Error('No content generated')
      }

      const parsed = JSON.parse(content)

      // Normalize and validate the response
      return {
        risks: parsed.risks.map((risk: any) => ({
          id: risk.id || Math.random().toString(36).substr(2, 9),
          category: risk.category,
          severity: risk.severity,
          title: risk.title,
          description: risk.description,
          impact: risk.impact,
          mitigation: risk.mitigation,
          status: risk.status || 'identified'
        })),
        summary: {
          totalRisks: parsed.risks.length,
          criticalRisks: parsed.risks.filter((r: any) => r.severity === 'critical').length,
          highRisks: parsed.risks.filter((r: any) => r.severity === 'high').length,
          mitigatedRisks: parsed.risks.filter((r: any) => r.status === 'mitigated').length
        },
        recommendations: parsed.recommendations || []
      }
    } catch (error) {
      console.error('Error generating risk analysis:', error)
      throw error
    }
  }
}

export const openaiService = new OpenAIService()
