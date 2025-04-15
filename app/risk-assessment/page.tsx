'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ExclamationTriangleIcon, ShieldCheckIcon } from '@heroicons/react/24/outline'

interface Risk {
  id: string
  category: 'technical' | 'operational' | 'security' | 'business'
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  impact: string
  mitigation: string
  status: 'identified' | 'mitigated' | 'accepted'
}

interface RiskAnalysis {
  risks: Risk[]
  summary: {
    totalRisks: number
    criticalRisks: number
    highRisks: number
    mitigatedRisks: number
  }
  recommendations: string[]
}

export default function RiskAssessmentPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [riskAnalysis, setRiskAnalysis] = useState<RiskAnalysis | null>(null)

  const fetchRiskAnalysis = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/risk-assessment')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch risk analysis')
      }

      if (response.status === 404) {
        router.push('/profile')
        return
      }

      setRiskAnalysis(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch risk analysis')
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    fetchRiskAnalysis()
  }, [fetchRiskAnalysis])

  const getSeverityColor = (severity: Risk['severity']) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50'
      case 'high': return 'text-orange-600 bg-orange-50'
      case 'medium': return 'text-yellow-600 bg-yellow-50'
      case 'low': return 'text-green-600 bg-green-50'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Analyzing risks...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 p-4 rounded-lg">
            <h2 className="text-red-800 font-medium">Error</h2>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Risk Assessment</h1>

        {/* Risk Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-medium mb-2">Total Risks</h3>
            <p className="text-2xl font-bold">{riskAnalysis?.summary.totalRisks}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-medium mb-2">Critical Risks</h3>
            <p className="text-2xl font-bold text-red-600">{riskAnalysis?.summary.criticalRisks}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-medium mb-2">High Risks</h3>
            <p className="text-2xl font-bold text-orange-600">{riskAnalysis?.summary.highRisks}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-medium mb-2">Mitigated</h3>
            <p className="text-2xl font-bold text-green-600">{riskAnalysis?.summary.mitigatedRisks}</p>
          </div>
        </div>

        {/* Risk List */}
        <div className="space-y-6">
          {riskAnalysis?.risks.map(risk => (
            <div key={risk.id} className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
                    <h3 className="font-medium">{risk.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-sm ${getSeverityColor(risk.severity)}`}>
                      {risk.severity}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4">{risk.description}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  risk.status === 'mitigated' ? 'bg-green-100 text-green-800' :
                  risk.status === 'accepted' ? 'bg-blue-100 text-blue-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {risk.status}
                </span>
              </div>

              <div className="mt-4 space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Potential Impact</h4>
                  <p className="text-gray-700">{risk.impact}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Mitigation Strategy</h4>
                  <div className="flex items-start gap-2">
                    <ShieldCheckIcon className="w-5 h-5 text-green-500 mt-0.5" />
                    <p className="text-gray-700">{risk.mitigation}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recommendations */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Recommendations</h2>
          <ul className="space-y-2">
            {riskAnalysis?.recommendations.map((recommendation, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-blue-500">•</span>
                <span>{recommendation}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
} 