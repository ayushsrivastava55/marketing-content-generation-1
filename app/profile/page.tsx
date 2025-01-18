'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

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

export default function CompanyProfile() {
  const { data: session } = useSession()
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

  useEffect(() => {
    const fetchProfile = async () => {
      if (!session?.user) return

      try {
        const response = await fetch('/api/profile')
        if (response.ok) {
          const data = await response.json()
          setProfile(data)
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
      }
    }

    fetchProfile()
  }, [session])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session?.user) {
      router.push('/auth/signin')
      return
    }

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
    const value = e.target.value;
    
    // Allow direct typing of commas and spaces
    setProfile(prev => ({
      ...prev,
      [field]: [value] // Store the entire input as a single item while typing
    }));

    // Only parse when there's a comma
    if (value.includes(',')) {
      try {
        // Match either quoted strings or unquoted strings between commas
        const matches = value.match(/("(?:[^"\\]|\\.)*"|[^,]+)(?:\s*,\s*|\s*$)/g) || [];
        
        const items = matches.map(item => {
          // Remove trailing comma and whitespace
          item = item.replace(/,\s*$/, '');
          // Remove surrounding quotes and trim
          item = item.replace(/^"(.*)"$/, '$1').trim();
          return item;
        }).filter(Boolean);

        setProfile(prev => ({
          ...prev,
          [field]: items
        }));
      } catch (error) {
        console.error('Error parsing input:', error);
      }
    }
  }

  const formatArrayForDisplay = (arr: string[]) => {
    if (!Array.isArray(arr)) return '';
    
    // If it's a single item being typed (no commas), return it as is
    if (arr.length === 1 && !arr[0].includes(',')) {
      return arr[0];
    }

    // Otherwise format the array
    return arr.map(item => {
      // Add quotes if the item contains a comma or spaces at the beginning/end
      if (item.includes(',') || /^[\s]|[\s]$/.test(item) || item.includes('"')) {
        // Escape any existing quotes and wrap in quotes
        return `"${item.replace(/"/g, '\\"')}"`;
      }
      return item;
    }).join(', ');
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-8">
          <h1 className="text-3xl font-bold text-primary mb-8">Company Profile</h1>
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h2 className="text-lg font-semibold text-blue-700 mb-2">Input Instructions</h2>
            <ul className="list-disc list-inside text-blue-600 space-y-1">
              <li>Type normally - spaces and commas are allowed</li>
              <li>Use commas to separate different items</li>
              <li>Items with commas will be automatically quoted</li>
              <li>Example: React, Node.js, "ASP.NET Core, MVC"</li>
            </ul>
          </div>
          
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
                  value={formatArrayForDisplay(profile.technologyStack)}
                  onChange={(e) => handleArrayChange(e, 'technologyStack')}
                  className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  rows={3}
                  placeholder='e.g. React, Node.js, "ASP.NET Core, MVC", MongoDB'
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
                  value={formatArrayForDisplay(profile.businessChallenges)}
                  onChange={(e) => handleArrayChange(e, 'businessChallenges')}
                  className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  rows={3}
                  placeholder='e.g. "Scalability, performance issues", Legacy system integration, Data security'
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
                  value={formatArrayForDisplay(profile.innovationPriorities)}
                  onChange={(e) => handleArrayChange(e, 'innovationPriorities')}
                  className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  rows={3}
                  placeholder='e.g. "AI, ML integration", Cloud migration, Process automation'
                />
              </div>

              <div>
                <label htmlFor="complianceRequirements" className="block text-sm font-medium text-gray-700">
                  Compliance Requirements (comma-separated)
                </label>
                <textarea
                  name="complianceRequirements"
                  id="complianceRequirements"
                  value={formatArrayForDisplay(profile.complianceRequirements)}
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
                  value={formatArrayForDisplay(profile.teamExpertise)}
                  onChange={(e) => handleArrayChange(e, 'teamExpertise')}
                  className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  rows={2}
                  placeholder='e.g. "JavaScript, TypeScript", Python, DevOps, "AWS, Azure"'
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
