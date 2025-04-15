'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ArrowRightIcon, 
  CalendarIcon, 
  UserGroupIcon, 
  ChartBarIcon, 
  BookmarkIcon, 
  FunnelIcon,
  PlusIcon, 
  BookOpenIcon, 
  CheckIcon
} from '@heroicons/react/24/outline'

interface BlogPost {
  id: string
  title: string
  summary: string
  technology: string
  category: string
  readTime: string
  date: string
  adoption: number
  impact: 'High' | 'Medium' | 'Low'
  imageUrl: string
  author: {
    name: string
    role: string
    avatar: string
  }
  saved?: boolean
}

const SAMPLE_BLOGS: BlogPost[] = [
  {
    id: '1',
    title: 'The Rise of AI-Powered Development Tools',
    summary: 'Explore how artificial intelligence is revolutionizing software development with intelligent code completion, automated testing, and smart debugging tools.',
    technology: 'Artificial Intelligence',
    category: 'Development Tools',
    readTime: '8 min read',
    date: '2024-03-15',
    adoption: 78,
    impact: 'High',
    imageUrl: '/images/ai-dev.jpg',
    author: {
      name: 'Sarah Chen',
      role: 'AI Research Lead',
      avatar: '/avatars/sarah.jpg'
    }
  },
  {
    id: '2',
    title: 'Serverless Architecture: Beyond the Hype',
    summary: 'A deep dive into real-world serverless implementations, cost implications, and architectural considerations for enterprise applications.',
    technology: 'Cloud Computing',
    category: 'Architecture',
    readTime: '12 min read',
    date: '2024-03-10',
    adoption: 65,
    impact: 'High',
    imageUrl: '/images/serverless.jpg',
    author: {
      name: 'Michael Torres',
      role: 'Cloud Architect',
      avatar: '/avatars/michael.jpg'
    }
  },
  {
    id: '3',
    title: 'WebAssembly: The Future of Web Performance',
    summary: 'How WebAssembly is enabling high-performance applications in the browser and changing the landscape of web development.',
    technology: 'WebAssembly',
    category: 'Web Development',
    readTime: '10 min read',
    date: '2024-03-05',
    adoption: 45,
    impact: 'Medium',
    imageUrl: '/images/wasm.jpg',
    author: {
      name: 'Emma Wilson',
      role: 'Performance Engineer',
      avatar: '/avatars/emma.jpg'
    }
  },
  {
    id: '4',
    title: 'The Evolution of GraphQL in Enterprise APIs',
    summary: 'How GraphQL is transforming API development with flexible queries, strong typing, and improved developer experience.',
    technology: 'GraphQL',
    category: 'API Development',
    readTime: '9 min read',
    date: '2024-03-01',
    adoption: 52,
    impact: 'Medium',
    imageUrl: '/images/graphql.jpg',
    author: {
      name: 'David Kim',
      role: 'API Architect',
      avatar: '/avatars/david.jpg'
    }
  },
  {
    id: '5',
    title: 'Low-Code Development Platforms for Enterprise',
    summary: 'Evaluating the promise and limitations of low-code platforms for enterprise application development.',
    technology: 'Low-Code',
    category: 'Development Tools',
    readTime: '7 min read',
    date: '2024-02-20',
    adoption: 60,
    impact: 'Medium',
    imageUrl: '/images/low-code.jpg',
    author: {
      name: 'Jennifer Patel',
      role: 'Digital Transformation Lead',
      avatar: '/avatars/jennifer.jpg'
    }
  }
]

interface ContentForm {
  trend: string
  industry: string
  companySize: string
  technologyStack: string[]
  teamExpertise: string[]
  businessChallenges: string[]
  innovationPriorities: string[]
  implementationTimeline: string
  budgetRange: string
  contentType: 'white-paper' | 'case-study' | 'blog-post' | 'technical-guide'
  audienceLevel: 'beginner' | 'intermediate' | 'advanced'
  keyObjectives: string[]
}

const INITIAL_FORM: ContentForm = {
  trend: '',
  industry: 'Technology',
  companySize: 'Medium (51-200 employees)',
  technologyStack: [],
  teamExpertise: [],
  businessChallenges: [],
  innovationPriorities: [],
  implementationTimeline: '6 months',
  budgetRange: '',
  contentType: 'blog-post',
  audienceLevel: 'intermediate',
  keyObjectives: []
}

export default function ContentPage() {
  const router = useRouter()
  const [form, setForm] = useState<ContentForm>(INITIAL_FORM)
  const [loading, setLoading] = useState(false)
  const [previewContent, setPreviewContent] = useState<string | null>(null)
  const [newTech, setNewTech] = useState('')
  const [newExpertise, setNewExpertise] = useState('')
  const [newChallenge, setNewChallenge] = useState('')
  const [newPriority, setNewPriority] = useState('')
  const [newObjective, setNewObjective] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [blogs, setBlogs] = useState<BlogPost[]>(SAMPLE_BLOGS)
  const [sortBy, setSortBy] = useState<string>('date')
  const [showFilters, setShowFilters] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [minAdoption, setMinAdoption] = useState(0)
  const [impactFilter, setImpactFilter] = useState<string>('all')

  useEffect(() => {
    let filtered = SAMPLE_BLOGS
    
    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(blog => blog.category === selectedCategory)
    }
    
    // Apply adoption rate filter
    if (minAdoption > 0) {
      filtered = filtered.filter(blog => blog.adoption >= minAdoption)
    }
    
    // Apply impact filter
    if (impactFilter !== 'all') {
      filtered = filtered.filter(blog => blog.impact === impactFilter)
    }
    
    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.date).getTime() - new Date(a.date).getTime()
      } else if (sortBy === 'adoption') {
        return b.adoption - a.adoption
      } else if (sortBy === 'readTime') {
        return parseInt(a.readTime) - parseInt(b.readTime)
      }
      return 0
    })
    
    setBlogs(filtered)
  }, [selectedCategory, sortBy, minAdoption, impactFilter])

  const toggleSaved = (id: string) => {
    setBlogs(blogs.map(blog => 
      blog.id === id ? { ...blog, saved: !blog.saved } : blog
    ))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      // Generate a preview first
      const previewResponse = await fetch('/api/content/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      
      if (previewResponse.ok) {
        const data = await previewResponse.json()
        setPreviewContent(data.preview)
        setLoading(false)
        return
      }
      
      // If preview fails or is disabled, continue with full generation
      const response = await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      
      if (response.ok) {
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const addItem = (field: keyof ContentForm, value: string, setter: (s: string) => void) => {
    if (!value.trim()) return
    setForm(prev => ({
      ...prev,
      [field]: [...prev[field], value.trim()]
    }))
    setter('')
  }

  const removeItem = (field: keyof ContentForm, index: number) => {
    setForm(prev => {
      // Get the specific field as an array (we know these fields are arrays)
      const fieldArray = prev[field] as string[];
      
      return {
        ...prev,
        [field]: fieldArray.filter((_: string, i: number) => i !== index)
      }
    })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const categories = ['all', ...Array.from(new Set(SAMPLE_BLOGS.map(blog => blog.category)))]

  const confirmGeneration = async () => {
    setPreviewContent(null)
    setLoading(true)
    
    try {
      const response = await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      
      if (response.ok) {
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Technology Content Hub
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Deep insights into emerging technologies and their enterprise impact. 
            Explore our latest articles or generate custom content for your specific needs.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <button 
              onClick={() => setShowForm(!showForm)}
              className="px-6 py-3 bg-primary text-white rounded-lg shadow hover:bg-primary-dark flex items-center gap-2 transition-all"
            >
              <PlusIcon className="w-5 h-5" />
              {showForm ? 'Browse Content' : 'Generate Custom Content'}
            </button>
            {!showForm && (
              <>
                <button 
                  onClick={() => setShowFilters(!showFilters)}
                  className="px-6 py-3 bg-white text-gray-700 rounded-lg shadow hover:bg-gray-50 flex items-center gap-2 transition-all"
                >
                  <FunnelIcon className="w-5 h-5" />
                  Filter Options
                </button>
                <button 
                  onClick={() => router.push('/migrate')}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 flex items-center gap-2 transition-all"
                >
                  <ArrowRightIcon className="w-5 h-5" />
                  Migrate
                </button>
              </>
            )}
          </div>
        </div>

        {showForm ? (
          <div className="max-w-4xl mx-auto mt-8 bg-white rounded-xl shadow-lg p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Generate Custom Content</h2>
              <button 
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            {previewContent ? (
              <div className="space-y-6">
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold mb-4">Content Preview</h3>
                  <div className="prose max-w-none">
                    {previewContent.split('\n').map((paragraph, idx) => (
                      <p key={idx}>{paragraph}</p>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => setPreviewContent(null)}
                    className="px-4 py-2 border rounded hover:bg-gray-50"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={confirmGeneration}
                    disabled={loading}
                    className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark flex items-center gap-2"
                  >
                    {loading ? 'Generating...' : 'Confirm & Generate'}
                    <CheckIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Trend/Topic</label>
                    <input
                      type="text"
                      name="trend"
                      value={form.trend}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="E.g., Cloud Migration, AI Implementation"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Industry</label>
                    <select
                      name="industry"
                      value={form.industry}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="Technology">Technology</option>
                      <option value="Finance">Finance</option>
                      <option value="Healthcare">Healthcare</option>
                      <option value="Retail">Retail</option>
                      <option value="Manufacturing">Manufacturing</option>
                      <option value="Education">Education</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Content Type</label>
                    <select
                      name="contentType"
                      value={form.contentType}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="blog-post">Blog Post</option>
                      <option value="white-paper">White Paper</option>
                      <option value="case-study">Case Study</option>
                      <option value="technical-guide">Technical Guide</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Audience Expertise Level</label>
                    <select
                      name="audienceLevel"
                      value={form.audienceLevel}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                </div>
                
                {/* Technology Stack */}
                <div>
                  <label className="block text-sm font-medium mb-2">Technology Stack</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newTech}
                      onChange={e => setNewTech(e.target.value)}
                      className="flex-1 p-2 border rounded focus:ring-2 focus:ring-primary focus:border-transparent"
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
                    {form.technologyStack.map((tech, i) => (
                      <span key={i} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                        {tech}
                        <button
                          type="button"
                          onClick={() => removeItem('technologyStack', i)}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Team Expertise */}
                <div>
                  <label className="block text-sm font-medium mb-2">Team Expertise</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newExpertise}
                      onChange={e => setNewExpertise(e.target.value)}
                      className="flex-1 p-2 border rounded focus:ring-2 focus:ring-primary focus:border-transparent"
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
                    {form.teamExpertise.map((expertise, i) => (
                      <span key={i} className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                        {expertise}
                        <button
                          type="button"
                          onClick={() => removeItem('teamExpertise', i)}
                          className="text-green-500 hover:text-green-700"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Key Objectives */}
                <div>
                  <label className="block text-sm font-medium mb-2">Key Objectives</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newObjective}
                      onChange={e => setNewObjective(e.target.value)}
                      className="flex-1 p-2 border rounded focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Add objective"
                    />
                    <button
                      type="button"
                      onClick={() => addItem('keyObjectives', newObjective, setNewObjective)}
                      className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
                    >
                      Add
                    </button>
                  </div>
                  <div className="mt-2 space-y-2">
                    {form.keyObjectives.map((objective, i) => (
                      <div key={i} className="flex items-center justify-between bg-purple-50 text-purple-700 p-2 rounded">
                        {objective}
                        <button
                          type="button"
                          onClick={() => removeItem('keyObjectives', i)}
                          className="text-purple-500 hover:text-purple-700"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Business Challenges */}
                <div>
                  <label className="block text-sm font-medium mb-2">Business Challenges</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newChallenge}
                      onChange={e => setNewChallenge(e.target.value)}
                      className="flex-1 p-2 border rounded focus:ring-2 focus:ring-primary focus:border-transparent"
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
                    {form.businessChallenges.map((challenge, i) => (
                      <div key={i} className="flex items-center justify-between bg-red-50 text-red-700 p-2 rounded">
                        {challenge}
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

                {/* Innovation Priorities */}
                <div>
                  <label className="block text-sm font-medium mb-2">Innovation Priorities</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newPriority}
                      onChange={e => setNewPriority(e.target.value)}
                      className="flex-1 p-2 border rounded focus:ring-2 focus:ring-primary focus:border-transparent"
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
                    {form.innovationPriorities.map((priority, i) => (
                      <div key={i} className="flex items-center justify-between bg-amber-50 text-amber-700 p-2 rounded">
                        {priority}
                        <button
                          type="button"
                          onClick={() => removeItem('innovationPriorities', i)}
                          className="text-amber-500 hover:text-amber-700"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 border rounded hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark flex items-center gap-2"
                  >
                    {loading ? 'Generating...' : 'Preview Content'}
                    <BookOpenIcon className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : (
          <>
            {/* Filtering and Sorting Controls */}
            {showFilters && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <div className="flex flex-wrap justify-between items-center">
                  <h3 className="text-lg font-medium mb-4 md:mb-0">Advanced Filters</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full md:w-auto">
                    <div>
                      <label className="block text-sm font-medium mb-1">Sort By</label>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-full p-2 border rounded"
                      >
                        <option value="date">Most Recent</option>
                        <option value="adoption">Adoption Rate</option>
                        <option value="readTime">Read Time</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Min. Adoption Rate</label>
                      <select
                        value={minAdoption}
                        onChange={(e) => setMinAdoption(Number(e.target.value))}
                        className="w-full p-2 border rounded"
                      >
                        <option value="0">Any</option>
                        <option value="25">25%+</option>
                        <option value="50">50%+</option>
                        <option value="75">75%+</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Impact Level</label>
                      <select
                        value={impactFilter}
                        onChange={(e) => setImpactFilter(e.target.value)}
                        className="w-full p-2 border rounded"
                      >
                        <option value="all">All</option>
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Category Filter */}
            <div className="flex justify-center gap-4 mb-8 flex-wrap">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full ${
                    selectedCategory === category
                      ? 'bg-primary text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  } transition-colors shadow-sm`}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>

            {/* Results Count */}
            <div className="text-gray-600 mb-6 text-center">
              Showing {blogs.length} {blogs.length === 1 ? 'result' : 'results'}
              {selectedCategory !== 'all' && ` in "${selectedCategory}"`}
            </div>

            {/* Blog Grid */}
            <div className="grid grid-cols-1 gap-8 mt-8">
              {blogs.map(blog => (
                <article
                  key={blog.id}
                  className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col md:flex-row hover:shadow-xl transition-shadow"
                >
                  {/* Image */}
                  <div className="md:w-1/3 relative">
                    <div className="h-64 bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white">
                      <BookOpenIcon className="w-16 h-16 opacity-75" />
                    </div>
                    <div className="absolute top-4 right-4">
                      <button 
                        onClick={() => toggleSaved(blog.id)}
                        className={`p-2 rounded-full ${blog.saved ? 'bg-yellow-100 text-yellow-600' : 'bg-white text-gray-400 hover:text-gray-600'}`}
                        title={blog.saved ? "Saved" : "Save for later"}
                      >
                        <BookmarkIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-8 md:w-2/3">
                    <div className="flex items-center gap-3 mb-4 flex-wrap">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        {blog.technology}
                      </span>
                      <span className="flex items-center text-gray-500 text-sm">
                        <CalendarIcon className="w-4 h-4 mr-1" />
                        {new Date(blog.date).toLocaleDateString()}
                      </span>
                      <span className="flex items-center text-gray-500 text-sm">
                        <UserGroupIcon className="w-4 h-4 mr-1" />
                        {blog.adoption}% Adoption
                      </span>
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 mb-4 hover:text-primary transition-colors">
                      {blog.title}
                    </h2>

                    <p className="text-gray-600 mb-6">
                      {blog.summary}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full flex items-center justify-center text-gray-500">
                          {blog.author.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{blog.author.name}</div>
                          <div className="text-sm text-gray-500">{blog.author.role}</div>
                        </div>
                      </div>

                      <button className="flex items-center gap-2 text-primary hover:text-primary-dark transition-colors group">
                        Read More
                        <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>

                    <div className="mt-6 pt-6 border-t border-gray-100">
                      <div className="flex items-center gap-6 flex-wrap">
                        <div className="flex items-center gap-2">
                          <ChartBarIcon className="w-5 h-5 text-gray-400" />
                          <span className="text-sm text-gray-500">Impact: </span>
                          <span className={`text-sm font-medium ${
                            blog.impact === 'High' ? 'text-green-600' :
                            blog.impact === 'Medium' ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {blog.impact}
                          </span>
                        </div>
                        <span className="text-sm text-gray-500">{blog.readTime}</span>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
