import { NextResponse } from 'next/server'
import { openaiService } from '@/services/openaiService'

export async function POST(request: Request) {
  try {
    const profile = await request.json()

    const prompt = `
      Based on this company profile, create a detailed technology migration plan:
      
      Company: ${profile.name}
      Industry: ${profile.industry}
      Size: ${profile.size}
      Current Technology Stack: ${profile.technologyStack.join(', ')}
      Team Expertise: ${profile.teamExpertise.join(', ')}
      Business Challenges: ${profile.businessChallenges.join(', ')}
      Innovation Priorities: ${profile.innovationPriorities.join(', ')}
      Implementation Timeline: ${profile.implementationTimeline}
      Budget Range: ${profile.budgetRange}
      
      Provide a comprehensive migration plan including:
      1. Recommended technology stack upgrades
      2. Implementation timeline and effort
      3. Benefits and risks
      4. Step-by-step migration process with resources
      5. Cost estimates
      6. Team impact analysis
      
      Return the response as a structured JSON object.
    `

    const response = await openaiService.generateMigrationPlan(prompt)
    return NextResponse.json(response)
  } catch (error) {
    console.error('Error in migration API:', error)
    return NextResponse.json(
      { error: 'Failed to generate migration plan' },
      { status: 500 }
    )
  }
} 