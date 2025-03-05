import { NextResponse } from 'next/server'
import { openaiService } from '@/services/openaiService'

export async function POST(request: Request) {
  try {
    const profile = await request.json()

    const migrationPlan = await openaiService.generateMigrationPlan(profile)

    return NextResponse.json(migrationPlan)
  } catch (error) {
    console.error('Error in migration API:', error)
    return NextResponse.json(
      { error: 'Failed to generate migration plan' },
      { status: 500 }
    )
  }
} 