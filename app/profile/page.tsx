'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface CompanyProfile {
  id?: string
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

const INITIAL_PROFILE: CompanyProfile = {
  name: '',
  industry: '',
  size: '',
  technologyStack: [],
  teamExpertise: [],
  businessChallenges: [],
  innovationPriorities: [],
  implementationTimeline: '',
  budgetRange: ''
}

const COMPANY_SIZES = [
  'Small (1-50 employees)',
  'Medium (51-200 employees)',
  'Large (201-1000 employees)',
  'Enterprise (1000+ employees)'
]

const INDUSTRIES = [
  'Technology',
  'Finance',
  'Healthcare',
  'Retail',
  'Manufacturing',
  'Education',
  'Other'
]

const TIMELINES = [
  '3 months',
  '6 months',
  '1 year',
  '1-2 years',
  '2+ years'
]

const BUDGET_RANGES = [
  'Under $50,000',
  '$50,000 - $200,000',
  '$200,000 - $500,000',
  '$500,000 - $1,000,000',
  'Over $1,000,000'
]

export default function ProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<CompanyProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newTech, setNewTech] = useState('')
  const [newExpertise, setNewExpertise] = useState('')
  const [newChallenge, setNewChallenge] = useState('')
  const [newPriority, setNewPriority] = useState('')

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/profile')
      const data = await response.json()

      if (response.ok) {
        // Parse JSON strings into arrays
        setProfile({
          ...data,
          technologyStack: data?.technologyStack ? JSON.parse(data.technologyStack) : [],
          teamExpertise: data?.teamExpertise ? JSON.parse(data.teamExpertise) : [],
          businessChallenges: data?.businessChallenges ? JSON.parse(data.businessChallenges) : [],
          innovationPriorities: data?.innovationPriorities ? JSON.parse(data.innovationPriorities) : []
        })
      } else {
        // If no profile exists, set default values
        setProfile({
          name: '',
          industry: '',
          size: '',
          technologyStack: [],
          teamExpertise: [],
          businessChallenges: [],
          innovationPriorities: [],
          implementationTimeline: '',
          budgetRange: ''
        })
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      // Set default values on error
      setProfile({
        name: '',
        industry: '',
        size: '',
        technologyStack: [],
        teamExpertise: [],
        businessChallenges: [],
        innovationPriorities: [],
        implementationTimeline: '',
        budgetRange: ''
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Validate required fields
      if (!profile?.name || !profile.industry || !profile.size) {
        setError('Please fill in all required fields')
        setLoading(false)
        return
      }

      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save profile')
      }

      // Success! Redirect to migration page
      router.push('/migrate')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile')
      console.error('Profile save error:', err)
    } finally {
      setLoading(false)
    }
  }

  const addItem = (field: keyof CompanyProfile, value: string, setter: (s: string) => void) => {
    if (!value.trim()) return
    setProfile(prev => ({
      ...prev,
      [field]: [...(prev[field] as string[]), value.trim()]
    }))
    setter('')
  }

  const removeItem = (field: keyof CompanyProfile, index: number) => {
    setProfile(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).filter((_, i) => i !== index)
    }))
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Company Profile</h1>

        {loading ? (
          <div>Loading...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Company Name</label>
                  <input
                    type="text"
                    value={profile?.name || ''}
                    onChange={e => setProfile(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Industry</label>
                  <select
                    value={profile?.industry || ''}
                    onChange={e => setProfile(prev => ({ ...prev, industry: e.target.value }))}
                    className="w-full p-2 border rounded"
                    required
                  >
                    <option value="">Select Industry</option>
                    {INDUSTRIES.map(industry => (
                      <option key={industry} value={industry}>{industry}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Company Size</label>
                  <select
                    value={profile?.size || ''}
                    onChange={e => setProfile(prev => ({ ...prev, size: e.target.value }))}
                    className="w-full p-2 border rounded"
                    required
                  >
                    <option value="">Select Size</option>
                    {COMPANY_SIZES.map(size => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Technology Stack */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Technology Stack</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newTech}
                      onChange={e => setNewTech(e.target.value)}
                      className="flex-1 p-2 border rounded"
                      placeholder="Add technology"
                    />
                    <button
                      type="button"
                      onClick={() => addItem('technologyStack', newTech, setNewTech)}
                      className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
                    >
                      Add
                    </button>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {profile?.technologyStack?.map((tech, i) => (
                      <span
                        key={i}
                        className="bg-gray-100 px-2 py-1 rounded-full text-sm flex items-center gap-2"
                      >
                        {tech}
                        <button
                          type="button"
                          onClick={() => removeItem('technologyStack', i)}
                          className="text-red-500 hover:text-red-700"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Team Expertise</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newExpertise}
                      onChange={e => setNewExpertise(e.target.value)}
                      className="flex-1 p-2 border rounded"
                      placeholder="Add expertise"
                    />
                    <button
                      type="button"
                      onClick={() => addItem('teamExpertise', newExpertise, setNewExpertise)}
                      className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
                    >
                      Add
                    </button>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {profile?.teamExpertise?.map((expertise, i) => (
                      <span
                        key={i}
                        className="bg-gray-100 px-2 py-1 rounded-full text-sm flex items-center gap-2"
                      >
                        {expertise}
                        <button
                          type="button"
                          onClick={() => removeItem('teamExpertise', i)}
                          className="text-red-500 hover:text-red-700"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Business Challenges and Innovation Priorities */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1">Business Challenges</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newChallenge}
                    onChange={e => setNewChallenge(e.target.value)}
                    className="flex-1 p-2 border rounded"
                    placeholder="Add challenge"
                  />
                  <button
                    type="button"
                    onClick={() => addItem('businessChallenges', newChallenge, setNewChallenge)}
                    className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
                  >
                    Add
                  </button>
                </div>
                <div className="mt-2 space-y-2">
                  {profile?.businessChallenges?.map((challenge, i) => (
                    <div key={i} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <span>{challenge}</span>
                      <button
                        type="button"
                        onClick={() => removeItem('businessChallenges', i)}
                        className="text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Innovation Priorities</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newPriority}
                    onChange={e => setNewPriority(e.target.value)}
                    className="flex-1 p-2 border rounded"
                    placeholder="Add priority"
                  />
                  <button
                    type="button"
                    onClick={() => addItem('innovationPriorities', newPriority, setNewPriority)}
                    className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
                  >
                    Add
                  </button>
                </div>
                <div className="mt-2 space-y-2">
                  {profile?.innovationPriorities?.map((priority, i) => (
                    <div key={i} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <span>{priority}</span>
                      <button
                        type="button"
                        onClick={() => removeItem('innovationPriorities', i)}
                        className="text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Timeline and Budget */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1">Implementation Timeline</label>
                <select
                  value={profile?.implementationTimeline || ''}
                  onChange={e => setProfile(prev => ({ ...prev, implementationTimeline: e.target.value }))}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="">Select Timeline</option>
                  {TIMELINES.map(timeline => (
                    <option key={timeline} value={timeline}>{timeline}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Budget Range</label>
                <select
                  value={profile?.budgetRange || ''}
                  onChange={e => setProfile(prev => ({ ...prev, budgetRange: e.target.value }))}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="">Select Budget Range</option>
                  {BUDGET_RANGES.map(range => (
                    <option key={range} value={range}>{range}</option>
                  ))}
                </select>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 border rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`px-4 py-2 rounded ${
                  loading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-primary hover:bg-primary-dark'
                } text-white`}
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
        )}
      </div>
    </div>
  )
}
