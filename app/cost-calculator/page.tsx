'use client'

import { useState } from 'react'

interface CostBreakdown {
  training: number
  infrastructure: number
  licenses: number
  maintenance: number
  totalCost: number
  estimatedSavings: number
  roi: number
}

export default function CostCalculatorPage() {
  const [costs, setCosts] = useState({
    teamSize: 10,
    trainingCostPerPerson: 2000,
    infrastructureCost: 50000,
    licenseCostPerUser: 100,
    maintenanceCost: 5000,
    currentOperationalCost: 200000
  })

  const calculateBreakdown = (): CostBreakdown => {
    const training = costs.teamSize * costs.trainingCostPerPerson
    const licenses = costs.teamSize * costs.licenseCostPerUser * 12 // Annual
    const total = training + costs.infrastructureCost + licenses + costs.maintenanceCost
    const savings = costs.currentOperationalCost - (total * 0.8) // Assuming 20% efficiency gain
    
    return {
      training,
      infrastructure: costs.infrastructureCost,
      licenses,
      maintenance: costs.maintenanceCost,
      totalCost: total,
      estimatedSavings: savings,
      roi: (savings / total) * 100
    }
  }

  const breakdown = calculateBreakdown()

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Migration Cost Calculator</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Input Form */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Cost Factors</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Team Size</label>
                <input
                  type="number"
                  value={costs.teamSize}
                  onChange={e => setCosts(prev => ({ ...prev, teamSize: Number(e.target.value) }))}
                  className="w-full p-2 border rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Training Cost per Person</label>
                <input
                  type="number"
                  value={costs.trainingCostPerPerson}
                  onChange={e => setCosts(prev => ({ ...prev, trainingCostPerPerson: Number(e.target.value) }))}
                  className="w-full p-2 border rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Infrastructure Cost</label>
                <input
                  type="number"
                  value={costs.infrastructureCost}
                  onChange={e => setCosts(prev => ({ ...prev, infrastructureCost: Number(e.target.value) }))}
                  className="w-full p-2 border rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">License Cost per User (Monthly)</label>
                <input
                  type="number"
                  value={costs.licenseCostPerUser}
                  onChange={e => setCosts(prev => ({ ...prev, licenseCostPerUser: Number(e.target.value) }))}
                  className="w-full p-2 border rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Annual Maintenance Cost</label>
                <input
                  type="number"
                  value={costs.maintenanceCost}
                  onChange={e => setCosts(prev => ({ ...prev, maintenanceCost: Number(e.target.value) }))}
                  className="w-full p-2 border rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Current Annual Operational Cost</label>
                <input
                  type="number"
                  value={costs.currentOperationalCost}
                  onChange={e => setCosts(prev => ({ ...prev, currentOperationalCost: Number(e.target.value) }))}
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Cost Breakdown</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Training</span>
                  <span>${breakdown.training.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Infrastructure</span>
                  <span>${breakdown.infrastructure.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Licenses (Annual)</span>
                  <span>${breakdown.licenses.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Maintenance</span>
                  <span>${breakdown.maintenance.toLocaleString()}</span>
                </div>
                <div className="border-t pt-2 font-medium flex justify-between">
                  <span>Total Cost</span>
                  <span>${breakdown.totalCost.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">ROI Analysis</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Estimated Annual Savings</span>
                  <span className="text-green-600">${breakdown.estimatedSavings.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Return on Investment</span>
                  <span className="text-blue-600">{breakdown.roi.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 