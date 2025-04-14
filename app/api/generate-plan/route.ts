import { NextResponse } from 'next/server'
import openai from '@/lib/openai'

// Define default migration plan structure
const defaultMigrationPlan = {
  currentStack: [],
  recommendedStack: [],
  timeline: "6 months",
  effort: "Medium",
  risks: [],
  benefits: [],
  steps: [
    {
      phase: "Planning",
      duration: "1 month",
      tasks: ["Initial assessment", "Requirements gathering"],
      resources: ["Technical documentation", "Team availability"]
    }
  ],
  costEstimate: {
    training: "$0",
    tools: "$0",
    infrastructure: "$0",
    total: "$0"
  },
  teamImpact: {
    requiredSkills: [],
    trainingNeeds: [],
    teamStructure: "Standard team structure"
  }
}

// Helper function to extract JSON from potential markdown
function extractJSON(content: string): string {
  // Try to extract JSON from markdown code blocks
  const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/)
  if (jsonMatch) {
    return jsonMatch[1]
  }
  
  // If no code blocks, try to find JSON object directly
  const objectMatch = content.match(/\{[\s\S]*\}/)
  if (objectMatch) {
    return objectMatch[0]
  }
  
  return content
}

export async function POST(request: Request) {
  try {
    const profile = await request.json()

    const systemPrompt = `You are an expert technology migration consultant. Generate a detailed, realistic migration plan based on the following company profile. The plan should specifically address their business challenges and innovation priorities.

Company Profile:
- Name: ${profile.name}
- Industry: ${profile.industry}
- Size: ${profile.size}
- Current Technology Stack: ${JSON.stringify(profile.technologyStack)}
- Team Expertise: ${JSON.stringify(profile.teamExpertise)}
- Business Challenges: ${JSON.stringify(profile.businessChallenges)}
- Innovation Priorities: ${JSON.stringify(profile.innovationPriorities)}
- Implementation Timeline: ${profile.implementationTimeline}
- Budget Range: ${profile.budgetRange}

Key Requirements:
1. The recommended technology stack must directly address the business challenges: ${JSON.stringify(profile.businessChallenges)}
2. The implementation steps must align with their innovation priorities: ${JSON.stringify(profile.innovationPriorities)}
3. The timeline must respect their preferred implementation timeline: ${profile.implementationTimeline}
4. The cost estimates must fall within their budget range: ${profile.budgetRange}
5. The team impact analysis must consider their current expertise: ${JSON.stringify(profile.teamExpertise)}

Return ONLY a valid JSON object with this exact structure:
{
  "currentStack": string[],
  "recommendedStack": string[],
  "timeline": string,
  "effort": string,
  "risks": string[],
  "benefits": string[],
  "steps": [{
    "phase": string,
    "duration": string,
    "tasks": string[],
    "resources": string[]
  }],
  "costEstimate": {
    "training": string,
    "tools": string,
    "infrastructure": string,
    "total": string
  },
  "teamImpact": {
    "requiredSkills": string[],
    "trainingNeeds": string[],
    "teamStructure": string
  }
}

Ensure that:
1. Each benefit directly maps to a business challenge or innovation priority
2. Steps include specific tasks to address each business challenge
3. Risk assessment includes potential impacts on current business operations
4. Cost breakdown aligns with their budget range
5. Team impact analysis identifies gaps between current expertise and required skills
6. Timeline respects their implementation timeline preference
7. Recommended stack builds upon their current technology while addressing challenges

IMPORTANT: Return the JSON object directly without any markdown formatting or code blocks.`

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: "Generate the migration plan JSON." }
      ],
      temperature: 0.7
    })

    let migrationPlan
    try {
      const content = response.choices[0]?.message?.content || '{}'
      console.log('Raw response:', content)
      
      // Extract JSON from potential markdown formatting
      const jsonStr = extractJSON(content)
      console.log('Extracted JSON:', jsonStr)
      
      migrationPlan = JSON.parse(jsonStr)
      
      // Ensure all required properties exist by merging with default plan
      migrationPlan = {
        ...defaultMigrationPlan,
        ...migrationPlan,
        costEstimate: {
          ...defaultMigrationPlan.costEstimate,
          ...(migrationPlan.costEstimate || {})
        },
        teamImpact: {
          ...defaultMigrationPlan.teamImpact,
          ...(migrationPlan.teamImpact || {})
        }
      }
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError)
      console.error('Response content:', response.choices[0]?.message?.content)
      migrationPlan = defaultMigrationPlan
    }

    return NextResponse.json(migrationPlan)
  } catch (error) {
    console.error('Migration Plan Generation Error:', error)
    return NextResponse.json(defaultMigrationPlan)
  }
} 