import { NextResponse, NextRequest } from 'next/server'
import { openaiService } from '@/services/openaiService'
import { TrendData } from '@/lib/types'

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

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const source = searchParams.get('source')
  const query = searchParams.get('query')
  const step = searchParams.get('step') // New parameter for multi-step scraping
  const urlToProcess = searchParams.get('url') // New parameter for single URL processing
  const countParam = searchParams.get('count') // Get count parameter

  try {
    // --- Scrape Step 1: Find URLs --- 
    if (source === 'scrape' && step === 'findUrls' && query) {
      const count = parseInt(countParam || '3', 10); // Parse count, default to 3
      console.log(`Scrape Step 1: Finding URLs for query: ${query} (Count: ${count})...`)
      const blogUrls = await openaiService.findRelevantBlogs(query, count);
      console.log(`Found ${blogUrls?.length ?? 0} potential blog URLs.`);
      return NextResponse.json({ 
        success: true, 
        data: { urls: blogUrls || [] } 
      });
    }
    
    // --- Scrape Step 2: Scrape and Parse a Single URL --- 
    else if (source === 'scrape' && step === 'scrapeAndParse' && urlToProcess && query) {
      console.log(`Scrape Step 2: Processing URL: ${urlToProcess} for query: ${query}...`);
      let trendsForUrl: TrendData[] = [];
      try {
        // 2a. Scrape content using r.jina.ai
        console.log(`Scraping URL: ${urlToProcess}`);
        const scrapeResponse = await fetch(`https://r.jina.ai/${urlToProcess}`, {
          headers: { 'Accept': 'text/markdown' },
          // Add timeout to prevent hanging indefinitely
          signal: AbortSignal.timeout(20000) // 20 second timeout
        });

        if (!scrapeResponse.ok) {
          console.warn(`Failed to scrape ${urlToProcess}: ${scrapeResponse.statusText}`);
          // Return success=true but empty trends for this URL
          return NextResponse.json({ success: true, data: { trends: [], source: 'scrape-url-failed' } }); 
        }
        
        const markdownContent = await scrapeResponse.text();
        console.log(`Successfully scraped ${urlToProcess}. Content length: ${markdownContent.length}`);

        // 2b. Parse markdown content using AI
        const parsedTrends = await openaiService.parseMarkdownForTrends(markdownContent, query);
        if (parsedTrends && parsedTrends.length > 0) {
            console.log(`Successfully parsed ${parsedTrends.length} trends from ${urlToProcess}`);
            trendsForUrl = parsedTrends;
        }
      } catch (scrapeError: unknown) {
        console.error(`Error processing scraped URL ${urlToProcess}:`, scrapeError);
        // Specific handling for timeout (requires checking if scrapeError is an object with a name property)
        if (typeof scrapeError === 'object' && scrapeError !== null && 'name' in scrapeError && scrapeError.name === 'TimeoutError') {
          console.warn(`Timeout scraping URL: ${urlToProcess}`);
          return NextResponse.json({ success: true, data: { trends: [], source: 'scrape-url-timeout' } });
        } 
        // Return success=true but empty trends for other errors during processing this URL
        return NextResponse.json({ success: true, data: { trends: [], source: 'scrape-url-error' } }); 
      }

      // Return trends found for this specific URL
      return NextResponse.json({
        success: true,
        data: {
          trends: trendsForUrl,
          source: 'scrape' 
        }
      });
    }
    
    // --- Original OpenAI Trend Generation --- 
    else if (source === 'openai' || !source) { // Default to OpenAI
      console.log('Starting trends fetch via OpenAI...');
      const trends = await openaiService.generateTrends();
      
      if (!trends || trends.length === 0) {
        console.log('No trends generated by OpenAI, using fallback data');
        return NextResponse.json({
          success: true,
          data: {
            trends: fallbackTrends,
            source: 'fallback'
          }
        });
      }

      console.log(`Successfully generated ${trends.length} new trends via OpenAI`);
      return NextResponse.json({
        success: true,
        data: {
          trends,
          source: 'openai',
          generated: new Date().toISOString()
        }
      });
    }
    
    // --- Invalid Request --- 
    else {
      console.warn('Invalid request parameters received in trends API', { source, query, step, urlToProcess });
      return NextResponse.json({
        success: false,
        error: 'Invalid request parameters'
      }, { status: 400 });
    }

  } catch (error) {
    // General error handler (catches errors from service calls etc.)
    console.error('Error in trends API:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
    }
    
    // Return fallback data on any major error NOT related to specific URL processing
    return NextResponse.json({
      success: false,
      error: 'Failed to process request',
      data: {
        trends: fallbackTrends, // Return fallback on major errors
        source: 'fallback',
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      }
    }, {
      status: 500
    });
  }
}
