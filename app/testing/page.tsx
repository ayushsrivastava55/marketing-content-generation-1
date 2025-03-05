interface TestCase {
  id: string
  name: string
  type: 'unit' | 'integration' | 'e2e'
  status: 'passed' | 'failed' | 'pending'
  coverage: number
  dependencies: string[]
} 