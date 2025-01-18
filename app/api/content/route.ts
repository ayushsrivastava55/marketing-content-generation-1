import { NextResponse } from 'next/server'
import { geminiService } from '@/services/geminiService'
import { getServerSession } from 'next-auth'
import { auth } from '@/auth'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(auth)
    if (!session) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const body = await request.json()
    const { trend, context, industry, format } = body

    if (!trend) {
      return new NextResponse(JSON.stringify({ error: 'Trend is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const content = await geminiService.generateContent({
      trend,
      context,
      industry,
      format: format || 'summary'
    })

    return new NextResponse(JSON.stringify(content), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error in content generation API:', error)
    return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(auth)
    if (!session) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const body = await request.json()
    const { trends } = body

    if (!trends || !Array.isArray(trends)) {
      return new NextResponse(JSON.stringify({ error: 'Trends array is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const analysis = await geminiService.analyzeTrends(trends)

    return new NextResponse(JSON.stringify(analysis), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error in trend analysis API:', error)
    return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
