import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import prisma from '@/lib/prisma'
import { generateTrends } from '@/lib/gemini'
import { auth } from '@/auth'

// Fallback trends data in case Gemini API fails
const fallbackTrends = [
  {
    technology: 'Large Language Models (LLMs)',
    description: 'Advanced AI models capable of understanding and generating human-like text.',
    popularity: 95,
    growthRate: 85,
    category: 'Artificial Intelligence',
    whyUseIt: [
      'Enhanced customer service through intelligent chatbots',
      'Automated content generation and summarization',
      'Improved search and information retrieval'
    ],
    sources: ['OpenAI', 'Google AI', 'Research Papers'],
    companyAdoptions: [
      {
        name: 'Microsoft',
        description: 'Integrated GPT models into development tools',
        useCase: 'Developer productivity and code assistance',
        impact: 'Reported 40% increase in developer productivity'
      }
    ],
    stackRecommendations: {
      current: ['Traditional NLP', 'Rule-based systems'],
      recommended: ['GPT-4', 'LangChain', 'Vector Databases'],
      benefits: [
        'Improved accuracy and understanding',
        'Reduced maintenance',
        'Faster development'
      ],
      migrationComplexity: 'Medium',
      estimatedTimeframe: '3-6 months'
    }
  },
  {
    technology: 'Edge Computing',
    description: 'Distributed computing paradigm that brings computation closer to data sources.',
    popularity: 80,
    growthRate: 75,
    category: 'Infrastructure',
    whyUseIt: [
      'Reduced latency for real-time applications',
      'Improved data privacy and security',
      'Bandwidth cost optimization'
    ],
    sources: ['AWS', 'Azure', 'Industry Reports'],
    companyAdoptions: [
      {
        name: 'Netflix',
        description: 'Deployed edge servers for content delivery',
        useCase: 'Video streaming optimization',
        impact: '30% reduction in buffering time'
      }
    ],
    stackRecommendations: {
      current: ['Traditional Cloud', 'Centralized Processing'],
      recommended: ['AWS Edge', 'CloudFront', 'Lambda@Edge'],
      benefits: [
        'Lower latency',
        'Reduced bandwidth costs',
        'Better user experience'
      ],
      migrationComplexity: 'High',
      estimatedTimeframe: '6-12 months'
    }
  }
]

export async function GET() {
  console.log('GET /api/trends - Starting request');
  try {
    const session = await getServerSession(auth)
    console.log('Session data:', {
      hasSession: !!session,
      hasUser: !!session?.user,
      email: session?.user?.email
    });

    let profile = null
    if (session?.user?.email) {
      console.log('Fetching profile for email:', session.user.email);
      profile = await prisma.companyProfile.findUnique({
        where: { userEmail: session.user.email }
      })
      console.log('Profile fetch result:', {
        found: !!profile,
        fields: profile ? Object.keys(profile) : null
      });
    }

    // Try to get trends from Gemini API
    console.log('Attempting to generate trends');
    let trends = await generateTrends()
    
    // If Gemini fails, use fallback data
    if (!trends || !Array.isArray(trends) || trends.length === 0) {
      console.log('Using fallback trends data');
      trends = fallbackTrends
    }

    // Ensure all trends have the required fields
    trends = trends.map(trend => ({
      ...trend,
      stackRecommendations: trend.stackRecommendations || {
        current: [],
        recommended: [],
        benefits: [],
        migrationComplexity: 'Medium',
        estimatedTimeframe: '3-6 months'
      }
    }))

    console.log('Sending response with trends:', {
      trendCount: trends.length,
      hasProfile: !!profile
    });

    return NextResponse.json({
      success: true,
      data: {
        trends,
        profile
      }
    })
  } catch (error) {
    console.error('Error in trends API:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack available');
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch trends'
      },
      { status: 500 }
    )
  }
}
