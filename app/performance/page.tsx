interface PerformanceMetrics {
  loadTime: number
  responseTime: number
  errorRate: number
  userSatisfaction: number
  resourceUtilization: {
    cpu: number
    memory: number
    storage: number
  }
} 