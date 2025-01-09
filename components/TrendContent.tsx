'use client'

import { useState, useEffect } from 'react'

interface CompanyAdoption {
  name: string
  description: string
  useCase: string
  impact: string
}

interface TrendContent {
  technology: string
  description: string
  whyUseIt: string[]
  popularity: number
  growthRate: number
  category: string
  sources: string[]
  lastUpdated: string
  companyAdoptions: CompanyAdoption[]
  stackRecommendations: {
    current: string[]
    recommended: string[]
    benefits: string[]
    migrationComplexity: 'Low' | 'Medium' | 'High'
    estimatedTimeframe: string
  }
}

export default function TrendContent() {
  const [content, setContent] = useState<TrendContent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedTech, setSelectedTech] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [activeTab, setActiveTab] = useState<'overview' | 'companies' | 'stack'>('overview')

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/trend-content')
        if (!response.ok) {
          throw new Error('Failed to fetch trend content')
        }
        const data = await response.json()
        if (data.success && Array.isArray(data.data.trends)) {
          setContent(data.data.trends)
          if (data.data.trends.length > 0) {
            setSelectedTech(data.data.trends[0].technology)
          }
        }
      } catch (err) {
        setError('Failed to load trend content')
        console.error('Error fetching trend content:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchContent()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-red-500 text-center py-8">{error}</div>
    )
  }

  const categories = ['all', ...new Set(content.map(item => item.category))]
  const filteredContent = selectedCategory === 'all' 
    ? content 
    : content.filter(item => item.category === selectedCategory)
  const selectedContent = content.find(item => item.technology === selectedTech)

  const renderOverviewTab = () => (
    <div className="space-y-6">
      <div className="prose max-w-none">
        <p className="text-gray-600">{selectedContent?.description}</p>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-4">Why Use {selectedContent?.technology}?</h3>
        <div className="grid gap-4">
          {selectedContent?.whyUseIt.map((reason, index) => (
            <div 
              key={index}
              className="p-4 rounded-lg border border-gray-200 hover:border-primary transition-colors"
            >
              <div className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center mr-3">
                  {index + 1}
                </span>
                <span className="text-gray-700">{reason}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderCompaniesTab = () => (
    <div className="space-y-6">
      <div className="grid gap-6">
        {selectedContent?.companyAdoptions.map((company, index) => (
          <div key={index} className="bg-white rounded-lg border p-6 hover:border-primary transition-colors">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-lg font-semibold">{company.name}</h4>
                <p className="text-gray-600 mt-1">{company.description}</p>
              </div>
              <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                {company.impact}
              </div>
            </div>
            <div className="mt-4">
              <h5 className="font-medium text-gray-700">Use Case</h5>
              <p className="text-gray-600 mt-1">{company.useCase}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderStackTab = () => (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Current Stack</h3>
          <ul className="space-y-2">
            {selectedContent?.stackRecommendations.current.map((tech, index) => (
              <li key={index} className="flex items-center space-x-2 text-gray-600">
                <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                <span>{tech}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Recommended Stack</h3>
          <ul className="space-y-2">
            {selectedContent?.stackRecommendations.recommended.map((tech, index) => (
              <li key={index} className="flex items-center space-x-2 text-gray-600">
                <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                <span>{tech}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-6 mt-6">
        <h3 className="font-semibold text-lg mb-4">Migration Benefits</h3>
        <ul className="space-y-3">
          {selectedContent?.stackRecommendations.benefits.map((benefit, index) => (
            <li key={index} className="flex items-start">
              <span className="flex-shrink-0 text-green-500 mr-2">✓</span>
              <span>{benefit}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mt-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-sm text-gray-500">Migration Complexity</div>
          <div className="text-lg font-semibold mt-1">
            {selectedContent?.stackRecommendations.migrationComplexity}
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-sm text-gray-500">Estimated Timeframe</div>
          <div className="text-lg font-semibold mt-1">
            {selectedContent?.stackRecommendations.estimatedTimeframe}
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Category Filter */}
      <div className="p-4 border-b">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full md:w-auto px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      <div className="grid md:grid-cols-3 gap-6 p-6">
        {/* Sidebar with trending technologies */}
        <div className="md:col-span-1">
          <h3 className="text-lg font-semibold mb-4">Trending AI Technologies</h3>
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {filteredContent.map((item) => (
              <button
                key={item.technology}
                onClick={() => setSelectedTech(item.technology)}
                className={`w-full text-left p-4 rounded-lg transition-colors ${
                  selectedTech === item.technology
                    ? 'bg-primary text-white'
                    : 'hover:bg-gray-100'
                }`}
              >
                <div className="font-medium">{item.technology}</div>
                <div className="text-sm opacity-75 mt-1">
                  {item.category}
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span>Growth: {item.growthRate}%</span>
                  <span>Popularity: {item.popularity}%</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Main content area */}
        <div className="md:col-span-2">
          {selectedContent && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold">{selectedContent.technology}</h2>
                <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
                  <span>{selectedContent.category}</span>
                  <span>•</span>
                  <span>Source: {selectedContent.sources.join(', ')}</span>
                </div>
              </div>

              {/* Tabs */}
              <div className="border-b mb-6">
                <nav className="flex space-x-8">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`pb-4 px-1 ${
                      activeTab === 'overview'
                        ? 'border-b-2 border-primary text-primary'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Overview
                  </button>
                  <button
                    onClick={() => setActiveTab('companies')}
                    className={`pb-4 px-1 ${
                      activeTab === 'companies'
                        ? 'border-b-2 border-primary text-primary'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Companies Using It
                  </button>
                  <button
                    onClick={() => setActiveTab('stack')}
                    className={`pb-4 px-1 ${
                      activeTab === 'stack'
                        ? 'border-b-2 border-primary text-primary'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Tech Stack
                  </button>
                </nav>
              </div>

              {/* Tab Content */}
              {activeTab === 'overview' && renderOverviewTab()}
              {activeTab === 'companies' && renderCompaniesTab()}
              {activeTab === 'stack' && renderStackTab()}

              <div className="mt-6 pt-6 border-t text-sm text-gray-500 text-right">
                Last updated: {new Date(selectedContent.lastUpdated).toLocaleDateString()}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
