'use client'

import { useState, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AlertCircle, Loader2 } from 'lucide-react'
import TrendVisualizations from '@/components/TrendVisualizations'
import ScrapedTrendCard from '@/components/ScrapedTrendCard'
import { TrendData } from '@/lib/types'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface UrlApiResponse {
  success: boolean;
  data?: { urls: string[] };
  error?: string;
}

interface SingleTrendApiResponse {
  success: boolean;
  data?: {
    trends: TrendData[];
    source: 'scrape' | 'scrape-url-failed' | 'scrape-url-timeout' | 'scrape-url-error';
  };
  error?: string;
}

interface OriginalTrendApiResponse {
    success: boolean;
    data?: {
        trends: TrendData[];
        source: 'openai' | 'fallback';
        generated?: string;
        errorMessage?: string;
    };
    error?: string;
}

export default function TrendsPage() {
  const [trends, setTrends] = useState<TrendData[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dataSource, setDataSource] = useState<'openai' | 'scrape'>('openai');
  const [scrapeQuery, setScrapeQuery] = useState<string>('');
  const [apiSource, setApiSource] = useState<'openai' | 'scrape' | 'fallback' | 'scrape-empty' | 'scrape-url-failed' | 'scrape-url-timeout' | 'scrape-url-error' | null>(null);
  const [scrapeCount, setScrapeCount] = useState<string>('3');
  
  const [loadingStatusMessage, setLoadingStatusMessage] = useState<string | null>(null);
  const [urlsToProcess, setUrlsToProcess] = useState<string[]>([]);
  const [processedUrlCount, setProcessedUrlCount] = useState<number>(0);

  const fetchTrends = useCallback(async () => {
    setLoading(true)
    setError(null)
    setTrends([])
    setApiSource(null);
    setUrlsToProcess([]);
    setProcessedUrlCount(0);
    setLoadingStatusMessage(null);

    try {
      if (dataSource === 'openai') {
        setLoadingStatusMessage('Generating trends with AI...')
        const apiUrl = '/api/trends?source=openai';
        console.log(`Fetching trends from: ${apiUrl}`);
        const response = await fetch(apiUrl)
        const data: OriginalTrendApiResponse = await response.json()

        if (!data.success || !data.data) {
          throw new Error(data.error || data.data?.errorMessage || 'Failed to fetch trends')
        }
        setTrends(data.data.trends)
        setApiSource(data.data.source);

      } else if (dataSource === 'scrape') {
        if (!scrapeQuery) {
          setError('Please enter a query for scraping.');
          setLoading(false);
          return;
        }

        setLoadingStatusMessage(`Finding relevant blog URLs for "${scrapeQuery}"...`);
        const findUrl = `/api/trends?source=scrape&step=findUrls&query=${encodeURIComponent(scrapeQuery)}&count=${scrapeCount}`;
        console.log(`Finding URLs from: ${findUrl}`);
        const urlResponse = await fetch(findUrl);
        const urlData: UrlApiResponse = await urlResponse.json();

        if (!urlData.success || !urlData.data || urlData.data.urls.length === 0) {
          console.log('No URLs found or error finding URLs', urlData);
          setError('Could not find relevant blog URLs for your query.')
          setApiSource('scrape-empty')
          setLoading(false)
          setLoadingStatusMessage(null);
          return;
        }

        const foundUrls = urlData.data.urls;
        setUrlsToProcess(foundUrls);
        console.log(`Found ${foundUrls.length} URLs to process.`);

        setApiSource('scrape');
        let cumulativeTrends: TrendData[] = [];

        for (let i = 0; i < foundUrls.length; i++) {
          const currentUrl = foundUrls[i];
          const urlDisplay = currentUrl.length > 50 ? currentUrl.substring(0, 50) + '...' : currentUrl;
          setProcessedUrlCount(i + 1);
          setLoadingStatusMessage(`Processing URL ${i + 1} of ${foundUrls.length}: ${urlDisplay}`);
          
          const scrapeUrl = `/api/trends?source=scrape&step=scrapeAndParse&query=${encodeURIComponent(scrapeQuery)}&url=${encodeURIComponent(currentUrl)}`;
          console.log(`Scraping/Parsing from: ${scrapeUrl}`);
          
          try {
              const scrapeResponse = await fetch(scrapeUrl);
              const scrapeData: SingleTrendApiResponse = await scrapeResponse.json();

              if (scrapeData.success && scrapeData.data && scrapeData.data.trends.length > 0) {
                console.log(`Got ${scrapeData.data.trends.length} trends from ${currentUrl}`);
                cumulativeTrends = [...cumulativeTrends, ...scrapeData.data.trends];
                setTrends(cumulativeTrends); 
              } else {
                console.warn(`No trends extracted or error for URL ${currentUrl}. Source: ${scrapeData.data?.source}`, scrapeData.error);
              }
          } catch (singleUrlError) {
             console.error(`Failed to fetch or parse response for URL ${currentUrl}:`, singleUrlError);
          }
        }
        
        if (cumulativeTrends.length === 0) {
            setError('Found blog URLs, but could not extract any trends from them.')
        }

      }

    } catch (err) {
      console.error('Error in fetchTrends process:', err)
      setError(err instanceof Error ? err.message : 'Failed to load trends')
      setApiSource('fallback');
    } finally {
      setLoading(false)
      setLoadingStatusMessage(null);
    }
  }, [dataSource, scrapeQuery, scrapeCount])

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold">Latest Technology Trends</h1>

      <Card>
          <CardContent className="p-6 space-y-4">
              <Label className="text-lg font-semibold">Choose Data Source</Label>
              <RadioGroup 
                  defaultValue="openai" 
                  value={dataSource}
                  onValueChange={(value: 'openai' | 'scrape') => setDataSource(value)}
                  className="flex space-x-4"
              >
                  <div className="flex items-center space-x-2">
                      <RadioGroupItem value="openai" id="openai" />
                      <Label htmlFor="openai">Generate with AI</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                      <RadioGroupItem value="scrape" id="scrape" />
                      <Label htmlFor="scrape">Scrape from Blogs</Label>
                  </div>
              </RadioGroup>

              {dataSource === 'scrape' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                  <div className="space-y-2">
                      <Label htmlFor="scrapeQuery">Enter Topic to Scrape</Label>
                      <Input 
                          id="scrapeQuery"
                          value={scrapeQuery}
                          onChange={(e) => setScrapeQuery(e.target.value)}
                          placeholder="e.g., latest AI marketing tools"
                      />
                  </div>
                   <div className="space-y-2">
                      <Label htmlFor="scrapeCount">Max URLs to Scrape</Label>
                      <Select value={scrapeCount} onValueChange={setScrapeCount}>
                        <SelectTrigger id="scrapeCount" className="w-full md:w-[180px]">
                          <SelectValue placeholder="Select count" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1</SelectItem>
                          <SelectItem value="2">2</SelectItem>
                          <SelectItem value="3">3 (Default)</SelectItem>
                          <SelectItem value="4">4</SelectItem>
                          <SelectItem value="5">5</SelectItem>
                        </SelectContent>
                      </Select>
                  </div>
                </div>
              )}
              <Button onClick={fetchTrends} disabled={loading} className="mt-4">
                  {loading ? 'Fetching...' : 'Fetch Trends'}
              </Button>
          </CardContent>
      </Card>

      {loading && (
        <div className="flex flex-col items-center justify-center space-y-4 p-8 border rounded-lg shadow-sm bg-background">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-lg font-medium text-muted-foreground">
            {loadingStatusMessage || 'Loading...'}
          </p>
          {urlsToProcess.length > 0 && (
            <p className="text-sm text-muted-foreground">
              {`(${processedUrlCount} of ${urlsToProcess.length} URLs processed)`}
            </p>
          )}
        </div>
      )}

      {!loading && !apiSource && !error && (
        <p className="text-center text-muted-foreground">Select a data source and click `Fetch Trends` to begin.</p>
      )}

      {error && !loading && (
          <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
          </Alert>
      )}

      {!loading && apiSource && !error && (
          <div className="space-y-6">
              <p className="text-sm text-muted-foreground">
                Trends data sourced from: <span className="font-semibold">{apiSource.replace('-empty', '')}</span>
                {apiSource === 'scrape' && (
                  <span>{` (based on query: "`}{scrapeQuery}{`")`}</span>
                )}
                {apiSource === 'fallback' && ' (using fallback data due to error)'}
              </p>
              
              {trends.length > 0 && (apiSource === 'openai' || apiSource === 'fallback') && (
                <TrendVisualizations trends={trends} selectedIndustry="all" />
              )}

              {trends.length === 0 && apiSource !== 'fallback' && apiSource !== 'scrape-empty' && (
                  <p>No trends found or extracted for the selected source{dataSource === 'scrape' ? ` and query &quot;${scrapeQuery}&quot;` : ''}.</p>
              )}

              <div className="space-y-4">
                {trends.map((trend, index) => 
                  apiSource === 'scrape' ? (
                    <ScrapedTrendCard key={`scrape-${index}`} trend={trend} />
                  ) : (
                    <Card key={`${apiSource}-${index}`} className="w-full">
                        <CardContent className="p-6">
                            <div className="space-y-4">
                                <div>
                                <h2 className="text-2xl font-semibold mb-2">{trend.technology}</h2>
                                <p className="text-gray-600 dark:text-gray-300">{trend.description}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4 my-4">
                                <div>
                                    <p className="font-semibold">Popularity</p>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                                    <div 
                                        className="bg-blue-600 h-2.5 rounded-full" 
                                        style={{ width: `${trend.popularity}%` }}
                                    />
                                    </div>
                                </div>
                                <div>
                                    <p className="font-semibold">Growth Rate</p>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                                    <div 
                                        className="bg-green-600 h-2.5 rounded-full" 
                                        style={{ width: `${trend.growthRate}%` }}
                                    />
                                    </div>
                                </div>
                                </div>

                                {trend.whyUseIt && trend.whyUseIt.length > 0 && (
                                <div>
                                    <h3 className="text-xl font-semibold mb-2">Why Use It</h3>
                                    <ul className="list-disc list-inside space-y-1">
                                    {trend.whyUseIt.map((reason, idx) => (
                                        <li key={idx} className="text-gray-600 dark:text-gray-300">{reason}</li>
                                    ))}
                                    </ul>
                                </div>
                                )}

                                {trend.companyAdoptions && trend.companyAdoptions.length > 0 && (
                                <div>
                                    <h3 className="text-xl font-semibold mb-2">Company Adoptions</h3>
                                    <div className="space-y-3">
                                    {trend.companyAdoptions.map((adoption, idx) => (
                                        <div key={idx} className="border rounded-lg p-3">
                                        <p className="font-semibold">{adoption.name}</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-300">{adoption.description}</p>
                                        <p className="mt-2"><span className="font-medium">Use Case:</span> {adoption.useCase}</p>
                                        <p><span className="font-medium">Impact:</span> {adoption.impact}</p>
                                        </div>
                                    ))}
                                    </div>
                                </div>
                                )}

                                {trend.stackRecommendations && (
                                <div>
                                    <h3 className="text-xl font-semibold mb-2">Implementation Details</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="font-medium">Current Stack:</p>
                                        <ul className="list-disc list-inside">
                                        {trend.stackRecommendations.current.map((tech, idx) => (
                                            <li key={idx} className="text-gray-600 dark:text-gray-300">{tech}</li>
                                        ))}
                                        </ul>
                                    </div>
                                    <div>
                                        <p className="font-medium">Recommended Stack:</p>
                                        <ul className="list-disc list-inside">
                                        {trend.stackRecommendations.recommended.map((tech, idx) => (
                                            <li key={idx} className="text-gray-600 dark:text-gray-300">{tech}</li>
                                        ))}
                                        </ul>
                                    </div>
                                    </div>
                                    <div className="mt-3">
                                    <p><span className="font-medium">Migration Complexity:</span> {trend.stackRecommendations.migrationComplexity}</p>
                                    <p><span className="font-medium">Estimated Timeframe:</span> {trend.stackRecommendations.estimatedTimeframe}</p>
                                    </div>
                                    {trend.stackRecommendations.benefits.length > 0 && (
                                    <div className="mt-3">
                                        <p className="font-medium">Benefits:</p>
                                        <ul className="list-disc list-inside">
                                        {trend.stackRecommendations.benefits.map((benefit, idx) => (
                                            <li key={idx} className="text-gray-600 dark:text-gray-300">{benefit}</li>
                                        ))}
                                        </ul>
                                    </div>
                                    )}
                                </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                  )
                )}
              </div>
          </div>
      )}
    </div>
  )
}
