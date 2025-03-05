interface MigrationScript {
  type: 'database' | 'code' | 'config'
  language: string
  steps: string[]
  validation: string[]
  rollback: string[]
} 