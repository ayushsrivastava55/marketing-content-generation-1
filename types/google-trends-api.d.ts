declare module 'google-trends-api' {
  interface TrendOptions {
    keyword: string | string[];
    startTime?: Date;
    endTime?: Date;
    geo?: string;
    hl?: string;
    timezone?: number;
    category?: number;
    property?: string;
  }

  interface InterestOverTimeOptions extends TrendOptions {
    resolution?: string;
  }

  interface InterestByRegionOptions extends TrendOptions {
    resolution?: string;
  }

  interface RelatedQueriesOptions extends TrendOptions {}

  interface RelatedTopicsOptions extends TrendOptions {}

  interface RealTimeTrendsOptions {
    geo?: string;
    hl?: string;
    timezone?: number;
    category?: string;
  }

  function interestOverTime(options: InterestOverTimeOptions): Promise<string>;
  function interestByRegion(options: InterestByRegionOptions): Promise<string>;
  function relatedQueries(options: RelatedQueriesOptions): Promise<string>;
  function relatedTopics(options: RelatedTopicsOptions): Promise<string>;
  function dailyTrends(options: TrendOptions): Promise<string>;
  function realTimeTrends(options: RealTimeTrendsOptions): Promise<string>;

  export default {
    interestOverTime,
    interestByRegion,
    relatedQueries,
    relatedTopics,
    dailyTrends,
    realTimeTrends
  };
} 