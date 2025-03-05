'use client'

import { useState } from 'react'
import { ArrowRightIcon, CalendarIcon, UserGroupIcon, ChartBarIcon } from '@heroicons/react/24/outline'

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
  }
]

export default function ContentPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const filteredBlogs = selectedCategory === 'all' 
    ? SAMPLE_BLOGS 
    : SAMPLE_BLOGS.filter(blog => blog.category === selectedCategory)

  const categories = ['all', ...new Set(SAMPLE_BLOGS.map(blog => blog.category))]

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Technology Trend Analysis
          </h1>
          <p className="text-xl text-gray-600">
            Deep insights into emerging technologies and their enterprise impact
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex justify-center gap-4 mb-8">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full ${
                selectedCategory === category
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>

        {/* Blog Grid */}
        <div className="grid grid-cols-1 gap-12 mt-8">
          {filteredBlogs.map(blog => (
            <article
              key={blog.id}
              className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col md:flex-row"
            >
              {/* Image */}
              <div className="md:w-1/3">
                <div className="h-64 bg-gray-300">
                  {/* Add actual images in production */}
                </div>
              </div>

              {/* Content */}
              <div className="p-8 md:w-2/3">
                <div className="flex items-center gap-4 mb-4">
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

                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {blog.title}
                </h2>

                <p className="text-gray-600 mb-6">
                  {blog.summary}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-300 rounded-full">
                      {/* Add actual avatar in production */}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{blog.author.name}</div>
                      <div className="text-sm text-gray-500">{blog.author.role}</div>
                    </div>
                  </div>

                  <button className="flex items-center gap-2 text-primary hover:text-primary-dark">
                    Read More
                    <ArrowRightIcon className="w-4 h-4" />
                  </button>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-100">
                  <div className="flex items-center gap-6">
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
      </div>
    </div>
  )
}
