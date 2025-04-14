import { NextResponse } from 'next/server'
import openai from '@/lib/openai'

export async function POST(request: Request) {
  try {
    const { profile, migrationPlan, message } = await request.json()

    // Construct system context from profile and migration plan
    const systemContext = `You are a helpful AI migration assistant helping with a technology migration plan.
Company Context:
- Name: ${profile?.name || 'Unknown'}
- Industry: ${profile?.industry || 'Unknown'}
- Size: ${profile?.size || 'Unknown'}
- Current Stack: ${JSON.stringify(profile?.technologyStack || [])}
- Team Expertise: ${JSON.stringify(profile?.teamExpertise || [])}
- Business Challenges: ${JSON.stringify(profile?.businessChallenges || [])}
- Budget Range: ${profile?.budgetRange || 'Unknown'}

Migration Plan Context:
${JSON.stringify(migrationPlan, null, 2)}

Your role is to provide specific, actionable advice about their migration plan. Use the company context to personalize responses. Be concise but thorough.`

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemContext },
        { role: "user", content: message }
      ],
      temperature: 0.7,
      max_tokens: 500
    })

    const reply = response.choices[0]?.message?.content || "I apologize, but I couldn't generate a response. Please try again."

    return NextResponse.json({ reply })
  } catch (error) {
    console.error('Chat API Error:', error)
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    )
  }
} 