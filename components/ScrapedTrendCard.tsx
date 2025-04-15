'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { TrendData } from '@/lib/types' // Assuming TrendData type is defined here
import { ExternalLink, AlertTriangle, Users, TrendingUp } from 'lucide-react'
import { Separator } from "@/components/ui/separator"

interface ScrapedTrendCardProps {
  trend: TrendData
}

const ScrapedTrendCard: React.FC<ScrapedTrendCardProps> = ({ trend }) => {
  // Extract the original URL if available in sources
  const sourceUrl = trend.sources?.find(source => source.startsWith('http'))

  return (
    <Card className="w-full shadow-sm border border-border/40 hover:shadow-md transition-shadow duration-200 bg-card">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="text-lg font-semibold leading-snug">{trend.technology}</CardTitle>
          {sourceUrl && (
            <a 
              href={sourceUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              title={sourceUrl}
              className="text-xs text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center space-x-1 mt-1 flex-shrink-0"
            >
              <ExternalLink size={14} />
            </a>
          )}
        </div>
        <CardDescription className="pt-2 text-sm">{trend.description || "No description extracted."}</CardDescription>
      </CardHeader>
      <CardContent className="pt-0 space-y-4">
        {trend.whyUseIt && trend.whyUseIt.length > 0 && (
          <div>
            <Separator className="mb-3" />
            <h4 className="text-sm font-medium mb-2 text-muted-foreground">Key Points / Benefits:</h4>
            <ul className="list-disc list-inside space-y-1.5 text-sm text-foreground/90 pl-1">
              {trend.whyUseIt.map((reason, idx) => (
                <li key={idx}>{reason}</li>
              ))}
            </ul>
          </div>
        )}

        {trend.challenges && trend.challenges.length > 0 && (
          <div>
            <Separator className="mb-3" />
            <h4 className="text-sm font-medium mb-2 text-amber-600 dark:text-amber-500 flex items-center"><AlertTriangle size={14} className="mr-1.5"/>Challenges:</h4>
            <ul className="list-disc list-inside space-y-1.5 text-sm text-foreground/90 pl-1">
              {trend.challenges.map((challenge, idx) => (
                <li key={idx}>{challenge}</li>
              ))}
            </ul>
          </div>
        )}

        {trend.keyPlayers && trend.keyPlayers.length > 0 && (
          <div>
            <Separator className="mb-3" />
            <h4 className="text-sm font-medium mb-2 text-indigo-600 dark:text-indigo-400 flex items-center"><Users size={14} className="mr-1.5"/>Key Players / Tools:</h4>
            <div className="flex flex-wrap gap-2">
              {trend.keyPlayers.map((player, idx) => (
                <span key={idx} className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{player}</span>
              ))}
            </div>
          </div>
        )}
        
        {trend.futureOutlook && (
           <div>
            <Separator className="mb-3" />
            <h4 className="text-sm font-medium mb-2 text-green-600 dark:text-green-500 flex items-center"><TrendingUp size={14} className="mr-1.5"/>Future Outlook:</h4>
            <p className="text-sm text-foreground/90">{trend.futureOutlook}</p>
          </div>
        )}

      </CardContent>
    </Card>
  )
}

export default ScrapedTrendCard 