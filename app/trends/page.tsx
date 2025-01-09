'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
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
        
        const response = await fetch('/api/trends')
        const data = await response.json()

        if (!data.success) {
          throw new Error(data.error || 'Failed to fetch trends')
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

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Latest Technology Trends</h1>
        <select
          value={selectedIndustry}
          onChange={(e) => setSelectedIndustry(e.target.value)}
          className="rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        >
          {industries.map((industry) => (
            <option key={industry} value={industry}>
              {industry.charAt(0).toUpperCase() + industry.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Visualizations Section */}
      <TrendVisualizations trends={trends} selectedIndustry={selectedIndustry} />
      
      {/* Detailed Trends Section */}
      <div className="space-y-6">
        {trends.map((trend, index) => (
          <Card key={index} className="w-full">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl font-semibold mb-2">{trend.technology}</h2>
                  <p className="text-gray-600 dark:text-gray-300">{trend.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 my-4">
                  <div>
                    <p className="font-semibold">Popularity</p>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ width: `${trend.popularity}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold">Growth Rate</p>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                      <div 
                        className="bg-green-600 h-2.5 rounded-full" 
                        style={{ width: `${trend.growthRate}%` }}
                      />
                    </div>
                  </div>
                </div>

                {trend.whyUseIt && trend.whyUseIt.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Why Use It</h3>
                    <ul className="list-disc list-inside space-y-1">
                      {trend.whyUseIt.map((reason, idx) => (
                        <li key={idx} className="text-gray-600 dark:text-gray-300">{reason}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {trend.companyAdoptions && trend.companyAdoptions.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Company Adoptions</h3>
                    <div className="space-y-3">
                      {trend.companyAdoptions.map((adoption, idx) => (
                        <div key={idx} className="border rounded-lg p-3">
                          <p className="font-semibold">{adoption.name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">{adoption.description}</p>
                          <p className="mt-2"><span className="font-medium">Use Case:</span> {adoption.useCase}</p>
                          <p><span className="font-medium">Impact:</span> {adoption.impact}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {trend.stackRecommendations && (
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Implementation Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="font-medium">Current Stack:</p>
                        <ul className="list-disc list-inside">
                          {trend.stackRecommendations.current.map((tech, idx) => (
                            <li key={idx} className="text-gray-600 dark:text-gray-300">{tech}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="font-medium">Recommended Stack:</p>
                        <ul className="list-disc list-inside">
                          {trend.stackRecommendations.recommended.map((tech, idx) => (
                            <li key={idx} className="text-gray-600 dark:text-gray-300">{tech}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <div className="mt-3">
                      <p><span className="font-medium">Migration Complexity:</span> {trend.stackRecommendations.migrationComplexity}</p>
                      <p><span className="font-medium">Estimated Timeframe:</span> {trend.stackRecommendations.estimatedTimeframe}</p>
                    </div>
                    {trend.stackRecommendations.benefits.length > 0 && (
                      <div className="mt-3">
                        <p className="font-medium">Benefits:</p>
                        <ul className="list-disc list-inside">
                          {trend.stackRecommendations.benefits.map((benefit, idx) => (
                            <li key={idx} className="text-gray-600 dark:text-gray-300">{benefit}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
