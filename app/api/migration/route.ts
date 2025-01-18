import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import prisma from '@/lib/prisma'
import { auth } from '@/auth'
import { generateProjectAnalysis } from '@/lib/gemini'

interface MigrationPlan {
  id: string;
  projectName: string;
  description: string;
  currentTechnologies: string[];
  targetTechnologies: string[];
  timeline: {
    phases: {
      name: string;
      duration: string;
      dependencies: string[];
      risks: string[];
      tasks: {
        name: string;
        description: string;
        status: 'pending' | 'in-progress' | 'completed';
        assignedTo: string;
      }[];
    }[];
    totalDuration: string;
    criticalPath: string[];
  };
  riskAssessment: {
    technicalRisks: {
      description: string;
      impact: 'low' | 'medium' | 'high';
      mitigation: string;
    }[];
    resourceRisks: {
      description: string;
      impact: 'low' | 'medium' | 'high';
      mitigation: string;
    }[];
    timelineRisks: {
      description: string;
      impact: 'low' | 'medium' | 'high';
      mitigation: string;
    }[];
  };
  costEstimate: {
    development: {
      min: number;
      max: number;
    };
    infrastructure: {
      min: number;
      max: number;
    };
    training: {
      min: number;
      max: number;
    };
    contingency: {
      min: number;
      max: number;
    };
    total: {
      min: number;
      max: number;
    };
    currency: string;
  };
  status: 'planning' | 'in-progress' | 'completed';
  progress: number;
  startDate: string;
  expectedEndDate: string;
  actualEndDate?: string;
  teamSize: number;
  budget: {
    allocated: number;
    spent: number;
    currency: string;
  };
}

export async function GET() {
  console.log('GET /api/migration - Starting request');
  try {
    const session = await getServerSession(auth)
    console.log('Session data:', {
      hasSession: !!session,
      hasUser: !!session?.user,
      email: session?.user?.email
    });

    if (!session?.user?.email) {
      console.log('GET /api/migration - Unauthorized: No valid session');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get company profile
    console.log('Fetching company profile for:', session.user.email);
    const profile = await prisma.companyProfile.findUnique({
      where: {
        userEmail: session.user.email
      }
    })

    if (!profile) {
      console.log('GET /api/migration - No profile found');
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    console.log('Found profile:', {
      id: profile.id,
      name: profile.name,
      hasStack: !!profile.technologyStack
    });

    // Parse profile data
    console.log('Parsing profile data...');
    const parsedProfile = {
      ...profile,
      technologyStack: JSON.parse(profile.technologyStack || '[]'),
      targetMarket: JSON.parse(profile.targetMarket || '[]'),
      businessChallenges: JSON.parse(profile.businessChallenges || '[]'),
      innovationPriorities: JSON.parse(profile.innovationPriorities || '[]')
    }
    console.log('Parsed profile data:', {
      stackSize: parsedProfile.technologyStack.length,
      marketSize: parsedProfile.targetMarket.length,
      challengesSize: parsedProfile.businessChallenges.length
    });

    // Get existing migration plan
    let existingPlan = null;
    try {
      console.log('Fetching existing migration plan...');
      existingPlan = await prisma.migrationPlan.findUnique({
        where: {
          userEmail: session.user.email
        }
      });
      console.log('Existing plan:', existingPlan ? {
        id: existingPlan.id,
        status: existingPlan.status,
        progress: existingPlan.progress
      } : 'None found');
    } catch (error) {
      console.error('Error fetching migration plan:', error);
      // Continue with null existingPlan
    }

    // Generate new analysis using Gemini
    let analysis = null;
    try {
      console.log('Generating project analysis...');
      analysis = await generateProjectAnalysis(parsedProfile);
      console.log('Analysis generated:', {
        hasAnalysis: !!analysis,
        timeline: analysis?.timeline ? {
          phaseCount: analysis.timeline.phases?.length,
          totalDuration: analysis.timeline.totalDuration
        } : 'No timeline',
        recommendations: analysis?.recommendations ? {
          count: analysis.recommendations.length,
          firstTech: analysis.recommendations[0]?.technology
        } : 'No recommendations'
      });
    } catch (error) {
      console.error('Error generating project analysis:', error);
      // Continue with null analysis
    }

    // Combine existing plan with new analysis
    console.log('Building migration plan...');
    const migrationPlan: MigrationPlan = {
      id: existingPlan?.id || 'new',
      projectName: existingPlan?.projectName || parsedProfile.name || 'Migration Project',
      description: existingPlan?.description || `Migration plan for ${parsedProfile.name || 'company'}`,
      currentTechnologies: parsedProfile.technologyStack || [],
      targetTechnologies: analysis?.recommendations?.map(rec => rec.technology) || [],
      timeline: {
        phases: analysis?.timeline?.phases?.map(phase => ({
          ...phase,
          tasks: phase.tasks || [{
            name: `Plan ${phase.name}`,
            description: `Initial planning for ${phase.name}`,
            status: 'pending',
            assignedTo: 'TBD'
          }]
        })) || [{
          name: 'Planning',
          duration: '1 month',
          dependencies: [],
          risks: [],
          tasks: [{
            name: 'Initial Assessment',
            description: 'Evaluate current system and requirements',
            status: 'pending',
            assignedTo: 'TBD'
          }]
        }],
        totalDuration: analysis?.timeline?.totalDuration || '1 month',
        criticalPath: analysis?.timeline?.criticalPath || []
      },
      riskAssessment: {
        technicalRisks: analysis?.riskAnalysis?.technicalDebt?.issues?.map(issue => ({
          description: issue,
          impact: 'medium',
          mitigation: 'To be determined'
        })) || [],
        resourceRisks: analysis?.riskAnalysis?.resourceConstraints?.issues?.map(issue => ({
          description: issue,
          impact: 'medium',
          mitigation: 'To be determined'
        })) || [],
        timelineRisks: []
      },
      costEstimate: {
        development: {
          min: analysis?.recommendations?.[0]?.estimatedCost?.min || 0,
          max: analysis?.recommendations?.[0]?.estimatedCost?.max || 0
        },
        infrastructure: {
          min: 0,
          max: 0
        },
        training: {
          min: 0,
          max: 0
        },
        contingency: {
          min: 0,
          max: 0
        },
        total: {
          min: analysis?.recommendations?.[0]?.estimatedCost?.min || 0,
          max: analysis?.recommendations?.[0]?.estimatedCost?.max || 0
        },
        currency: analysis?.recommendations?.[0]?.estimatedCost?.currency || 'USD'
      },
      status: existingPlan?.status || 'planning',
      progress: existingPlan?.progress || 0,
      startDate: existingPlan?.startDate || new Date().toISOString().split('T')[0],
      expectedEndDate: existingPlan?.expectedEndDate || '',
      actualEndDate: existingPlan?.actualEndDate,
      teamSize: existingPlan?.teamSize || 1,
      budget: existingPlan?.budget || {
        allocated: analysis?.recommendations?.[0]?.estimatedCost?.max || 0,
        spent: 0,
        currency: analysis?.recommendations?.[0]?.estimatedCost?.currency || 'USD'
      }
    }

    console.log('Built migration plan:', {
      id: migrationPlan.id,
      name: migrationPlan.projectName,
      timeline: {
        phaseCount: migrationPlan.timeline.phases.length,
        totalDuration: migrationPlan.timeline.totalDuration
      },
      risks: {
        technical: migrationPlan.riskAssessment.technicalRisks.length,
        resource: migrationPlan.riskAssessment.resourceRisks.length,
        timeline: migrationPlan.riskAssessment.timelineRisks.length
      },
      costs: {
        development: migrationPlan.costEstimate.development,
        total: migrationPlan.costEstimate.total,
        currency: migrationPlan.costEstimate.currency
      }
    });

    return NextResponse.json(migrationPlan)
  } catch (error) {
    console.error('Error in GET /api/migration:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack available');
    return NextResponse.json(
      { error: 'Failed to fetch migration plan', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(auth)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await req.json()

    // Save migration plan
    const plan = await prisma.migrationPlan.upsert({
      where: {
        userEmail: session.user.email
      },
      create: {
        ...data,
        userEmail: session.user.email
      },
      update: {
        ...data
      }
    })

    return NextResponse.json(plan)
  } catch (error) {
    console.error('Error in POST /api/migration:', error)
    return NextResponse.json(
      { error: 'Failed to save migration plan' },
      { status: 500 }
    )
  }
}
