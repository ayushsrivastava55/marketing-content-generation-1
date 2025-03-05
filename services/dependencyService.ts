interface DependencyAnalysis {
  outdatedPackages: {
    name: string
    currentVersion: string
    latestVersion: string
    breakingChanges: boolean
  }[]
  vulnerabilities: {
    package: string
    severity: string
    description: string
    fix: string
  }[]
  compatibilityIssues: string[]
} 