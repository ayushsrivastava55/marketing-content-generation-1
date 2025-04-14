'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface CompanyProfile {
  name: string
  industry: string
  size: string
  technologyStack: string[]
  teamExpertise: string[]
  businessChallenges: string[]
  innovationPriorities: string[]
  timeline: string
  budget: string
}

export default function ProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<CompanyProfile>({
    name: '',
    industry: '',
    size: '',
    technologyStack: [],
    teamExpertise: [],
    businessChallenges: [],
    innovationPriorities: [],
    timeline: '',
    budget: ''
  })
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  
  // Form input states
  const [techInput, setTechInput] = useState('')
  const [expertiseInput, setExpertiseInput] = useState('')
  const [challengeInput, setChallengeInput] = useState('')
  const [priorityInput, setPriorityInput] = useState('')

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/profile')
        if (res.ok) {
          const data = await res.json()
          if (data && data.id) {
            setProfile({
              name: data.name || '',
              industry: data.industry || '',
              size: data.size || '',
              technologyStack: data.technologyStack ? JSON.parse(data.technologyStack) : [],
              teamExpertise: data.teamExpertise ? JSON.parse(data.teamExpertise) : [],
              businessChallenges: data.businessChallenges ? JSON.parse(data.businessChallenges) : [],
              innovationPriorities: data.innovationPriorities ? JSON.parse(data.innovationPriorities) : [],
              timeline: data.implementationTimeline || '',
              budget: data.budgetRange || ''
            })
          }
        }
      } catch (err) {
        console.error('Failed to load profile:', err)
      } finally {
        setLoading(false)
      }
    }
    
    fetchProfile()
  }, [])

  // Handle adding items to arrays
  const handleAddItem = (field: keyof CompanyProfile, value: string, setter: React.Dispatch<React.SetStateAction<string>>) => {
    if (!value.trim()) return
    
    setProfile(prev => ({
      ...prev,
      [field]: [...prev[field as keyof Pick<CompanyProfile, 'technologyStack' | 'teamExpertise' | 'businessChallenges' | 'innovationPriorities'>], value.trim()]
    }))
    
    setter('')
  }

  // Handle removing items from arrays
  const handleRemoveItem = (field: keyof CompanyProfile, index: number) => {
    setProfile(prev => ({
      ...prev,
      [field]: (prev[field as keyof Pick<CompanyProfile, 'technologyStack' | 'teamExpertise' | 'businessChallenges' | 'innovationPriorities'>] as string[]).filter((_, i) => i !== index)
    }))
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    
    try {
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: profile.name,
          industry: profile.industry,
          size: profile.size,
          technologyStack: profile.technologyStack,
          teamExpertise: profile.teamExpertise,
          businessChallenges: profile.businessChallenges,
          innovationPriorities: profile.innovationPriorities,
          implementationTimeline: profile.timeline,
          budgetRange: profile.budget
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to save profile')
      }
      
      // Navigate to migration page on success
      router.push('/migrate')
    } catch (err) {
      setError('Failed to save profile. Please try again.')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-8 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Company Profile</h1>
            <p className="mt-2 text-sm text-gray-600">
              Tell us about your organization to receive tailored technology migration recommendations
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            {/* Company Details */}
            <div className="space-y-4">
              <h2 className="text-lg font-medium text-gray-900">Company Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                  <input
                    type="text"
                    required
                    value={profile.name}
                    onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                  <select
                    required
                    value={profile.industry}
                    onChange={(e) => setProfile(prev => ({ ...prev, industry: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Industry</option>
                    <option value="Technology">Technology</option>
                    <option value="Finance">Finance</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Retail">Retail</option>
                    <option value="Manufacturing">Manufacturing</option>
                    <option value="Education">Education</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company Size</label>
                  <select
                    required
                    value={profile.size}
                    onChange={(e) => setProfile(prev => ({ ...prev, size: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Size</option>
                    <option value="Small (1-50 employees)">Small (1-50 employees)</option>
                    <option value="Medium (51-200 employees)">Medium (51-200 employees)</option>
                    <option value="Large (201-1000 employees)">Large (201-1000 employees)</option>
                    <option value="Enterprise (1000+ employees)">Enterprise (1000+ employees)</option>
                  </select>
                </div>
              </div>
            </div>
            
            {/* Technology Stack */}
            <div className="space-y-4">
              <h2 className="text-lg font-medium text-gray-900">Technology Stack</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Technologies</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={techInput}
                    onChange={(e) => setTechInput(e.target.value)}
                    className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., React, AWS, MySQL"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddItem('technologyStack', techInput, setTechInput)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Add
                  </button>
                </div>
                
                <div className="mt-2 flex flex-wrap gap-2">
                  {profile.technologyStack.map((tech, index) => (
                    <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {tech}
                      <button
                        type="button"
                        onClick={() => handleRemoveItem('technologyStack', index)}
                        className="ml-1.5 text-blue-500 hover:text-blue-700"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Team Expertise</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={expertiseInput}
                    onChange={(e) => setExpertiseInput(e.target.value)}
                    className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Frontend, DevOps, Machine Learning"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddItem('teamExpertise', expertiseInput, setExpertiseInput)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Add
                  </button>
                </div>
                
                <div className="mt-2 flex flex-wrap gap-2">
                  {profile.teamExpertise.map((expertise, index) => (
                    <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {expertise}
                      <button
                        type="button"
                        onClick={() => handleRemoveItem('teamExpertise', index)}
                        className="ml-1.5 text-green-500 hover:text-green-700"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Business Needs */}
            <div className="space-y-4">
              <h2 className="text-lg font-medium text-gray-900">Business Needs</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Business Challenges</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={challengeInput}
                    onChange={(e) => setChallengeInput(e.target.value)}
                    className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Scalability issues, Technical debt"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddItem('businessChallenges', challengeInput, setChallengeInput)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Add
                  </button>
                </div>
                
                <div className="mt-2 space-y-2">
                  {profile.businessChallenges.map((challenge, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded-md">
                      <span>{challenge}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem('businessChallenges', index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Innovation Priorities</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={priorityInput}
                    onChange={(e) => setPriorityInput(e.target.value)}
                    className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Cloud migration, AI integration"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddItem('innovationPriorities', priorityInput, setPriorityInput)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Add
                  </button>
                </div>
                
                <div className="mt-2 space-y-2">
                  {profile.innovationPriorities.map((priority, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded-md">
                      <span>{priority}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem('innovationPriorities', index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Implementation Details */}
            <div className="space-y-4">
              <h2 className="text-lg font-medium text-gray-900">Implementation Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Timeline</label>
                  <select
                    required
                    value={profile.timeline}
                    onChange={(e) => setProfile(prev => ({ ...prev, timeline: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Timeline</option>
                    <option value="3 months">3 months</option>
                    <option value="6 months">6 months</option>
                    <option value="1 year">1 year</option>
                    <option value="1-2 years">1-2 years</option>
                    <option value="2+ years">2+ years</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Budget Range</label>
                  <select
                    required
                    value={profile.budget}
                    onChange={(e) => setProfile(prev => ({ ...prev, budget: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Budget</option>
                    <option value="$500 - $5,000">$500 - $5,000</option>
                    <option value="$5,000 - $20,000">$5,000 - $20,000</option>
                    <option value="$20,000 - $50,000">$20,000 - $50,000</option>
                    <option value="$50,000 - $100,000">$50,000 - $100,000</option>
                    <option value="$100,000 - $500,000">$100,000 - $500,000</option>
                    <option value="Over $500,000">Over $500,000</option>
                  </select>
                </div>
              </div>
            </div>
            
            {/* Error message */}
            {error && (
              <div className="p-4 bg-red-50 text-red-700 rounded-md">
                {error}
              </div>
            )}
            
            {/* Submit button */}
            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </span>
                ) : (
                  'Save and Continue'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
