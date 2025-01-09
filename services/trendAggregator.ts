import axios from 'axios'
import * as cheerio from 'cheerio'
import googleTrends from 'google-trends-api'

interface RawTrend {
  title: string;
  description?: string;
  source: string;
  date: string;
  url?: string;
  metrics: {
    popularity?: number;
    growthRate?: number;
  };
  category?: string;
}

interface ProcessedTrend {
  technology: string;
  description: string;
  popularity: number;
  growthRate: number;
  category: string;
  sources: string[];
  lastUpdated: string;
  urls: string[];
}

interface TrendSource {
  name: string;
  url: string;
  type: 'api' | 'scrape';
}

class TrendAggregator {
  private sources: TrendSource[] = [
    { name: 'GitHub Trending', url: 'https://api.github.com', type: 'api' },
    { name: 'HackerNews', url: 'https://hacker-news.firebaseio.com/v0', type: 'api' },
    { name: 'StackOverflow', url: 'https://api.stackexchange.com', type: 'api' }
  ]

  private async fetchGitHubTrending(): Promise<RawTrend[]> {
    const languages = ['javascript', 'typescript', 'python', 'java']
    const trends: RawTrend[] = []

    try {
      for (const language of languages) {
        try {
          const response = await axios.get(
            `https://api.github.com/search/repositories?q=language:${language}+created:>2024-01-01&sort=stars&order=desc`,
            {
              headers: {
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'TrendAnalyzer'
              },
              timeout: 5000
            }
          )

          if (response.data?.items) {
            response.data.items.slice(0, 5).forEach((repo: any) => {
              trends.push({
                title: repo.name,
                description: repo.description || '',
                source: 'GitHub',
                date: new Date().toISOString(),
                url: repo.html_url,
                metrics: {
                  popularity: Math.min(repo.stargazers_count / 1000, 100),
                  growthRate: repo.forks_count
                },
                category: `${language.charAt(0).toUpperCase() + language.slice(1)} Development`
              })
            })
          }
        } catch (error) {
          console.error(`Error fetching GitHub data for ${language}:`, error)
          continue
        }
      }

      return trends
    } catch (error) {
      console.error('Error in GitHub trending:', error)
      return []
    }
  }

  private async fetchHackerNews(): Promise<RawTrend[]> {
    try {
      const response = await axios.get(
        'https://hacker-news.firebaseio.com/v0/topstories.json',
        { timeout: 5000 }
      )
      
      if (!Array.isArray(response.data)) {
        console.warn('Invalid response from HackerNews API')
        return []
      }

      const storyIds = response.data.slice(0, 10)
      const trends: RawTrend[] = []

      const storyPromises = storyIds.map(async (id) => {
        try {
          const storyResponse = await axios.get(
            `https://hacker-news.firebaseio.com/v0/item/${id}.json`,
            { timeout: 3000 }
          )
          
          const story = storyResponse.data
          if (story && this.isTechRelated(story.title)) {
            return {
              title: story.title,
              description: story.text || '',
              source: 'HackerNews',
              date: new Date(story.time * 1000).toISOString(),
              url: story.url,
              metrics: {
                popularity: Math.min((story.score || 0) / 10, 100),
                growthRate: story.descendants || 0 // Use comment count as growth indicator
              },
              category: 'Technology News'
            }
          }
          return null
        } catch (error) {
          console.error('Error fetching HN story:', error)
          return null
        }
      })

      const stories = await Promise.allSettled(storyPromises)
      stories.forEach(result => {
        if (result.status === 'fulfilled' && result.value) {
          trends.push(result.value)
        }
      })

      return trends
    } catch (error) {
      console.error('Error in HackerNews:', error)
      return []
    }
  }

  private async fetchStackOverflowTrends(): Promise<RawTrend[]> {
    const tags = ['javascript', 'python', 'react', 'nodejs', 'ai', 'machine-learning']
    const trends: RawTrend[] = []

    try {
      for (const tag of tags) {
        try {
          const response = await axios.get(
            `https://api.stackexchange.com/2.3/questions?order=desc&sort=hot&site=stackoverflow&tagged=${tag}&pagesize=5`,
            { timeout: 5000 }
          )

          if (response.data?.items) {
            response.data.items.forEach((item: any) => {
              trends.push({
                title: item.title,
                description: item.tags.join(', '),
                source: 'StackOverflow',
                date: new Date(item.creation_date * 1000).toISOString(),
                url: item.link,
                metrics: {
                  popularity: Math.min((item.score || 0) * 10, 100),
                  growthRate: item.answer_count || 0
                },
                category: `${tag.charAt(0).toUpperCase() + tag.slice(1)} Development`
              })
            })
          }
        } catch (error) {
          console.error(`Error fetching StackOverflow data for ${tag}:`, error)
          continue
        }
      }

      return trends
    } catch (error) {
      console.error('Error in StackOverflow trends:', error)
      return []
    }
  }

  private isTechRelated(title: string): boolean {
    const techKeywords = [
      'ai', 'ml', 'api', 'app', 'tech', 'code', 'data',
      'cloud', 'web', 'software', 'hardware', 'programming',
      'developer', 'security', 'cyber', 'blockchain', 'crypto',
      'mobile', 'device', 'startup', 'innovation'
    ]
    const lowerTitle = title.toLowerCase()
    return techKeywords.some(keyword => lowerTitle.includes(keyword))
  }

  private processTrends(rawTrends: RawTrend[]): ProcessedTrend[] {
    if (!Array.isArray(rawTrends) || rawTrends.length === 0) {
      console.warn('No raw trends to process')
      return []
    }

    const trendMap = new Map<string, ProcessedTrend>()

    rawTrends.forEach(trend => {
      if (!trend.title) {
        console.warn('Skipping trend with no title')
        return
      }

      // Normalize the title to use as key
      const key = trend.title.toLowerCase().trim()

      const existing = trendMap.get(key)
      if (existing) {
        // Update existing trend
        existing.sources.push(trend.source)
        if (trend.url) existing.urls.push(trend.url)
        
        // Update metrics
        const newPopularity = trend.metrics.popularity || 0
        const newGrowthRate = trend.metrics.growthRate || 0
        
        existing.popularity = Math.max(existing.popularity, newPopularity)
        existing.growthRate = Math.max(existing.growthRate, newGrowthRate)
        
        // Update last updated if newer
        if (trend.date > existing.lastUpdated) {
          existing.lastUpdated = trend.date
        }
      } else {
        // Create new trend
        trendMap.set(key, {
          technology: trend.title,
          description: trend.description || '',
          popularity: trend.metrics.popularity || 0,
          growthRate: trend.metrics.growthRate || 0,
          category: trend.category || 'Technology',
          sources: [trend.source],
          lastUpdated: trend.date,
          urls: trend.url ? [trend.url] : []
        })
      }
    })

    // Convert map to array and sort by popularity and growth rate
    return Array.from(trendMap.values())
      .sort((a, b) => {
        const scoreA = a.popularity * 0.7 + a.growthRate * 0.3
        const scoreB = b.popularity * 0.7 + b.growthRate * 0.3
        return scoreB - scoreA
      })
      .slice(0, 20) // Return top 20 trends
  }

  private getFallbackTrends(): RawTrend[] {
    return [
      {
        title: 'AWS Bedrock',
        description: 'A fully managed service that makes FMs from AI21 Labs, Anthropic, Cohere, Meta, Stability AI, and Amazon accessible via an API',
        source: 'Technology Trends',
        date: new Date().toISOString(),
        url: 'https://aws.amazon.com/bedrock/',
        metrics: {
          popularity: 85,
          growthRate: 90
        },
        category: 'Cloud Computing'
      },
      {
        title: 'Gemini API',
        description: 'Google\'s most capable AI model for text, code, images, and more',
        source: 'Technology Trends',
        date: new Date().toISOString(),
        url: 'https://deepmind.google/technologies/gemini/',
        metrics: {
          popularity: 90,
          growthRate: 95
        },
        category: 'AI/ML'
      },
      {
        title: 'Next.js 14',
        description: 'The React Framework for the Web with server actions and partial prerendering',
        source: 'Technology Trends',
        date: new Date().toISOString(),
        url: 'https://nextjs.org/blog/next-14',
        metrics: {
          popularity: 88,
          growthRate: 85
        },
        category: 'Web Development'
      }
    ]
  }

  public async aggregateTrends(industry?: string): Promise<ProcessedTrend[]> {
    try {
      // Execute all fetches in parallel but handle failures gracefully
      const results = await Promise.allSettled([
        this.fetchGitHubTrending(),
        this.fetchHackerNews(),
        this.fetchStackOverflowTrends()
      ])

      // Combine successful results
      const allTrends = results.reduce((acc, result) => {
        if (result.status === 'fulfilled' && Array.isArray(result.value)) {
          return [...acc, ...result.value]
        }
        return acc
      }, [] as RawTrend[])

      // If no trends were fetched, use fallback data
      if (allTrends.length === 0) {
        console.warn('No trends were fetched from any source, using fallback data')
        return this.processTrends(this.getFallbackTrends())
      }

      const processedTrends = this.processTrends(allTrends)

      // Filter by industry if specified
      if (industry && industry !== 'all') {
        const filteredTrends = processedTrends.filter(trend => 
          trend.category?.toLowerCase().includes(industry.toLowerCase()) ||
          trend.sources.some(source => 
            source.toLowerCase().includes(industry.toLowerCase())
          )
        )
        return filteredTrends.length > 0 ? filteredTrends : processedTrends
      }

      return processedTrends
    } catch (error) {
      console.error('Error aggregating trends:', error)
      // Return fallback data on error
      return this.processTrends(this.getFallbackTrends())
    }
  }
}

export const trendAggregator = new TrendAggregator()
