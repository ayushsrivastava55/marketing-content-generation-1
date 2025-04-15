import { NextResponse } from 'next/server'
import { openaiService } from '@/services/openaiService'

// Fallback trends data in case OpenAI fails
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
    ]
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
    ]
  }
]

export async function GET() {
  try {
    console.log('Starting trends fetch...');
    const trends = await openaiService.generateTrends();
    
    if (!trends || trends.length === 0) {
      console.log('No trends generated, using fallback data');
      return NextResponse.json({
        success: true,
        data: {
          trends: fallbackTrends,
          source: 'fallback'
        }
      });
    }

    console.log(`Successfully generated ${trends.length} new trends`);
    return NextResponse.json({
      success: true,
      data: {
        trends,
        source: 'openai',
        generated: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error in trends API:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
    }
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch trends',
      data: {
        trends: fallbackTrends,
        source: 'fallback',
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      }
    }, {
      status: 500
    });
  }
}
