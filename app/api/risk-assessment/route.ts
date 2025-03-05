import { NextResponse } from 'next/server'
import { openaiService } from '@/services/openaiService'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    // Get company profile from database
    let profile = await prisma.companyProfile.findFirst()

    // If no profile exists, create a default one
    if (!profile) {
      profile = await prisma.companyProfile.create({
        data: {
          id: 'default',
          name: 'Default Company',
          industry: 'Technology',
          size: 'Medium',
          technologyStack: JSON.stringify(['Legacy Systems', 'On-premise Infrastructure']),
          teamExpertise: JSON.stringify(['Software Development', 'IT Operations']),
          businessChallenges: JSON.stringify(['Digital Transformation', 'Technical Debt']),
          innovationPriorities: JSON.stringify(['Cloud Migration', 'Process Automation']),
          implementationTimeline: '12 months',
          budgetRange: '$100,000 - $500,000',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })
    }

    // Parse JSON strings back to arrays
    const parsedProfile = {
      ...profile,
      technologyStack: JSON.parse(profile.technologyStack),
      teamExpertise: JSON.parse(profile.teamExpertise),
      businessChallenges: JSON.parse(profile.businessChallenges),
      innovationPriorities: JSON.parse(profile.innovationPriorities)
    }

    // Generate risk analysis using OpenAI
    const prompt = `
      Based on this company profile, analyze potential risks and provide mitigation strategies:
      
      Company Profile:
      - Industry: ${parsedProfile.industry}
      - Size: ${parsedProfile.size}
      - Current Technology Stack: ${parsedProfile.technologyStack.join(', ')}
      - Team Expertise: ${parsedProfile.teamExpertise.join(', ')}
      - Business Challenges: ${parsedProfile.businessChallenges.join(', ')}
      - Innovation Priorities: ${parsedProfile.innovationPriorities.join(', ')}
      - Implementation Timeline: ${parsedProfile.implementationTimeline}
      - Budget Range: ${parsedProfile.budgetRange}
      
      Provide a comprehensive risk analysis including:
      1. Technical risks
      2. Operational risks
      3. Security risks
      4. Business risks
      
      For each risk, include:
      - Severity level
      - Detailed description
      - Potential impact
      - Mitigation strategies
    `

    const riskAnalysis = await openaiService.generateRiskAnalysis(prompt)
    return NextResponse.json(riskAnalysis)

  } catch (error) {
    console.error('Risk assessment error:', error)
    return NextResponse.json(
      { error: 'Failed to generate risk analysis' },
      { status: 500 }
    )
  }
} 