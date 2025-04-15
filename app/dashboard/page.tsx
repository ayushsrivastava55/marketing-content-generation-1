'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Chart
} from 'chart.js'

// Register Chart.js components
Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
)

interface DashboardMetrics {
  techAdoptionRate: number
  migrationProgress: number
  teamReadiness: number
  costSavings: number
  timeToMarket: number
}

export default function DashboardPage() {
  const router = useRouter()
  const [metrics] = useState<DashboardMetrics>({
    techAdoptionRate: 65,
    migrationProgress: 45,
    teamReadiness: 80,
    costSavings: 25000,
    timeToMarket: 70
  })

  // Navigation handlers
  const handleNavigation = (path: string) => {
    router.push(path)
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Migration Dashboard</h1>
        
        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium mb-2">Migration Progress</h3>
            <div className="relative pt-1">
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
                <div 
                  style={{ width: `${metrics.migrationProgress}%` }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                ></div>
              </div>
              <span className="text-xl font-bold">{metrics.migrationProgress}%</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium mb-2">Team Readiness</h3>
            <div className="relative pt-1">
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
                <div 
                  style={{ width: `${metrics.teamReadiness}%` }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"
                ></div>
              </div>
              <span className="text-xl font-bold">{metrics.teamReadiness}%</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium mb-2">Cost Savings</h3>
            <span className="text-xl font-bold">${metrics.costSavings.toLocaleString()}</span>
            <p className="text-sm text-gray-500">Projected annual savings</p>
          </div>
        </div>

        {/* Timeline and Milestones */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Upcoming Milestones</h3>
              <button 
                onClick={() => handleNavigation('/timeline')}
                className="text-sm text-blue-500 hover:text-blue-700"
              >
                View All
              </button>
            </div>
            <div className="space-y-4">
              {/* Milestone items */}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Risk Assessment</h3>
              <button 
                onClick={() => handleNavigation('/risk-assessment')}
                className="text-sm text-blue-500 hover:text-blue-700"
              >
                View Details
              </button>
            </div>
            <div className="space-y-4">
              {/* Risk items */}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button 
              onClick={() => handleNavigation('/profile')}
              className="p-4 text-center rounded border hover:bg-gray-50 transition-colors flex flex-col items-center gap-2"
            >
              <span className="font-medium">Update Profile</span>
              <span className="text-sm text-gray-500">Edit company details</span>
            </button>

            <button 
              onClick={() => handleNavigation('/timeline')}
              className="p-4 text-center rounded border hover:bg-gray-50 transition-colors flex flex-col items-center gap-2"
            >
              <span className="font-medium">View Timeline</span>
              <span className="text-sm text-gray-500">Track progress</span>
            </button>

            <button 
              onClick={() => handleNavigation('/team')}
              className="p-4 text-center rounded border hover:bg-gray-50 transition-colors flex flex-col items-center gap-2"
            >
              <span className="font-medium">Team Management</span>
              <span className="text-sm text-gray-500">Manage resources</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
