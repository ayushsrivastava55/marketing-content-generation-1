'use client'

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

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
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [migrationPlan, setMigrationPlan] = useState<MigrationPlan | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.user) {
      router.push('/auth/signin');
      return;
    }

    async function fetchMigrationPlan() {
      try {
        const response = await fetch('/api/migration');
        if (!response.ok) {
          throw new Error('Failed to fetch migration plan');
        }
        const data = await response.json();
        setMigrationPlan(data);
      } catch (err) {
        setError('Failed to load migration plan. Please try again later.');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchMigrationPlan();
  }, [session, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 p-4 rounded-md">
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!migrationPlan) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-yellow-50 p-4 rounded-md">
            <p className="text-yellow-700">Please complete your company profile first.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Migration Plan</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Project Overview */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Project Overview</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">Project Name</h3>
              <p className="text-gray-600">{migrationPlan.projectName}</p>
            </div>
            <div>
              <h3 className="text-lg font-medium">Description</h3>
              <p className="text-gray-600">{migrationPlan.description}</p>
            </div>
            <div>
              <h3 className="text-lg font-medium">Status</h3>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium
                ${migrationPlan.status === 'completed' ? 'bg-green-100 text-green-800' :
                  migrationPlan.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                  'bg-yellow-100 text-yellow-800'}`}>
                {migrationPlan.status.charAt(0).toUpperCase() + migrationPlan.status.slice(1)}
              </span>
            </div>
            <div>
              <h3 className="text-lg font-medium">Progress</h3>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full" 
                  style={{ width: `${migrationPlan.progress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-1">{migrationPlan.progress}% Complete</p>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Timeline</h2>
          <div className="space-y-4">
            {migrationPlan.timeline.phases.map((phase, index) => (
              <div key={index} className="border-l-2 border-blue-500 pl-4">
                <h3 className="text-lg font-medium">{phase.name}</h3>
                <p className="text-sm text-gray-600">Duration: {phase.duration}</p>
                {phase.tasks && phase.tasks.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {phase.tasks.map((task, taskIndex) => (
                      <div key={taskIndex} className="flex items-center space-x-2">
                        <span className={`w-2 h-2 rounded-full
                          ${task.status === 'completed' ? 'bg-green-500' :
                            task.status === 'in-progress' ? 'bg-yellow-500' :
                            'bg-gray-500'}`}></span>
                        <span className="text-sm">{task.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div className="pt-4 border-t">
              <p className="text-sm font-medium">Total Duration: {migrationPlan.timeline.totalDuration}</p>
            </div>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Technology Stack</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Current Technologies</h3>
              <div className="flex flex-wrap gap-2">
                {migrationPlan.currentTechnologies.map((tech, index) => (
                  <span key={index} className="px-2 py-1 bg-gray-100 rounded-full text-sm">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2">Target Technologies</h3>
              <div className="flex flex-wrap gap-2">
                {migrationPlan.targetTechnologies.map((tech, index) => (
                  <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Risk Assessment */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Risk Assessment</h2>
          <div className="space-y-6">
            {[
              { title: 'Technical Risks', risks: migrationPlan.riskAssessment.technicalRisks },
              { title: 'Resource Risks', risks: migrationPlan.riskAssessment.resourceRisks },
              { title: 'Timeline Risks', risks: migrationPlan.riskAssessment.timelineRisks }
            ].map((section, index) => (
              <div key={index}>
                <h3 className="text-lg font-medium mb-2">{section.title}</h3>
                <div className="space-y-2">
                  {section.risks.map((risk, riskIndex) => (
                    <div key={riskIndex} className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm">{risk.description}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className={`text-xs px-2 py-1 rounded-full
                          ${risk.impact === 'high' ? 'bg-red-100 text-red-800' :
                            risk.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'}`}>
                          {risk.impact.toUpperCase()} Impact
                        </span>
                        <span className="text-xs text-gray-500">{risk.mitigation}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cost Estimates */}
        <div className="bg-white p-6 rounded-lg shadow-lg md:col-span-2">
          <h2 className="text-2xl font-semibold mb-4">Cost Estimates</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg font-medium mb-3">Development Costs</h3>
              <table className="min-w-full">
                <tbody>
                  <tr>
                    <td className="py-2">Development</td>
                    <td className="text-right">{migrationPlan.costEstimate.development.min.toLocaleString()} - {migrationPlan.costEstimate.development.max.toLocaleString()} {migrationPlan.costEstimate.currency}</td>
                  </tr>
                  <tr>
                    <td className="py-2">Infrastructure</td>
                    <td className="text-right">{migrationPlan.costEstimate.infrastructure.min.toLocaleString()} - {migrationPlan.costEstimate.infrastructure.max.toLocaleString()} {migrationPlan.costEstimate.currency}</td>
                  </tr>
                  <tr>
                    <td className="py-2">Training</td>
                    <td className="text-right">{migrationPlan.costEstimate.training.min.toLocaleString()} - {migrationPlan.costEstimate.training.max.toLocaleString()} {migrationPlan.costEstimate.currency}</td>
                  </tr>
                  <tr>
                    <td className="py-2">Contingency</td>
                    <td className="text-right">{migrationPlan.costEstimate.contingency.min.toLocaleString()} - {migrationPlan.costEstimate.contingency.max.toLocaleString()} {migrationPlan.costEstimate.currency}</td>
                  </tr>
                  <tr className="font-bold border-t">
                    <td className="py-2">Total</td>
                    <td className="text-right">{migrationPlan.costEstimate.total.min.toLocaleString()} - {migrationPlan.costEstimate.total.max.toLocaleString()} {migrationPlan.costEstimate.currency}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-3">Budget Utilization</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Allocated Budget</span>
                    <span>{migrationPlan.budget.allocated.toLocaleString()} {migrationPlan.budget.currency}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-green-600 h-2.5 rounded-full w-full"></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Spent</span>
                    <span>{migrationPlan.budget.spent.toLocaleString()} {migrationPlan.budget.currency}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full" 
                      style={{ width: `${(migrationPlan.budget.spent / migrationPlan.budget.allocated) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
