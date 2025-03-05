'use client'

import { useState, useEffect } from 'react'
import { openaiService } from '@/services/openaiService'

interface MigrationRecommendation {
  currentStack: string[]
  recommendedStack: string[]
  timeline: string
  effort: string
  risks: string[]
  benefits: string[]
  steps: {
    phase: string
    duration: string
    tasks: string[]
    resources: string[]
  }[]
  costEstimate: {
    training: string
    tools: string
    infrastructure: string
    total: string
  }
  teamImpact: {
    requiredSkills: string[]
    trainingNeeds: string[]
    teamStructure: string
  }
}

interface CompanyProfile {
  name: string
  industry: string
  size: string
  technologyStack: string[]
  teamExpertise: string[]
  businessChallenges: string[]
  innovationPriorities: string[]
  implementationTimeline: string
  budgetRange: string
}

export default function MigratePage() {
  const [profile, setProfile] = useState<CompanyProfile | null>(null)
  const [recommendation, setRecommendation] = useState<MigrationRecommendation | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/profile')
      if (!response.ok) throw new Error('Failed to fetch profile')
      const data = await response.json()
      setProfile(data)
    } catch (err) {
      setError('Failed to load company profile')
      console.error(err)
    }
  }

  const generateMigrationPlan = async () => {
    if (!profile) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/migration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      })

      if (!response.ok) throw new Error('Failed to generate migration plan')
      
      const data = await response.json()
      setRecommendation(data)
    } catch (err) {
      setError('Failed to generate migration plan')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Technology Migration Planner</h1>
          <p className="text-red-600">
            Please complete your company profile first to get migration recommendations.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Technology Migration Planner</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Current Profile</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium">Technology Stack</h3>
              <ul className="list-disc list-inside">
                {profile.technologyStack.map((tech, i) => (
                  <li key={i}>{tech}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-medium">Team Expertise</h3>
              <ul className="list-disc list-inside">
                {profile.teamExpertise.map((skill, i) => (
                  <li key={i}>{skill}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {!recommendation && (
          <button
            onClick={generateMigrationPlan}
            disabled={loading}
            className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark disabled:opacity-50"
          >
            {loading ? 'Generating...' : 'Generate Migration Plan'}
          </button>
        )}

        {error && (
          <div className="text-red-600 mt-4">
            {error}
          </div>
        )}

        {recommendation && (
          <div className="bg-white rounded-lg shadow p-6 mt-6">
            <h2 className="text-xl font-semibold mb-4">Migration Recommendation</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-medium">Recommended Stack</h3>
                <ul className="list-disc list-inside">
                  {recommendation.recommendedStack.map((tech, i) => (
                    <li key={i}>{tech}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-medium">Timeline & Effort</h3>
                <p>{recommendation.timeline}</p>
                <p>{recommendation.effort}</p>
              </div>

              <div>
                <h3 className="font-medium">Implementation Phases</h3>
                <div className="space-y-4">
                  {recommendation.steps.map((step, i) => (
                    <div key={i} className="border-l-4 border-primary pl-4">
                      <h4 className="font-medium">{step.phase}</h4>
                      <p className="text-sm text-gray-600">{step.duration}</p>
                      <ul className="list-disc list-inside">
                        {step.tasks.map((task, j) => (
                          <li key={j}>{task}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium">Benefits</h3>
                  <ul className="list-disc list-inside">
                    {recommendation.benefits.map((benefit, i) => (
                      <li key={i}>{benefit}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium">Risks</h3>
                  <ul className="list-disc list-inside">
                    {recommendation.risks.map((risk, i) => (
                      <li key={i}>{risk}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div>
                <h3 className="font-medium">Cost Estimate</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>Training: {recommendation.costEstimate.training}</div>
                  <div>Tools: {recommendation.costEstimate.tools}</div>
                  <div>Infrastructure: {recommendation.costEstimate.infrastructure}</div>
                  <div className="font-medium">Total: {recommendation.costEstimate.total}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 