import { NextResponse } from 'next/server'
import { contentGenerator } from '@/services/contentGenerator'

export async function GET() {
  try {
    const trendContent = await contentGenerator.generateTrendContent()

    return new NextResponse(JSON.stringify({
      success: true,
      data: {
        trends: trendContent,
        timestamp: new Date().toISOString()
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error in trend content API:', error)
    return new NextResponse(JSON.stringify({
      success: false,
      error: 'Failed to generate trend content'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
