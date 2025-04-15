import { NextResponse } from 'next/server'
import { openaiService } from '@/services/openaiService'
import prisma from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const { trend, context, format, industry, requirements } = await request.json()

    // Optional: Get company profile for additional context
    const profile = await prisma.companyProfile.findFirst()
    
    const contentRequest = {
      trend,
      context,
      format: format || 'json',
      industry: industry || profile?.industry || 'Technology',
      requirements,
      companyContext: profile ? {
        size: profile.size,
        techStack: JSON.parse(profile.technologyStack),
        expertise: JSON.parse(profile.teamExpertise),
        challenges: JSON.parse(profile.businessChallenges)
      } : undefined
    }

    const content = await openaiService.generateContent(contentRequest)
    return NextResponse.json(content)

  } catch (error) {
    console.error('Content generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate content' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { trends } = body

    if (!trends || !Array.isArray(trends)) {
      return new NextResponse(JSON.stringify({ error: 'Trends array is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const analysis = await openaiService.analyzeTrends(trends)

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

export async function GET() {
  try {
    // Add GET request logic here
  } catch (error) {
    console.error('Error in GET API:', error)
    return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
