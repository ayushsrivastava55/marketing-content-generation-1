interface Documentation {
  architecture: {
    current: string
    target: string
    changes: string[]
  }
  apis: {
    endpoints: string[]
    changes: string[]
    versioning: string
  }
  deployment: {
    steps: string[]
    rollback: string[]
    monitoring: string[]
  }
} 