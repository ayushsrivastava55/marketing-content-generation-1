import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import prisma from '@/lib/prisma'
import { auth } from '@/auth'
import { generateProjectAnalysis } from '@/lib/gemini'

interface ProjectAnalysis {
  techHealthScore: number;
  migrationProgress: {
    planned: number;
    inProgress: number;
    completed: number;
  };
  budgetUtilization: number;
  timelineAdherence: number;
  riskLevel: 'low' | 'medium' | 'high';
  recommendations: {
    technology: string;
    category: string;
    reasons: string[];
    benefitsScore: {
      performance: number;
      scalability: number;
      maintenance: number;
      costEfficiency: number;
    };
    migrationComplexity: string;
    estimatedCost: {
      min: number;
      max: number;
      currency: string;
    };
  }[];
  riskAnalysis: {
    technicalDebt: {
      score: number;
      issues: string[];
    };
    securityVulnerabilities: {
      score: number;
      issues: string[];
    };
    scalabilityIssues: {
      score: number;
      issues: string[];
    };
    resourceConstraints: {
      score: number;
      issues: string[];
    };
  };
  timeline: {
    phases: {
      name: string;
      duration: string;
      dependencies: string[];
      risks: string[];
    }[];
    totalDuration: string;
    criticalPath: string[];
  };
}

export async function GET() {
  console.log('GET /api/profile - Starting request');
  try {
    const session = await getServerSession(auth)
    console.log('Session data:', { 
      hasSession: !!session, 
      hasUser: !!session?.user, 
      email: session?.user?.email 
    });

    if (!session?.user?.email) {
      console.log('GET /api/profile - Unauthorized: No valid session');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('Fetching profile for email:', session.user.email);
    const profile = await prisma.companyProfile.findUnique({
      where: {
        userEmail: session.user.email
      }
    })
    console.log('Profile fetch result:', { 
      found: !!profile,
      fields: profile ? Object.keys(profile) : null
    });

    if (!profile) {
      console.log('GET /api/profile - Profile not found');
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Parse JSON strings back to arrays with null checks
    const parsedProfile = {
      ...profile,
      technologyStack: safeParseJSON(profile.technologyStack, []),
      targetMarket: safeParseJSON(profile.targetMarket, []),
      geographicPresence: safeParseJSON(profile.geographicPresence, []),
      serviceOfferings: safeParseJSON(profile.serviceOfferings, []),
      businessChallenges: safeParseJSON(profile.businessChallenges, []),
      innovationPriorities: safeParseJSON(profile.innovationPriorities, []),
      complianceRequirements: safeParseJSON(profile.complianceRequirements, []),
      teamExpertise: safeParseJSON(profile.teamExpertise, [])
    }

    // Generate project analysis using Gemini
    const projectAnalysis = await generateProjectAnalysis(parsedProfile)

    console.log('Parsed profile data with analysis:', {
      hasArrays: {
        technologyStack: !!parsedProfile.technologyStack?.length,
        targetMarket: !!parsedProfile.targetMarket?.length,
        businessChallenges: !!parsedProfile.businessChallenges?.length,
        innovationPriorities: !!parsedProfile.innovationPriorities?.length
      },
      hasAnalysis: !!projectAnalysis
    });

    return NextResponse.json({
      ...parsedProfile,
      analysis: projectAnalysis
    })
  } catch (error) {
    console.error('Error in GET /api/profile:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack available');
    return NextResponse.json(
      { error: 'Failed to fetch profile', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// Helper function to safely parse JSON
function safeParseJSON(jsonString: string | null, fallback: any = null) {
  if (!jsonString) {
    console.log('safeParseJSON: Empty input, using fallback');
    return fallback;
  }
  try {
    const parsed = JSON.parse(jsonString);
    console.log('safeParseJSON: Successfully parsed:', {
      input: jsonString.substring(0, 50) + '...',
      result: Array.isArray(parsed) ? `Array(${parsed.length})` : typeof parsed
    });
    return parsed;
  } catch (e) {
    console.error('safeParseJSON: Parse error:', e);
    return fallback;
  }
}

export async function POST(req: NextRequest) {
  console.log('POST /api/profile - Starting request');
  try {
    const session = await getServerSession(auth)
    console.log('Session data:', {
      hasSession: !!session,
      hasUser: !!session?.user,
      email: session?.user?.email
    });

    if (!session?.user?.email) {
      console.log('POST /api/profile - Unauthorized: No valid session');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await req.json().catch(() => null)
    
    if (!data || typeof data !== 'object') {
      console.error('Invalid request data:', data);
      return NextResponse.json(
        { error: 'Invalid request data', details: 'Request body must be a valid JSON object' },
        { status: 400 }
      )
    }

    console.log('Received profile data:', {
      fields: Object.keys(data),
      arrayLengths: {
        technologyStack: Array.isArray(data.technologyStack) ? data.technologyStack.length : 0,
        targetMarket: Array.isArray(data.targetMarket) ? data.targetMarket.length : 0,
        businessChallenges: Array.isArray(data.businessChallenges) ? data.businessChallenges.length : 0
      }
    });

    // Ensure arrays are properly handled and stringified
    const profile = {
      name: data.name || '',
      size: data.size || '',
      industry: data.industry || '',
      userEmail: session.user.email,
      technologyStack: Array.isArray(data.technologyStack) ? JSON.stringify(data.technologyStack) : '[]',
      targetMarket: Array.isArray(data.targetMarket) ? JSON.stringify(data.targetMarket) : '[]',
      geographicPresence: Array.isArray(data.geographicPresence) ? JSON.stringify(data.geographicPresence) : '[]',
      serviceOfferings: Array.isArray(data.serviceOfferings) ? JSON.stringify(data.serviceOfferings) : '[]',
      businessChallenges: Array.isArray(data.businessChallenges) ? JSON.stringify(data.businessChallenges) : '[]',
      innovationPriorities: Array.isArray(data.innovationPriorities) ? JSON.stringify(data.innovationPriorities) : '[]',
      complianceRequirements: Array.isArray(data.complianceRequirements) ? JSON.stringify(data.complianceRequirements) : '[]',
      teamExpertise: Array.isArray(data.teamExpertise) ? JSON.stringify(data.teamExpertise) : '[]',
      budgetRange: data.budgetRange || '',
      implementationTimeline: data.implementationTimeline || ''
    }

    console.log('Saving profile with data:', {
      email: profile.userEmail,
      hasArrays: {
        technologyStack: !!profile.technologyStack,
        targetMarket: !!profile.targetMarket,
        businessChallenges: !!profile.businessChallenges
      }
    });

    const result = await prisma.companyProfile.upsert({
      where: {
        userEmail: session.user.email
      },
      create: profile,
      update: profile
    })

    // Generate project analysis using Gemini after saving
    const parsedProfile = {
      ...result,
      technologyStack: safeParseJSON(result.technologyStack, []),
      targetMarket: safeParseJSON(result.targetMarket, []),
      geographicPresence: safeParseJSON(result.geographicPresence, []),
      serviceOfferings: safeParseJSON(result.serviceOfferings, []),
      businessChallenges: safeParseJSON(result.businessChallenges, []),
      innovationPriorities: safeParseJSON(result.innovationPriorities, []),
      complianceRequirements: safeParseJSON(result.complianceRequirements, []),
      teamExpertise: safeParseJSON(result.teamExpertise, [])
    }
    const projectAnalysis = await generateProjectAnalysis(parsedProfile)

    console.log('Profile saved successfully with analysis:', {
      id: result.id,
      email: result.userEmail,
      hasAnalysis: !!projectAnalysis
    });

    return NextResponse.json({
      ...result,
      analysis: projectAnalysis
    })
  } catch (error) {
    console.error('Error in POST /api/profile:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack available');
    return NextResponse.json(
      { error: 'Failed to save profile', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
