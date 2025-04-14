import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { profile, migrationPlan, question } = await request.json()

    // For predefined questions, we can provide canned responses
    // This is more efficient than calling the AI for common questions
    let response
    
    if (question === "What's the first step in the migration?") {
      response = `The first step is "${migrationPlan.steps[0].phase}". This involves ${migrationPlan.steps[0].tasks.slice(0, 2).join(' and ')}. We estimate this will take ${migrationPlan.steps[0].duration} to complete.`
    } 
    else if (question === "What risks should I be aware of?") {
      response = `The primary risks for your migration include: ${migrationPlan.risks.slice(0, 3).join(', ')}. We've built mitigation strategies into the implementation plan to address each of these risks.`
    }
    else if (question === "How can we reduce costs?") {
      response = `To reduce costs, consider: 1) Phasing the implementation to spread expenses over time, 2) Training existing staff rather than hiring specialists, 3) Using open-source alternatives where appropriate, and 4) Prioritizing the most impactful changes first.`
    }
    else {
      // Fallback for any other quick questions
      response = `To address "${question}" specifically for your ${profile.industry} company, I'd recommend reviewing the detailed migration plan. For more specific guidance, please type your question in the chat.`
    }

    return NextResponse.json({ response })
  } catch (error) {
    console.error('Error in quick-question API:', error)
    return NextResponse.json(
      { error: 'Failed to process quick question' },
      { status: 500 }
    )
  }
} 