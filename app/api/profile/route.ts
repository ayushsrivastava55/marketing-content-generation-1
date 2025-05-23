import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// Interface to match Prisma's model
export interface CompanyProfile {
  id?: string
  name: string
  industry: string
  size: string
  technologyStack: string
  teamExpertise: string
  businessChallenges: string
  innovationPriorities: string
  implementationTimeline: string
  budgetRange: string
  createdAt?: Date
  updatedAt?: Date
}

// Type for JSON stringified array fields
type JsonArray = string

export async function GET() {
  try {
    const profile = await prisma.companyProfile.findFirst()
    
    if (!profile) {
      return NextResponse.json(null, { status: 404 })
    }

    // Parse the JSON strings into arrays for the frontend
    return NextResponse.json({
      id: profile.id,
      name: profile.name,
      industry: profile.industry,
      size: profile.size,
      technologyStack: JSON.parse(String(profile.technologyStack)),
      teamExpertise: JSON.parse(String(profile.teamExpertise)),
      businessChallenges: JSON.parse(String(profile.businessChallenges)),
      innovationPriorities: JSON.parse(String(profile.innovationPriorities)),
      implementationTimeline: profile.implementationTimeline,
      budgetRange: profile.budgetRange,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt
    })
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
    console.log('Received data:', data)
    
    // Add validation
    if (!data || Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: 'No profile data provided' },
        { status: 400 }
      )
    }
    
    try {
      // Create the data for Prisma with explicit string values
      const technologyStack = JSON.stringify(data.technologyStack || []);
      const teamExpertise = JSON.stringify(data.teamExpertise || []);
      const businessChallenges = JSON.stringify(data.businessChallenges || []);
      const innovationPriorities = JSON.stringify(data.innovationPriorities || []);
      
      // Use proper typing for the fields
      const profile = await prisma.companyProfile.upsert({
        where: {
          id: data.id || 'default'
        },
        update: {
          name: data.name,
          industry: data.industry,
          size: data.size,
          technologyStack: technologyStack as JsonArray,
          teamExpertise: teamExpertise as JsonArray,
          businessChallenges: businessChallenges as JsonArray,
          innovationPriorities: innovationPriorities as JsonArray,
          implementationTimeline: data.implementationTimeline,
          budgetRange: data.budgetRange,
          updatedAt: new Date()
        },
        create: {
          id: 'default',
          name: data.name,
          industry: data.industry,
          size: data.size,
          technologyStack: technologyStack as JsonArray,
          teamExpertise: teamExpertise as JsonArray,
          businessChallenges: businessChallenges as JsonArray,
          innovationPriorities: innovationPriorities as JsonArray,
          implementationTimeline: data.implementationTimeline,
          budgetRange: data.budgetRange,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })
      
      return NextResponse.json(profile)
    } catch (prismaError: unknown) {
      console.error('Prisma error:', prismaError)
      return NextResponse.json(
        { error: 'Database error', details: (prismaError as Error).message || 'Unknown database error' },
        { status: 500 }
      )
    }
  } catch (error: unknown) {
    console.error('Error saving profile:', error)
    return NextResponse.json(
      { error: 'Failed to save profile', details: (error as Error).message || 'Unknown error' },
      { status: 500 }
    )
  }
}
