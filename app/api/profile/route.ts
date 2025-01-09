import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const profile = await prisma.companyProfile.findUnique({
      where: {
        userEmail: 'default@example.com' // Replace with a default email or remove this condition
      }
    })

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Parse JSON strings back to arrays
    return NextResponse.json({
      ...profile,
      technologyStack: JSON.parse(profile.technologyStack),
      targetMarket: JSON.parse(profile.targetMarket),
      geographicPresence: JSON.parse(profile.geographicPresence),
      serviceOfferings: JSON.parse(profile.serviceOfferings),
      businessChallenges: JSON.parse(profile.businessChallenges),
      innovationPriorities: JSON.parse(profile.innovationPriorities),
      complianceRequirements: JSON.parse(profile.complianceRequirements),
      teamExpertise: JSON.parse(profile.teamExpertise)
    })
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    
    // Convert arrays to JSON strings
    const profile = await prisma.companyProfile.upsert({
      where: {
        userEmail: 'default@example.com' // Replace with a default email or remove this condition
      },
      update: {
        ...data,
        technologyStack: JSON.stringify(data.technologyStack),
        targetMarket: JSON.stringify(data.targetMarket),
        geographicPresence: JSON.stringify(data.geographicPresence),
        serviceOfferings: JSON.stringify(data.serviceOfferings),
        businessChallenges: JSON.stringify(data.businessChallenges),
        innovationPriorities: JSON.stringify(data.innovationPriorities),
        complianceRequirements: JSON.stringify(data.complianceRequirements),
        teamExpertise: JSON.stringify(data.teamExpertise)
      },
      create: {
        userEmail: 'default@example.com', // Replace with a default email or remove this condition
        ...data,
        technologyStack: JSON.stringify(data.technologyStack),
        targetMarket: JSON.stringify(data.targetMarket),
        geographicPresence: JSON.stringify(data.geographicPresence),
        serviceOfferings: JSON.stringify(data.serviceOfferings),
        businessChallenges: JSON.stringify(data.businessChallenges),
        innovationPriorities: JSON.stringify(data.innovationPriorities),
        complianceRequirements: JSON.stringify(data.complianceRequirements),
        teamExpertise: JSON.stringify(data.teamExpertise)
      }
    })

    return NextResponse.json(profile)
  } catch (error) {
    console.error('Error saving profile:', error)
    return NextResponse.json(
      { error: 'Failed to save profile' },
      { status: 500 }
    )
  }
}
