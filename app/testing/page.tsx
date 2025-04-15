'use client'

import { useState } from 'react'

export default function TestingPage() {
  const [activeTab, setActiveTab] = useState<'unit' | 'integration' | 'e2e'>('unit')
  
  const testData = {
    unit: [
      { id: '1', name: 'API Response Format', status: 'passed', coverage: 98 },
      { id: '2', name: 'Data Validation', status: 'passed', coverage: 95 },
      { id: '3', name: 'Error Handling', status: 'failed', coverage: 82 }
    ],
    integration: [
      { id: '4', name: 'Authentication Flow', status: 'passed', coverage: 90 },
      { id: '5', name: 'Database Transactions', status: 'pending', coverage: 75 }
    ],
    e2e: [
      { id: '6', name: 'User Registration', status: 'passed', coverage: 88 },
      { id: '7', name: 'Content Generation', status: 'pending', coverage: 65 }
    ]
  }
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed': return 'bg-green-100 text-green-800'
      case 'failed': return 'bg-red-100 text-red-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }
  
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Test Suite</h1>
        
        {/* Tabs */}
        <div className="flex border-b mb-6">
          <button
            className={`px-4 py-2 ${activeTab === 'unit' ? 'border-b-2 border-primary text-primary' : 'text-gray-600'}`}
            onClick={() => setActiveTab('unit')}
          >
            Unit Tests
          </button>
          <button
            className={`px-4 py-2 ${activeTab === 'integration' ? 'border-b-2 border-primary text-primary' : 'text-gray-600'}`}
            onClick={() => setActiveTab('integration')}
          >
            Integration Tests
          </button>
          <button
            className={`px-4 py-2 ${activeTab === 'e2e' ? 'border-b-2 border-primary text-primary' : 'text-gray-600'}`}
            onClick={() => setActiveTab('e2e')}
          >
            E2E Tests
          </button>
        </div>
        
        {/* Test List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 bg-gray-50 border-b">
            <div className="grid grid-cols-12 gap-4 font-medium text-sm text-gray-600">
              <div className="col-span-5">Name</div>
              <div className="col-span-3">Status</div>
              <div className="col-span-4">Coverage</div>
            </div>
          </div>
          
          <div className="divide-y">
            {testData[activeTab].map(test => (
              <div key={test.id} className="p-4 hover:bg-gray-50">
                <div className="grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-5 font-medium">{test.name}</div>
                  <div className="col-span-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(test.status)}`}>
                      {test.status}
                    </span>
                  </div>
                  <div className="col-span-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            test.coverage > 90 ? 'bg-green-500' : 
                            test.coverage > 75 ? 'bg-blue-500' : 'bg-yellow-500'
                          }`}
                          style={{ width: `${test.coverage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-700">{test.coverage}%</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Summary */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="font-medium mb-2 text-gray-700">Total Tests</h3>
            <p className="text-3xl font-bold">
              {testData.unit.length + testData.integration.length + testData.e2e.length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="font-medium mb-2 text-gray-700">Passing Rate</h3>
            <p className="text-3xl font-bold text-green-600">71%</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="font-medium mb-2 text-gray-700">Average Coverage</h3>
            <p className="text-3xl font-bold text-blue-600">84%</p>
          </div>
        </div>
      </div>
    </div>
  )
} 