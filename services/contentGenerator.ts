import { openaiService } from './openaiService'
import { marked } from 'marked'

interface CompanyAdoption {
  name: string
  description: string
  useCase: string
  impact: string
}

interface TrendContent {
  technology: string
  description: string
  whyUseIt: string[]
  popularity: number
  growthRate: number
  category: string
  sources: string[]
  lastUpdated: string
  companyAdoptions: CompanyAdoption[]
  stackRecommendations: {
    current: string[]
    recommended: string[]
    benefits: string[]
    migrationComplexity: 'Low' | 'Medium' | 'High'
    estimatedTimeframe: string
  }
}

interface BlogPost {
  headline: string
  body: string
  cta: string
  category: string
  lastUpdated: string
}

interface TechnologyBlog {
  headline: string
  body: string
  cta: string
  category: string
  lastUpdated: string
  technology: {
    name: string
    version: string
    popularity: number
    growthRate: number
  }
  technicalDetails: {
    requirements: string[]
    integrations: string[]
    limitations: string[]
  }
  companyAdoptions: Array<{
    name: string
    useCase: string
    impact: string
  }>
}

interface CompanyProfile {
  industry: string
  size: string
  technologyStack: string[]
  businessChallenges: string[]
  innovationPriorities: string[]
  budgetRange: string
  implementationTimeline: string
  complianceRequirements: string[]
  teamExpertise: string[]
}

class ContentGenerator {
  private readonly trendCategories = {
    'AI/ML': [
      'AWS Bedrock',
      'Google Gemini Pro',
      'Anthropic Claude 3',
      'OpenAI GPT-4 Turbo',
      'Meta Llama 3',
      'Mistral AI Platform',
      'Cohere Command',
      'Stability AI SDXL Turbo'
    ],
    'Cloud Computing': [
      'AWS ECS Anywhere',
      'Azure Arc Enabled Kubernetes',
      'Google Anthos Bare Metal',
      'AWS App Runner',
      'Azure Container Apps',
      'AWS Lambda Powertools',
      'GCP Carbon Footprint'
    ],
    'DevOps': [
      'OpenTelemetry 1.0',
      'Argo CD 2.9',
      'Crossplane Universal Crossplane',
      'Cilium Service Mesh',
      'HashiCorp Boundary',
      'Backstage Developer Portal',
      'Pulumi ESC'
    ],
    'Web Development': [
      'Next.js 14',
      'Astro 4.0',
      'Remix 2.5',
      'Qwik City',
      'Svelte 5',
      'Deno 2.0',
      'Bun 1.0'
    ],
    'Databases': [
      'PlanetScale Boost',
      'CockroachDB Serverless',
      'MongoDB Atlas Vector Search',
      'SingleStore Kai',
      'Neo4j AuraDB Serverless',
      'Supabase Vector',
      'TiDB Serverless'
    ]
  }

  private async retryWithBackoff(
    operation: () => Promise<any>,
    maxRetries: number = 3,
    initialDelay: number = 1000
  ): Promise<any> {
    let retries = 0
    let delay = initialDelay

    while (retries < maxRetries) {
      try {
        return await operation()
      } catch (error: any) {
        if (error?.status === 429) { // Rate limit error
          retries++
          if (retries === maxRetries) {
            throw error
          }
          
          // Exponential backoff with jitter
          const jitter = Math.random() * 200
          await new Promise(resolve => setTimeout(resolve, delay + jitter))
          delay *= 2 // Exponential backoff
          
          console.log(`Retrying operation after rate limit (attempt ${retries}/${maxRetries})`)
          continue
        }
        throw error
      }
    }
  }

  private async generateTechnologyTrend(category: string, profile?: CompanyProfile): Promise<TrendContent> {
    try {
      const operation = async () => {
        const response = await openaiService.generateContent({
          trend: category,
          context: profile ? `
            Company Context:
            - Industry: ${profile.industry}
            - Size: ${profile.size}
            - Current Tech Stack: ${profile.technologyStack.join(', ')}
            - Business Challenges: ${profile.businessChallenges.join(', ')}
            - Innovation Priorities: ${profile.innovationPriorities.join(', ')}
            - Budget Range: ${profile.budgetRange}
            - Implementation Timeline: ${profile.implementationTimeline}
            - Compliance Requirements: ${profile.complianceRequirements.join(', ')}
            - Team Expertise: ${profile.teamExpertise.join(', ')}
          ` : 'Latest enterprise technology trends and adoption',
          format: 'json',
          industry: profile?.industry || category,
          requirements: profile ? 'Focus on solutions matching company profile and requirements' : undefined
        })

        if (!response.success || !response.content) {
          throw new Error(response.error || 'Failed to generate trend')
        }

        const content = JSON.parse(response.content)
        return {
          ...content,
          lastUpdated: new Date().toISOString(),
          whyUseIt: []
        }
      }

      return await this.retryWithBackoff(operation)
    } catch (error) {
      console.error(`Error generating trend for ${category}:`, error)
      throw error
    }
  }

  private getFallbackTrend(category: string): TrendContent {
    return {
      technology: `New ${category} Technology`,
      description: `Innovative solution in the ${category} space`,
      whyUseIt: [],
      popularity: 85,
      growthRate: 80,
      category,
      sources: ['Industry Research'],
      lastUpdated: new Date().toISOString(),
      companyAdoptions: [
        {
          name: 'Tech Company',
          description: 'Leading technology provider',
          useCase: 'Enterprise implementation',
          impact: 'Significant improvement in efficiency'
        }
      ],
      stackRecommendations: {
        current: ['Legacy System'],
        recommended: ['Modern Solution'],
        benefits: ['Improved Performance'],
        migrationComplexity: 'Medium',
        estimatedTimeframe: '3-4 months'
      }
    }
  }

  private async generateWhyUseIt(trend: TrendContent): Promise<string[]> {
    const defaultBenefits = [
      `Improved ${trend.category.toLowerCase()} capabilities with modern features`,
      `Enhanced performance and scalability for enterprise workloads`,
      `Seamless integration with existing technology stack`,
      `Reduced operational costs and improved efficiency`,
      `Better security and compliance features`
    ]

    try {
      const operation = async () => {
        const response = await openaiService.generateContent({
          trend: trend.technology,
          context: `Strategic Benefits and Use Cases of ${trend.technology} in ${trend.category}`,
          format: 'text',
          industry: trend.category.toLowerCase(),
          requirements: 'List 5-7 specific, actionable benefits with real-world examples'
        })

        if (!response.success || !response.content) {
          console.warn(`Failed to generate benefits for ${trend.technology}:`, response.error)
          return defaultBenefits
        }

        const benefits = response.content
          .split('\n')
          .map((line: string) => line.trim())
          .filter((line: string) => line.length > 0)
          .map((line: string) => line.replace(/^[•\-*\d.]\s*/, '').trim())
          .filter((line: string) => line.length >= 10 && !line.toLowerCase().includes('error'))
          .slice(0, 7)

        return benefits.length > 0 ? benefits : defaultBenefits
      }

      return await this.retryWithBackoff(operation)
    } catch (error) {
      console.error(`Error generating benefits for ${trend.technology}:`, error)
      return defaultBenefits
    }
  }

  public async generateTrendContent(profile?: CompanyProfile): Promise<TrendContent[]> {
    try {
      const trends: TrendContent[] = []
      
      // Get all categories and their technologies
      const categories = Object.entries(this.trendCategories)
      
      // Filter categories based on company profile if available
      let relevantCategories = categories
      if (profile) {
        const priorities = new Set([
          ...profile.innovationPriorities.map(p => p.toLowerCase()),
          ...profile.businessChallenges.map(c => c.toLowerCase())
        ])

        relevantCategories = categories.filter(([category, _]) => {
          const categoryLower = category.toLowerCase()
          return priorities.has(categoryLower) ||
                 priorities.has(categoryLower.replace('/', '')) ||
                 Array.from(priorities).some(p => p.includes(categoryLower))
        })

        // If no relevant categories found, use all categories
        if (relevantCategories.length === 0) {
          relevantCategories = categories
        }
      }
      
      // Randomly select 5-7 technologies from different categories
      const selectedTechs = new Set<{ tech: string, category: string }>()
      while (selectedTechs.size < Math.min(7, relevantCategories.length)) {
        const [category, techs] = relevantCategories[Math.floor(Math.random() * relevantCategories.length)]
        const tech = techs[Math.floor(Math.random() * techs.length)]
        selectedTechs.add({ tech, category })
      }

      // Generate content for each selected technology
      for (const { tech, category } of selectedTechs) {
        try {
          const trend = await this.generateTechnologyTrend(tech, profile)
          
          // Generate "why use it" content
          try {
            trend.whyUseIt = await this.generateWhyUseIt(trend)
          } catch (error) {
            console.error(`Error generating benefits for ${tech}:`, error)
          }

          trends.push(trend)
          await new Promise(resolve => setTimeout(resolve, 500)) // Rate limiting
        } catch (error) {
          console.error(`Error processing ${tech}:`, error)
          continue
        }
      }

      return trends.sort((a, b) => {
        // If profile exists, prioritize technologies matching company's needs
        if (profile) {
          const aRelevance = this.calculateRelevanceScore(a, profile)
          const bRelevance = this.calculateRelevanceScore(b, profile)
          if (aRelevance !== bRelevance) {
            return bRelevance - aRelevance
          }
        }
        
        // Fall back to popularity/growth score
        const scoreA = (a.popularity + a.growthRate) / 2
        const scoreB = (b.popularity + b.growthRate) / 2
        return scoreB - scoreA
      })
    } catch (error) {
      console.error('Error generating trend content:', error)
      return []
    }
  }

  private calculateRelevanceScore(trend: TrendContent, profile: CompanyProfile): number {
    let score = 0

    // Match with innovation priorities
    score += profile.innovationPriorities.reduce((sum, priority) => {
      const priorityLower = priority.toLowerCase()
      if (trend.technology.toLowerCase().includes(priorityLower)) sum += 3
      if (trend.description.toLowerCase().includes(priorityLower)) sum += 2
      return sum
    }, 0)

    // Match with business challenges
    score += profile.businessChallenges.reduce((sum, challenge) => {
      const challengeLower = challenge.toLowerCase()
      if (trend.description.toLowerCase().includes(challengeLower)) sum += 2
      if (trend.whyUseIt.some(benefit => benefit.toLowerCase().includes(challengeLower))) sum += 3
      return sum
    }, 0)

    // Match with team expertise
    score += profile.teamExpertise.reduce((sum, skill) => {
      const skillLower = skill.toLowerCase()
      if (trend.technology.toLowerCase().includes(skillLower)) sum += 1
      return sum
    }, 0)

    // Budget consideration
    const budgetValue = parseInt(profile.budgetRange.replace(/[^0-9]/g, ''))
    if (budgetValue) {
      // Adjust score based on typical enterprise pricing tiers
      if (budgetValue < 10) score -= 2 // Under $10K
      else if (budgetValue < 50) score -= 1 // $10K - $50K
      else if (budgetValue > 500) score += 2 // Over $500K
    }

    // Timeline consideration
    if (profile.implementationTimeline.includes('Immediate')) score += 2
    else if (profile.implementationTimeline.includes('Short-term')) score += 1
    else if (profile.implementationTimeline.includes('Long-term')) score -= 1

    return score
  }

  private async generateBlogPost(trend: TrendContent): Promise<BlogPost> {
    try {
      const prompt = `
        Generate an engaging blog post about ${trend.technology} in the ${trend.category} category.
        Include:
        1. A compelling headline that highlights business value
        2. A detailed body explaining the technology, its impact, and business applications
        3. A call-to-action that encourages business engagement
        
        Current context:
        - Technology: ${trend.technology}
        - Category: ${trend.category}
        - Description: ${trend.description}
        - Popularity: ${trend.popularity}%
        - Growth Rate: ${trend.growthRate}%

        Format the response in JSON with headline, body, and cta fields.
      `

      const response = await openaiService.generateContent({
        trend: trend.technology,
        context: `${trend.category} - Blog Content Generation`,
        format: 'json',
        industry: trend.category.toLowerCase()
      })

      if (response.success && response.content) {
        try {
          const content = JSON.parse(response.content)
          return {
            headline: content.headline || `Transform Your Business with ${trend.technology}`,
            body: content.body || trend.description,
            cta: content.cta || 'Learn more about our solutions!',
            category: trend.category,
            lastUpdated: new Date().toISOString()
          }
        } catch (parseError) {
          console.error('Error parsing OpenAI response:', parseError)
          return this.getFallbackBlogPost(trend)
        }
      }

      return this.getFallbackBlogPost(trend)
    } catch (error) {
      console.error(`Error generating blog post for ${trend.technology}:`, error)
      return this.getFallbackBlogPost(trend)
    }
  }

  private getFallbackBlogPost(trend: TrendContent): BlogPost {
    return {
      headline: `Transform Your Business with ${trend.technology}`,
      body: `${trend.technology} is revolutionizing the ${trend.category} landscape. ${trend.description} With a popularity score of ${trend.popularity}% and a growth rate of ${trend.growthRate}%, this technology is positioned to make a significant impact on businesses across industries.`,
      cta: 'Learn more about our solutions!',
      category: trend.category,
      lastUpdated: new Date().toISOString()
    }
  }

  public async generateBlogContent(): Promise<BlogPost[]> {
    try {
      // Get trends sorted by combined score
      const sortedTrends = Array.from(await this.generateTrendContent())
        .sort((a, b) => ((b.popularity + b.growthRate) / 2) - ((a.popularity + a.growthRate) / 2))
        .slice(0, 7) // Get top 7 trends

      // Generate blog posts for each trend
      const blogPosts = await Promise.all(
        sortedTrends.map(trend => this.generateBlogPost(trend))
      )

      return blogPosts
    } catch (error) {
      console.error('Error generating blog content:', error)
      return (await this.generateTrendContent()).slice(0, 7).map(trend => this.getFallbackBlogPost(trend))
    }
  }

  private async generateBlogForTechnology(trend: string): Promise<TechnologyBlog> {
    const response = await openaiService.generateContent({
      trend,
      context: 'Generate a detailed technical blog post with implementation examples',
      format: 'json',
      industry: 'Technology',
      requirements: 'Include specific version numbers, technical details, and real company examples'
    })

    if (!response.success || !response.content) {
      throw new Error('Failed to generate blog content')
    }

    const data = JSON.parse(response.content)
    
    // Convert markdown to HTML for the blog body
    const blogBody: string = marked.parse(`
# ${data.technology}

${data.description}

## Key Features and Capabilities

${data.technicalDetails.requirements.map((req: string) => `- ${req}`).join('\n')}

## Implementation Guide

${data.stackRecommendations.current.map((tech: string, i: number) => 
  `${i + 1}. Replace **${tech}** with **${data.stackRecommendations.recommended[i]}**`
).join('\n')}

## Benefits

${data.stackRecommendations.benefits.map((benefit: string) => `- ${benefit}`).join('\n')}

## Real-World Impact

${data.companyAdoptions.map((company: CompanyAdoption) => `
### ${company.name}

${company.useCase}

**Impact**: ${company.impact}
`).join('\n')}
`) as string;

    return {
      headline: `${data.technology}: The Next Evolution in ${trend}`,
      body: blogBody,
      cta: 'Learn More About Implementation',
      category: trend,
      lastUpdated: new Date().toISOString(),
      technology: {
        name: data.technology,
        version: data.technology.split(' ').pop() || 'Latest',
        popularity: data.popularity,
        growthRate: data.growthRate
      },
      technicalDetails: {
        requirements: data.technicalDetails.requirements,
        integrations: data.technicalDetails.integrations,
        limitations: data.technicalDetails.limitations
      },
      companyAdoptions: data.companyAdoptions
    }
  }

  async generateTechnicalBlogContent(): Promise<TechnologyBlog[]> {
    const trends = [
      'AWS Bedrock',
      'Google Gemini Pro',
      'Anthropic Claude 3',
      'Azure OpenAI Service',
      'MongoDB Atlas Serverless',
      'Next.js 14',
      'Kubernetes Fleet Manager',
      'OpenTelemetry'
    ]

    try {
      const blogPromises = trends.map(trend => this.generateBlogForTechnology(trend))
      return await Promise.all(blogPromises)
    } catch (error) {
      console.error('Error generating blogs:', error)
      throw error
    }
  }
}

export const contentGenerator = new ContentGenerator()
