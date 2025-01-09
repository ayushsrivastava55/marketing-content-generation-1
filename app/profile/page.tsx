'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface CompanyProfile {
  name: string
  size: string
  industry: string
  technologyStack: string[]
  targetMarket: string[]
  geographicPresence: string[]
  serviceOfferings: string[]
  businessChallenges: string[]
  innovationPriorities: string[]
  budgetRange: string
  implementationTimeline: string
  complianceRequirements: string[]
  teamExpertise: string[]
}

const industries = [
  'Technology',
  'Financial Services',
  'Healthcare',
  'Manufacturing',
  'Retail',
  'Education',
  'Energy',
  'Transportation',
  'Media & Entertainment',
  'Professional Services'
]

const timelines = [
  'Immediate (0-3 months)',
  'Short-term (3-6 months)',
  'Medium-term (6-12 months)',
  'Long-term (12+ months)'
]

const budgetRanges = [
  'Under $10K',
  '$10K - $50K',
  '$50K - $100K',
  '$100K - $500K',
  '$500K - $1M',
  'Over $1M'
]

export default function ProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState<CompanyProfile>({
    name: '',
    size: '',
    industry: '',
    technologyStack: [],
    targetMarket: [],
    geographicPresence: [],
    serviceOfferings: [],
    businessChallenges: [],
    innovationPriorities: [],
    budgetRange: '',
    implementationTimeline: '',
    complianceRequirements: [],
    teamExpertise: []
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setLoading(true)
    try {
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profile),
      })

      if (!response.ok) {
        throw new Error('Failed to save company profile')
      }

      router.push('/dashboard')
    } catch (error) {
      console.error('Error saving company profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setProfile(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleArrayChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, field: keyof CompanyProfile) => {
    const values = e.target.value.split(',').map(item => item.trim()).filter(item => item)
    setProfile(prev => ({
      ...prev,
      [field]: values
    }))
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-8">
          <h1 className="text-3xl font-bold text-primary mb-8">Company Profile</h1>
          <p className="text-gray-600 mb-6">
            Help us understand your company better to provide personalized technology recommendations
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Company Name
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  required
                  value={profile.name}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label htmlFor="size" className="block text-sm font-medium text-gray-700">
                  Company Size
                </label>
                <select
                  name="size"
                  id="size"
                  required
                  value={profile.size}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="">Select size</option>
                  <option value="1-10">1-10 employees</option>
                  <option value="11-50">11-50 employees</option>
                  <option value="51-200">51-200 employees</option>
                  <option value="201-500">201-500 employees</option>
                  <option value="501-1000">501-1000 employees</option>
                  <option value="1000+">1000+ employees</option>
                </select>
              </div>

              <div>
                <label htmlFor="industry" className="block text-sm font-medium text-gray-700">
                  Industry
                </label>
                <select
                  name="industry"
                  id="industry"
                  required
                  value={profile.industry}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="">Select industry</option>
                  {industries.map(industry => (
                    <option key={industry} value={industry}>{industry}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="budgetRange" className="block text-sm font-medium text-gray-700">
                  Technology Budget Range
                </label>
                <select
                  name="budgetRange"
                  id="budgetRange"
                  required
                  value={profile.budgetRange}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="">Select budget range</option>
                  {budgetRanges.map(range => (
                    <option key={range} value={range}>{range}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="implementationTimeline" className="block text-sm font-medium text-gray-700">
                  Implementation Timeline
                </label>
                <select
                  name="implementationTimeline"
                  id="implementationTimeline"
                  required
                  value={profile.implementationTimeline}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="">Select timeline</option>
                  {timelines.map(timeline => (
                    <option key={timeline} value={timeline}>{timeline}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label htmlFor="technologyStack" className="block text-sm font-medium text-gray-700">
                  Current Technology Stack (comma-separated)
                </label>
                <textarea
                  name="technologyStack"
                  id="technologyStack"
                  required
                  value={profile.technologyStack.join(', ')}
                  onChange={(e) => handleArrayChange(e, 'technologyStack')}
                  className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  rows={3}
                  placeholder="e.g. React, Node.js, AWS, MongoDB"
                />
              </div>

              <div>
                <label htmlFor="businessChallenges" className="block text-sm font-medium text-gray-700">
                  Business Challenges (comma-separated)
                </label>
                <textarea
                  name="businessChallenges"
                  id="businessChallenges"
                  required
                  value={profile.businessChallenges.join(', ')}
                  onChange={(e) => handleArrayChange(e, 'businessChallenges')}
                  className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  rows={3}
                  placeholder="e.g. Scalability issues, Legacy system integration, Data security"
                />
              </div>

              <div>
                <label htmlFor="innovationPriorities" className="block text-sm font-medium text-gray-700">
                  Innovation Priorities (comma-separated)
                </label>
                <textarea
                  name="innovationPriorities"
                  id="innovationPriorities"
                  required
                  value={profile.innovationPriorities.join(', ')}
                  onChange={(e) => handleArrayChange(e, 'innovationPriorities')}
                  className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  rows={3}
                  placeholder="e.g. AI/ML integration, Cloud migration, Process automation"
                />
              </div>

              <div>
                <label htmlFor="complianceRequirements" className="block text-sm font-medium text-gray-700">
                  Compliance Requirements (comma-separated)
                </label>
                <textarea
                  name="complianceRequirements"
                  id="complianceRequirements"
                  value={profile.complianceRequirements.join(', ')}
                  onChange={(e) => handleArrayChange(e, 'complianceRequirements')}
                  className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  rows={2}
                  placeholder="e.g. GDPR, HIPAA, SOC 2, ISO 27001"
                />
              </div>

              <div>
                <label htmlFor="teamExpertise" className="block text-sm font-medium text-gray-700">
                  Team Expertise (comma-separated)
                </label>
                <textarea
                  name="teamExpertise"
                  id="teamExpertise"
                  required
                  value={profile.teamExpertise.join(', ')}
                  onChange={(e) => handleArrayChange(e, 'teamExpertise')}
                  className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  rows={2}
                  placeholder="e.g. JavaScript, Python, DevOps, Cloud Architecture"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
