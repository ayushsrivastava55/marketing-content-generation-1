'use client'

import { useEffect, useState } from 'react'
import BlogPost from '@/components/BlogPost'
import { contentGenerator } from '@/services/contentGenerator'

interface TechnologyBlog {
  headline: string
  body: string
  cta: string
  category: string
  lastUpdated: string
  technology: {
    name: string
    version: string
    popularity: number
    growthRate: number
  }
  technicalDetails: {
    requirements: string[]
    integrations: string[]
    limitations: string[]
  }
  companyAdoptions: Array<{
    name: string
    useCase: string
    impact: string
  }>
}

export default function ContentPage() {
  const [blogs, setBlogs] = useState<TechnologyBlog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true)
        const blogPosts = await contentGenerator.generateTechnicalBlogContent()
        setBlogs(blogPosts)
        setError('')
      } catch (err) {
        setError('Failed to load blog content')
        console.error('Error fetching blogs:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchBlogs()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-600">{error}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Latest Technology Trends
          </h1>
          <p className="text-xl text-gray-600">
            Deep dives into cutting-edge technology innovations and their enterprise impact
          </p>
        </div>
        <div className="grid grid-cols-1 gap-8">
          {blogs.map((blog, index) => (
            <BlogPost key={index} {...blog} />
          ))}
        </div>
      </div>
    </div>
  )
}
