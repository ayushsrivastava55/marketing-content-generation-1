'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface MigrationPlan {
  currentStack: string[]
  recommendedStack: string[]
  timeline: string
  effort: string
  risks: string[]
  benefits: string[]
  steps: {
    phase: string
    duration: string
    tasks: string[]
    resources: string[]
  }[]
  costEstimate: {
    training: string
    tools: string
    infrastructure: string
    total: string
  }
  teamImpact: {
    requiredSkills: string[]
    trainingNeeds: string[]
    teamStructure: string
  }
}

interface CompanyProfile {
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

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export default function MigratePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<CompanyProfile | null>(null)
  const [migrationPlan, setMigrationPlan] = useState<MigrationPlan | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')
  const [chatOpen, setChatOpen] = useState(false)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  
  // Scroll to bottom of chat when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages, isTyping]);
  
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/profile')
        if (!res.ok) {
          // If no profile exists, redirect to profile page
          router.push('/profile')
          return
        }
        
        const data = await res.json()
        console.log('Profile data received:', data);
        if (data && data.id) {
          setProfile({
            name: data.name || '',
            industry: data.industry || '',
            size: data.size || '',
            technologyStack: Array.isArray(data.technologyStack) ? data.technologyStack : [],
            teamExpertise: Array.isArray(data.teamExpertise) ? data.teamExpertise : [],
            businessChallenges: Array.isArray(data.businessChallenges) ? data.businessChallenges : [],
            innovationPriorities: Array.isArray(data.innovationPriorities) ? data.innovationPriorities : [],
            implementationTimeline: data.implementationTimeline || '',
            budgetRange: data.budgetRange || ''
          })
        } else {
          // If profile not complete, redirect to profile page
          router.push('/profile')
        }
      } catch (err) {
        console.error('Failed to load profile:', err)
        setError('Failed to load company profile')
      } finally {
        setLoading(false)
      }
    }
    
    fetchProfile()
  }, [router])

  const generateMigrationPlan = async (profile: CompanyProfile) => {
    setGenerating(true)
    try {
      const response = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profile)
      })

      if (!response.ok) {
        throw new Error('Failed to generate migration plan')
      }

      const plan = await response.json()
      setMigrationPlan(plan)
    } catch (error) {
      console.error('Error generating migration plan:', error)
      setError('Failed to generate migration plan. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  const handleChatSubmit = async (message: string) => {
    if (!message.trim() || !profile || !migrationPlan) return
    
    setInputMessage('')
    const userMessage: ChatMessage = {
      role: 'user',
      content: message.trim()
    }
    
    setChatMessages(messages => [...messages, userMessage])
    setIsTyping(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profile,
          migrationPlan,
          message: userMessage.content
        })
      })

      if (!response.ok) {
        throw new Error('Failed to get chat response')
      }

      const data = await response.json()
      
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.reply
      }
      
      setChatMessages(messages => [...messages, assistantMessage])
    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please try again.'
      }
      setChatMessages(messages => [...messages, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }

  const handleQuickQuestion = async (question: string) => {
    if (!profile || !migrationPlan) return

    setIsTyping(true)
    setInputMessage(question)

    const userMessage: ChatMessage = {
      role: 'user',
      content: question
    }

    setChatMessages(prevMessages => [...prevMessages, userMessage])

    try {
      const response = await fetch('/api/quick-question', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          profile,
          migrationPlan,
          question
        })
      })

      if (!response.ok) {
        throw new Error('Failed to send quick question')
      }

      const data = await response.json()
      const botMessage: ChatMessage = {
        role: 'assistant',
        content: data.response
      }
      
      setChatMessages(prevMessages => [...prevMessages, botMessage])
    } catch (err) {
      console.error('Error in handleQuickQuestion:', err)
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'Sorry, there was an error processing your quick question. Please try again later.'
      }
      setChatMessages(prevMessages => [...prevMessages, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md">
          <h2 className="text-xl font-semibold text-red-600">Profile Required</h2>
          <p className="mt-2 text-gray-600">
            Please complete your company profile to generate a migration plan.
          </p>
          <button
            onClick={() => router.push('/profile')}
            className="mt-4 w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Create Profile
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Technology Migration Plan</h1>
        
        {/* Profile Summary */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Company Profile</h2>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Company Details</h3>
                <ul className="mt-2 space-y-1">
                  <li><span className="font-medium">Name:</span> {profile.name}</li>
                  <li><span className="font-medium">Industry:</span> {profile.industry}</li>
                  <li><span className="font-medium">Size:</span> {profile.size}</li>
                </ul>
                
                <h3 className="text-sm font-medium text-gray-500 mt-4">Implementation Details</h3>
                <ul className="mt-2 space-y-1">
                  <li><span className="font-medium">Timeline:</span> {profile.implementationTimeline}</li>
                  <li><span className="font-medium">Budget:</span> {profile.budgetRange}</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Current Technologies</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {profile.technologyStack.map((tech, index) => (
                    <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {tech}
                    </span>
                  ))}
                </div>
                
                <h3 className="text-sm font-medium text-gray-500 mt-4">Team Expertise</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {profile.teamExpertise.map((expertise, index) => (
                    <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {expertise}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="mt-6 border-t border-gray-200 pt-4 flex justify-end">
              <button
                onClick={() => router.push('/profile')}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Edit Profile
              </button>
            </div>
          </div>
        </div>
        
        {!migrationPlan ? (
          <div className="bg-white rounded-lg shadow-md overflow-hidden p-8 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Generate Your Migration Plan</h2>
            <p className="text-gray-600 mb-6">
              Based on your company profile, we&apos;ll generate a personalized technology migration plan to help you modernize your stack.
            </p>
            
            <button
              onClick={() => generateMigrationPlan(profile)}
              disabled={generating}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
            >
              {generating ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating Plan...
                </>
              ) : (
                'Generate Migration Plan'
              )}
            </button>
            
            {error && (
              <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-md">
                {error}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            {/* Executive Summary */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
                <h2 className="text-xl font-semibold text-gray-900">Executive Summary</h2>
              </div>
              
              <div className="p-6">
                <div className="flex items-center justify-center mb-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Migration Plan for {profile.name}</h3>
                    <p className="text-gray-600">Industry: {profile.industry} | Size: {profile.size}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-sm font-medium text-gray-500">Timeline</div>
                    <div className="mt-1 text-lg font-semibold text-blue-700">{migrationPlan.timeline}</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-sm font-medium text-gray-500">Budget Range</div>
                    <div className="mt-1 text-lg font-semibold text-green-700">{profile.budgetRange}</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="text-sm font-medium text-gray-500">Technologies</div>
                    <div className="mt-1 text-lg font-semibold text-purple-700">{migrationPlan.recommendedStack.length} New Solutions</div>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-base font-medium text-gray-900 mb-3">Key Recommendations</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Strategic Focus</h4>
                      <div className="flex items-start">
                        <svg className="flex-shrink-0 w-5 h-5 text-blue-500 mt-0.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <p className="text-gray-600">
                          Focus on migrating from {migrationPlan.currentStack[0]} to {migrationPlan.recommendedStack[0]} 
                          to address {profile.businessChallenges[0]} challenges.
                        </p>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Implementation Approach</h4>
                      <div className="flex items-start">
                        <svg className="flex-shrink-0 w-5 h-5 text-green-500 mt-0.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        <p className="text-gray-600">
                          Phased implementation approach with {migrationPlan.steps.length} key stages,
                          starting with {migrationPlan.steps[0].phase}.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end mt-6">
                  <button 
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    onClick={() => window.print()}
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    Print Report
                  </button>
                </div>
              </div>
            </div>
            
            {/* Migration Overview */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100">
                <h2 className="text-xl font-semibold text-gray-900">Migration Overview</h2>
              </div>
              
              <div className="p-6">
                {/* Visual progress indicator */}
                <div className="mb-8 relative">
                  <div className="w-full h-2 bg-gray-200 rounded-full">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: '0%' }}></div>
                  </div>
                  <div className="flex justify-between mt-2">
                    <div className="text-center">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white mx-auto">1</div>
                      <div className="text-xs mt-1">Planning</div>
                    </div>
                    <div className="text-center">
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-white mx-auto">2</div>
                      <div className="text-xs mt-1">Preparation</div>
                    </div>
                    <div className="text-center">
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-white mx-auto">3</div>
                      <div className="text-xs mt-1">Migration</div>
                    </div>
                    <div className="text-center">
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-white mx-auto">4</div>
                      <div className="text-xs mt-1">Validation</div>
                    </div>
                    <div className="text-center">
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-white mx-auto">5</div>
                      <div className="text-xs mt-1">Optimization</div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="border p-4 rounded-lg bg-gray-50">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Current Stack</h3>
                    <ul className="list-disc list-inside space-y-1">
                      {migrationPlan.currentStack.map((tech, index) => (
                        <li key={index} className="text-gray-600">{tech}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="border p-4 rounded-lg bg-green-50">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Recommended Stack</h3>
                    <ul className="list-disc list-inside space-y-1">
                      {migrationPlan.recommendedStack.map((tech, index) => (
                        <li key={index} className="text-green-600">{tech}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Timeline & Effort</h3>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-gray-700 font-medium">Timeline: {migrationPlan.timeline}</p>
                    </div>
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                      <p className="text-gray-700">Effort: {migrationPlan.effort}</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 pt-6 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="border p-4 rounded-lg bg-green-50">
                    <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Benefits
                    </h3>
                    <ul className="list-disc list-inside space-y-1">
                      {migrationPlan.benefits.map((benefit, index) => (
                        <li key={index} className="text-green-600">{benefit}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="border p-4 rounded-lg bg-red-50">
                    <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      Risks
                    </h3>
                    <ul className="list-disc list-inside space-y-1">
                      {migrationPlan.risks.map((risk, index) => (
                        <li key={index} className="text-red-600">{risk}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Implementation Plan */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-indigo-100">
                <h2 className="text-xl font-semibold text-gray-900">Implementation Plan</h2>
              </div>
              
              <div className="p-6">
                <div className="mb-6">
                  <h3 className="text-base font-medium text-gray-700 mb-3">Implementation Roadmap</h3>
                  <div className="overflow-x-auto">
                    <div className="min-w-[768px]">
                      <div className="h-2 bg-gray-200 rounded-full">
                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: '20%' }}></div>
                      </div>
                      <div className="flex justify-between mt-2">
                        {migrationPlan.steps.map((step, index) => (
                          <div key={index} className="text-center" style={{ width: `${100 / migrationPlan.steps.length}%` }}>
                            <div className={`w-8 h-8 ${index === 0 ? 'bg-indigo-500' : 'bg-gray-300'} rounded-full flex items-center justify-center text-white mx-auto`}>
                              {index + 1}
                            </div>
                            <div className="text-xs mt-1 font-medium">{step.phase}</div>
                            <div className="text-xs text-gray-500">{step.duration}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-8">
                  {migrationPlan.steps.map((step, index) => (
                    <div key={index} className="rounded-lg border border-gray-200 overflow-hidden">
                      <div className={`px-4 py-3 bg-gradient-to-r ${index === 0 ? 'from-indigo-500 to-indigo-600 text-white' : 'from-gray-100 to-gray-200 text-gray-800'} flex justify-between items-center`}>
                        <h3 className="font-medium">Phase {index + 1}: {step.phase}</h3>
                        <span className="text-sm bg-white bg-opacity-20 px-2 py-1 rounded-full">{step.duration}</span>
                      </div>
                      
                      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                            <svg className="w-5 h-5 text-indigo-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                            </svg>
                            Tasks
                          </h4>
                          <div className="bg-gray-50 p-3 rounded-lg h-full">
                            <ul className="space-y-2">
                              {step.tasks.map((task, taskIndex) => (
                                <li key={taskIndex} className="flex items-start">
                                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-100 text-indigo-500 flex items-center justify-center mr-2 mt-0.5 text-xs">
                                    {taskIndex + 1}
                                  </span>
                                  <span className="text-gray-700">{task}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                            <svg className="w-5 h-5 text-indigo-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                            Resources
                          </h4>
                          <div className="bg-indigo-50 p-3 rounded-lg h-full">
                            <ul className="space-y-2">
                              {step.resources.map((resource, resourceIndex) => (
                                <li key={resourceIndex} className="flex items-start">
                                  <svg className="w-4 h-4 text-indigo-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <span className="text-gray-700">{resource}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Cost & Team Impact */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-purple-100">
                <h2 className="text-xl font-semibold text-gray-900">Cost & Team Impact</h2>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-base font-medium text-gray-800 mb-4 flex items-center">
                      <svg className="w-5 h-5 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Cost Breakdown
                    </h3>
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                      {/* Simple cost visualization */}
                      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                        <div className="text-sm font-medium text-center text-gray-800">Estimated Total: {migrationPlan.costEstimate.total}</div>
                      </div>
                      
                      <div className="px-4 py-2">
                        <div className="flex justify-between items-center py-2">
                          <div className="text-sm text-gray-600">Training</div>
                          <div className="font-medium text-purple-700">{migrationPlan.costEstimate.training}</div>
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-purple-500 rounded-full" style={{ width: '35%' }}></div>
                        </div>
                      </div>
                      
                      <div className="px-4 py-2">
                        <div className="flex justify-between items-center py-2">
                          <div className="text-sm text-gray-600">Tools</div>
                          <div className="font-medium text-blue-700">{migrationPlan.costEstimate.tools}</div>
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: '25%' }}></div>
                        </div>
                      </div>
                      
                      <div className="px-4 py-2">
                        <div className="flex justify-between items-center py-2">
                          <div className="text-sm text-gray-600">Infrastructure</div>
                          <div className="font-medium text-green-700">{migrationPlan.costEstimate.infrastructure}</div>
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-green-500 rounded-full" style={{ width: '40%' }}></div>
                        </div>
                      </div>
                      
                      <div className="p-4 border-t border-gray-200 bg-gray-50">
                        <div className="text-sm text-gray-500">
                          <p className="font-medium text-gray-700">Cost-saving opportunities:</p>
                          <ul className="list-disc list-inside mt-1">
                            <li>Phased implementation reduces upfront costs</li>
                            <li>Training existing staff vs. new hires</li>
                            <li>Open source alternatives where applicable</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-base font-medium text-gray-800 mb-4 flex items-center">
                      <svg className="w-5 h-5 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Team Impact Analysis
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                        <div className="px-4 py-3 bg-purple-100 border-b border-gray-200">
                          <h4 className="font-medium text-gray-800">Required Skills</h4>
                        </div>
                        <div className="p-4">
                          <div className="flex flex-wrap gap-2">
                            {migrationPlan.teamImpact.requiredSkills.map((skill, index) => (
                              <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                        <div className="px-4 py-3 bg-blue-100 border-b border-gray-200">
                          <h4 className="font-medium text-gray-800">Training Needs</h4>
                        </div>
                        <div className="p-4">
                          <div className="space-y-2">
                            {migrationPlan.teamImpact.trainingNeeds.map((need, index) => (
                              <div key={index} className="flex items-start">
                                <svg className="w-5 h-5 text-blue-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                                <span className="text-gray-700">{need}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                        <div className="px-4 py-3 bg-green-100 border-b border-gray-200">
                          <h4 className="font-medium text-gray-800">Team Structure Recommendation</h4>
                        </div>
                        <div className="p-4">
                          <div className="flex items-start">
                            <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            <p className="text-gray-700">{migrationPlan.teamImpact.teamStructure}</p>
                          </div>
                          
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <p className="text-sm font-medium text-gray-700">Key organizational benefits:</p>
                            <ul className="list-disc list-inside mt-1 text-sm text-gray-600">
                              <li>Improved cross-team collaboration</li>
                              <li>Clear roles and responsibilities</li>
                              <li>Enhanced skill development pathways</li>
                              <li>Better resource allocation</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Chatbot Button - Fixed at bottom right */}
        {migrationPlan && (
          <>
            {/* FAQ Section */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden mt-8">
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-yellow-50 to-yellow-100">
                <h2 className="text-xl font-semibold text-gray-900">Frequently Asked Questions</h2>
              </div>
              
              <div className="p-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-base font-medium text-gray-900">How long will the migration take?</h3>
                    <p className="mt-2 text-gray-600">Based on your company profile and the complexity of the migration, we estimate it will take {migrationPlan.timeline}. This timeline can be adjusted based on your team&apos;s availability and priorities.</p>
                  </div>
                  
                  <div>
                    <h3 className="text-base font-medium text-gray-900">Will our operations be disrupted during migration?</h3>
                    <p className="mt-2 text-gray-600">Our phased approach minimizes disruption. We recommend implementing changes during low-traffic periods, and we include thorough testing in each phase to ensure continuity.</p>
                  </div>
                  
                  <div>
                    <h3 className="text-base font-medium text-gray-900">Do we need to hire new team members?</h3>
                    <p className="mt-2 text-gray-600">Not necessarily. Our plan includes training for your existing team members. However, depending on your timeline and available resources, you might consider bringing in specialists for specific phases.</p>
                  </div>
                  
                  <div>
                    <h3 className="text-base font-medium text-gray-900">What&apos;s the ROI for this migration?</h3>
                    <p className="mt-2 text-gray-600">Based on similar migrations, companies typically see ROI within 12-18 months through improved efficiency, reduced maintenance costs, and enhanced capabilities. The specific benefits for your company include: {migrationPlan.benefits[0]} and {migrationPlan.benefits[1]}.</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Success Stories / Case Studies */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden mt-8">
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-green-100">
                <h2 className="text-xl font-semibold text-gray-900">Success Stories</h2>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="border border-gray-200 rounded-lg p-5 relative">
                    <div className="absolute -top-4 -left-4 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">TechNova Solutions</h3>
                    <p className="text-gray-600 mb-3">A {profile.industry} company similar to yours that migrated from {migrationPlan.currentStack[0]} to {migrationPlan.recommendedStack[0]}.</p>
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-green-700 font-medium">30% performance improvement</div>
                      <div className="text-sm text-gray-500">Completed in 4 months</div>
                    </div>
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg p-5 relative">
                    <div className="absolute -top-4 -left-4 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Synergy Enterprises</h3>
                    <p className="text-gray-600 mb-3">Modernized their stack and addressed similar {profile.businessChallenges[0]} challenges as your company.</p>
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-green-700 font-medium">45% cost reduction</div>
                      <div className="text-sm text-gray-500">Completed in 6 months</div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-base font-medium text-gray-900 mb-3">Industry Trends</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-600">
                      Based on our analysis of over 200 similar migrations in the {profile.industry} industry, companies that implement the proposed stack have seen an average of 35% improvement in scalability and 28% reduction in maintenance costs.
                    </p>
                    <div className="mt-4 flex items-center">
                      <div className="flex-1">
                        <div className="text-xs font-medium text-gray-500 mb-1">Industry Adoption Rate</div>
                        <div className="h-2 bg-gray-200 rounded-full">
                          <div className="h-full bg-green-500 rounded-full" style={{ width: '67%' }}></div>
                        </div>
                        <div className="text-xs text-right mt-1">67%</div>
                      </div>
                      <div className="w-16"></div>
                      <div className="flex-1">
                        <div className="text-xs font-medium text-gray-500 mb-1">Reported Satisfaction</div>
                        <div className="h-2 bg-gray-200 rounded-full">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: '85%' }}></div>
                        </div>
                        <div className="text-xs text-right mt-1">85%</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Resources Section */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden mt-8">
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100">
                <h2 className="text-xl font-semibold text-gray-900">Additional Resources</h2>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="border border-gray-200 rounded-lg p-5 flex flex-col">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mb-4">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Migration Guide</h3>
                    <p className="text-gray-600 mb-4 flex-1">Comprehensive step-by-step documentation for your team.</p>
                    <button className="mt-auto inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download PDF
                    </button>
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg p-5 flex flex-col">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 mb-4">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Video Tutorials</h3>
                    <p className="text-gray-600 mb-4 flex-1">Watch training videos on implementing the recommended technologies.</p>
                    <button className="mt-auto inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Watch Series
                    </button>
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg p-5 flex flex-col">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-green-600 mb-4">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Migration Checklist</h3>
                    <p className="text-gray-600 mb-4 flex-1">Track your progress with our interactive migration checklist.</p>
                    <button className="mt-auto inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      View Checklist
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      
      {/* Chatbot Interface */}
      {migrationPlan && (
        <div className="fixed bottom-6 right-6 z-50">
          <div className="relative">
            {/* Chat Button */}
            <button 
              onClick={() => setChatOpen(prev => !prev)}
              className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {!chatOpen ? (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              ) : (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
            
            {/* Chat Window */}
            {chatOpen && (
              <div className="absolute bottom-20 right-0 w-96 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
                <div className="px-4 py-3 bg-blue-600 text-white flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-blue-600 mr-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <h3 className="font-medium">Migration Assistant</h3>
                  </div>
                  <button
                    onClick={() => setChatOpen(false)}
                    className="text-white hover:text-gray-200"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="h-80 overflow-y-auto p-4 space-y-4" ref={chatContainerRef}>
                  {/* Bot welcome message */}
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <div className="ml-3 bg-gray-100 rounded-lg py-2 px-3 max-w-[80%]">
                      <p className="text-sm text-gray-800">
                        Hi there! I&apos;m your migration assistant. How can I help you with your migration plan today?
                      </p>
                    </div>
                  </div>
                  
                  {/* Chat messages */}
                  {chatMessages.map((message: ChatMessage, index) => (
                    <div key={index} className={`flex items-start ${message.role === 'user' ? 'justify-end' : ''}`}>
                      {message.role === 'assistant' && (
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                        </div>
                      )}
                      <div 
                        className={`ml-3 ${
                          message.role === 'user' 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-100 text-gray-800'
                        } rounded-lg py-2 px-3 max-w-[80%]`}
                      >
                        <p className="text-sm">{message.content}</p>
                      </div>
                      {message.role === 'user' && (
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white ml-3">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {isTyping && (
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      </div>
                      <div className="ml-3 bg-gray-100 rounded-lg py-2 px-3">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="border-t border-gray-200 p-3">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleChatSubmit(inputMessage);
                        }
                      }}
                      placeholder="Ask about your migration plan..."
                      className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleChatSubmit(inputMessage);
                      }}
                      disabled={isTyping || !inputMessage.trim()}
                      className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </button>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button
                      onClick={() => handleQuickQuestion("What&apos;s the first step in the migration?")}
                      className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 px-2 py-1 rounded-full"
                    >
                      First step?
                    </button>
                    <button
                      onClick={() => handleQuickQuestion("What risks should I be aware of?")}
                      className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 px-2 py-1 rounded-full"
                    >
                      Risks?
                    </button>
                    <button
                      onClick={() => handleQuickQuestion("How can we reduce costs?")}
                      className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 px-2 py-1 rounded-full"
                    >
                      Cost reduction?
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
} 