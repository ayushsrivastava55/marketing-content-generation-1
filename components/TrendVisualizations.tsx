'use client'

import React from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts'
import { Card, CardContent } from './ui/card'

interface TrendData {
  technology: string
  description: string
  popularity: number
  growthRate: number
  whyUseIt?: string[]
  category: string
  sources?: string[]
  companyAdoptions?: Array<{
    name: string
    description: string
    useCase: string
    impact: string
  }>
  stackRecommendations?: {
    current: string[]
    recommended: string[]
    benefits: string[]
    migrationComplexity: string
    estimatedTimeframe: string
  }
}

interface Props {
  trends: TrendData[]
  selectedIndustry: string
}

const TrendVisualizations: React.FC<Props> = ({ trends, selectedIndustry }) => {
  if (!trends || trends.length === 0) {
    return null
  }

  // Prepare data for popularity chart
  const popularityData = trends.map((trend) => ({
    name: trend.technology,
    popularity: trend.popularity,
    growthRate: trend.growthRate,
  }))

  // Prepare data for adoption timeline
  const timelineData = trends.map((trend) => ({
    name: trend.technology,
    adoptionRate: trend.popularity + trend.growthRate / 2,
  }))

  return (
    <div className="space-y-8">
      {/* Popularity and Growth Rate Comparison */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-xl font-semibold mb-4">Technology Popularity & Growth Rate</h3>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={popularityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="popularity" fill="#3b82f6" name="Popularity" />
                <Bar dataKey="growthRate" fill="#22c55e" name="Growth Rate" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Adoption Timeline */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-xl font-semibold mb-4">Technology Adoption Timeline</h3>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="adoptionRate"
                  stroke="#3b82f6"
                  name="Adoption Rate"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Company Adoptions */}
      {trends.some(trend => trend.companyAdoptions && trend.companyAdoptions.length > 0) && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold mb-4">Notable Company Adoptions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {trends.map((trend) =>
                trend.companyAdoptions?.map((adoption, idx) => (
                  <Card key={`${trend.technology}-${idx}`}>
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold">{adoption.name}</h4>
                            <p className="text-sm text-gray-600">{trend.technology}</p>
                          </div>
                        </div>
                        <p className="text-sm">{adoption.description}</p>
                        <div className="mt-2">
                          <p className="text-sm"><span className="font-medium">Use Case:</span> {adoption.useCase}</p>
                          <p className="text-sm"><span className="font-medium">Impact:</span> {adoption.impact}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default TrendVisualizations
