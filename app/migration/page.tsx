'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface MigrationPlan {
  id: string;
  projectName: string;
  description: string;
  currentTechnologies: string[];
  targetTechnologies: string[];
  timeline: {
    phases: {
      name: string;
      duration: string;
      dependencies: string[];
      risks: string[];
      tasks: {
        name: string;
        description: string;
        status: 'pending' | 'in-progress' | 'completed';
        assignedTo: string;
      }[];
    }[];
    totalDuration: string;
    criticalPath: string[];
  };
  riskAssessment: {
    technicalRisks: {
      description: string;
      impact: 'low' | 'medium' | 'high';
      mitigation: string;
    }[];
    resourceRisks: {
      description: string;
      impact: 'low' | 'medium' | 'high';
      mitigation: string;
    }[];
    timelineRisks: {
      description: string;
      impact: 'low' | 'medium' | 'high';
      mitigation: string;
    }[];
  };
  costEstimate: {
    development: {
      min: number;
      max: number;
    };
    infrastructure: {
      min: number;
      max: number;
    };
    training: {
      min: number;
      max: number;
    };
    contingency: {
      min: number;
      max: number;
    };
    total: {
      min: number;
      max: number;
    };
    currency: string;
  };
  status: 'planning' | 'in-progress' | 'completed';
  progress: number;
  startDate: string;
  expectedEndDate: string;
  actualEndDate?: string;
  teamSize: number;
  budget: {
    allocated: number;
    spent: number;
    currency: string;
  };
}

export default function MigrationPage() {
  const { data: session } = useSession()
  const [migrationPlan, setMigrationPlan] = useState<MigrationPlan | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMigrationPlan = async () => {
      if (!session?.user) return
      try {
        const response = await fetch('/api/migration')
        if (response.ok) {
          const data = await response.json()
          setMigrationPlan(data)
        }
      } catch (error) {
        console.error('Error fetching migration plan:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMigrationPlan()
  }, [session])

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">Loading migration analysis...</div>
        </div>
      </div>
    )
  }

  if (!migrationPlan) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-red-600">Please complete your profile first</div>
        </div>
      </div>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: migrationPlan.costEstimate.currency
    }).format(amount)
  }

  const getImpactColor = (impact: 'low' | 'medium' | 'high') => {
    switch (impact) {
      case 'high':
        return 'bg-red-100 text-red-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: 'pending' | 'in-progress' | 'completed') => {
    switch (status) {
      case 'completed':
        return 'bg-green-600'
      case 'in-progress':
        return 'bg-yellow-600'
      case 'pending':
        return 'bg-gray-600'
      default:
        return 'bg-gray-600'
    }
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Migration Analysis</h1>

        {/* Project Overview */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h1 className="text-2xl font-bold mb-4">{migrationPlan.projectName}</h1>
          <p className="text-gray-600 mb-4">{migrationPlan.description}</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h3 className="font-medium">Status</h3>
              <p className="text-lg">{migrationPlan.status}</p>
            </div>
            <div>
              <h3 className="font-medium">Progress</h3>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full"
                  style={{ width: `${migrationPlan.progress}%` }}
                ></div>
              </div>
            </div>
            <div>
              <h3 className="font-medium">Team Size</h3>
              <p className="text-lg">{migrationPlan.teamSize} members</p>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Migration Timeline</h2>
          <div className="space-y-4">
            {migrationPlan.timeline.phases.map((phase, index) => (
              <div key={index} className="border-l-2 border-blue-500 pl-4">
                <h3 className="font-medium">{phase.name}</h3>
                <p className="text-sm text-gray-500">Duration: {phase.duration}</p>
                {phase.tasks && phase.tasks.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {phase.tasks.map((task, taskIndex) => (
                      <div key={taskIndex} className="flex items-center space-x-2">
                        <span className={`w-2 h-2 rounded-full ${getStatusColor(task.status)}`}></span>
                        <span>{task.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <p className="text-sm text-gray-500 mt-4">
              Total Duration: {migrationPlan.timeline.totalDuration}
            </p>
          </div>
        </div>

        {/* Tech Stack Analysis */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Current Stack</h2>
            <ul className="list-disc list-inside space-y-2">
              {migrationPlan.currentTechnologies.map((tech, index) => (
                <li key={index}>{tech}</li>
              ))}
            </ul>
          </div>
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Target Stack</h2>
            <ul className="list-disc list-inside space-y-2">
              {migrationPlan.targetTechnologies.map((tech, index) => (
                <li key={index}>{tech}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Risk Assessment */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Risk Assessment</h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-medium mb-2">Technical Risks</h3>
              <div className="space-y-2">
                {migrationPlan.riskAssessment.technicalRisks.map((risk, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${getImpactColor(risk.impact)}`}>
                      {risk.impact}
                    </span>
                    <div>
                      <p className="font-medium">{risk.description}</p>
                      <p className="text-sm text-gray-500">Mitigation: {risk.mitigation}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-medium mb-2">Resource Risks</h3>
              <div className="space-y-2">
                {migrationPlan.riskAssessment.resourceRisks.map((risk, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${getImpactColor(risk.impact)}`}>
                      {risk.impact}
                    </span>
                    <div>
                      <p className="font-medium">{risk.description}</p>
                      <p className="text-sm text-gray-500">Mitigation: {risk.mitigation}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Cost Estimation */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Cost Estimation</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">Development</h3>
              <p className="text-sm text-gray-500">
                {formatCurrency(migrationPlan.costEstimate.development.min)} - {formatCurrency(migrationPlan.costEstimate.development.max)}
              </p>
            </div>
            <div>
              <h3 className="font-medium">Infrastructure</h3>
              <p className="text-sm text-gray-500">
                {formatCurrency(migrationPlan.costEstimate.infrastructure.min)} - {formatCurrency(migrationPlan.costEstimate.infrastructure.max)}
              </p>
            </div>
            <div>
              <h3 className="font-medium">Training</h3>
              <p className="text-sm text-gray-500">
                {formatCurrency(migrationPlan.costEstimate.training.min)} - {formatCurrency(migrationPlan.costEstimate.training.max)}
              </p>
            </div>
            <div>
              <h3 className="font-medium">Contingency</h3>
              <p className="text-sm text-gray-500">
                {formatCurrency(migrationPlan.costEstimate.contingency.min)} - {formatCurrency(migrationPlan.costEstimate.contingency.max)}
              </p>
            </div>
            <div className="pt-4 border-t">
              <h3 className="font-medium">Total Estimated Cost</h3>
              <p className="text-lg font-semibold text-primary">
                {formatCurrency(migrationPlan.costEstimate.total.min)} - {formatCurrency(migrationPlan.costEstimate.total.max)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
