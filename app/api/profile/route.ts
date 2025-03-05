import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const profile = await prisma.companyProfile.findFirst()
    
    if (!profile) {
      return NextResponse.json(null, { status: 404 })
    }

    return NextResponse.json(profile)
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    
    // Convert arrays to JSON strings before saving
    const profile = await prisma.companyProfile.upsert({
      where: {
        id: data.id || 'default'
      },
      update: {
        ...data,
        technologyStack: JSON.stringify(data.technologyStack),
        teamExpertise: JSON.stringify(data.teamExpertise),
        businessChallenges: JSON.stringify(data.businessChallenges),
        innovationPriorities: JSON.stringify(data.innovationPriorities),
        updatedAt: new Date()
      },
      create: {
        id: 'default',
        ...data,
        technologyStack: JSON.stringify(data.technologyStack),
        teamExpertise: JSON.stringify(data.teamExpertise),
        businessChallenges: JSON.stringify(data.businessChallenges),
        innovationPriorities: JSON.stringify(data.innovationPriorities),
        createdAt: new Date(),
        updatedAt: new Date()
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
