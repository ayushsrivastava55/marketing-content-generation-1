'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { useSession } from 'next-auth/react'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import TrendVisualizations from '@/components/TrendVisualizations'

interface Trend {
  technology: string
  description: string
  popularity: number
  growthRate: number
  whyUseIt: string[]
  category: string
  sources: string[]
  companyAdoptions: Array<{
    name: string
    description: string
    useCase: string
    impact: string
  }>
  stackRecommendations: {
    current: string[]
    recommended: string[]
    benefits: string[]
    migrationComplexity: string
    estimatedTimeframe: string
  }
}

export default function TrendsPage() {
  const { data: session } = useSession()
  const [trends, setTrends] = useState<Trend[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedIndustry, setSelectedIndustry] = useState('all')

  const industries = [
    'all',
    'Technology',
    'Marketing',
    'Finance',
    'Healthcare',
    'E-commerce',
    'Education'
  ]

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        setLoading(true)
        setError(null)
        
        console.log('Fetching trends data...');
        const response = await fetch('/api/trends')
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        console.log('Received trends response:', {
          success: data.success,
          trendsCount: data.data?.trends?.length,
          hasError: !!data.error
        });

        if (!data.success) {
          throw new Error(data.error || 'Failed to fetch trends')
        }

        if (!data.data?.trends || !Array.isArray(data.data.trends)) {
          throw new Error('Invalid trends data received')
        }

        setTrends(data.data.trends)
      } catch (err) {
        console.error('Error fetching trends:', err)
        setError(err instanceof Error ? err.message : 'Failed to load trends')
      } finally {
        setLoading(false)
      }
    }

    fetchTrends()
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto p-4 space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="w-full">
            <CardContent className="p-6 space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  const filteredTrends = selectedIndustry === 'all'
    ? trends
    : trends.filter(trend => 
        trend.category.toLowerCase() === selectedIndustry.toLowerCase()
      )

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-primary">Technology Trends</h1>
        <select
          value={selectedIndustry}
          onChange={(e) => setSelectedIndustry(e.target.value)}
          className="border border-gray-300 rounded-md p-2"
        >
          {industries.map(industry => (
            <option key={industry} value={industry}>
              {industry.charAt(0).toUpperCase() + industry.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {trends.length > 0 && (
        <TrendVisualizations trends={trends} />
      )}

      <div className="grid grid-cols-1 gap-6">
        {filteredTrends.map((trend, index) => (
          <Card key={index} className="w-full">
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-primary">{trend.technology}</h2>
                  <p className="text-gray-600">{trend.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold">
                    Popularity: {trend.popularity}%
                  </div>
                  <div className="text-sm font-semibold">
                    Growth Rate: {trend.growthRate}%
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Why Use It:</h3>
                <ul className="list-disc pl-5 space-y-1">
                  {trend.whyUseIt.map((reason, i) => (
                    <li key={i} className="text-gray-600">{reason}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Stack Recommendations:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium">Current Stack:</h4>
                    <ul className="list-disc pl-5">
                      {trend.stackRecommendations.current.map((tech, i) => (
                        <li key={i} className="text-gray-600">{tech}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Recommended Stack:</h4>
                    <ul className="list-disc pl-5">
                      {trend.stackRecommendations.recommended.map((tech, i) => (
                        <li key={i} className="text-gray-600">{tech}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="mt-2">
                  <h4 className="text-sm font-medium">Benefits:</h4>
                  <ul className="list-disc pl-5">
                    {trend.stackRecommendations.benefits.map((benefit, i) => (
                      <li key={i} className="text-gray-600">{benefit}</li>
                    ))}
                  </ul>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium">Migration Complexity: </span>
                    <span className="text-gray-600">{trend.stackRecommendations.migrationComplexity}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Estimated Timeframe: </span>
                    <span className="text-gray-600">{trend.stackRecommendations.estimatedTimeframe}</span>
                  </div>
                </div>
              </div>

              {trend.companyAdoptions.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Company Adoptions:</h3>
                  <div className="space-y-3">
                    {trend.companyAdoptions.map((adoption, i) => (
                      <div key={i} className="bg-gray-50 p-3 rounded-md">
                        <div className="font-medium">{adoption.name}</div>
                        <div className="text-sm text-gray-600">{adoption.description}</div>
                        <div className="text-sm">
                          <span className="font-medium">Use Case:</span> {adoption.useCase}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Impact:</span> {adoption.impact}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="text-sm text-gray-500">
                Sources: {trend.sources.join(', ')}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
