import OpenAI from 'openai'

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing environment variable: OPENAI_API_KEY')
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function generateTrends() {
  const prompt = `Generate 5 emerging technology trends for 2025. Format the response as a valid JSON array of objects with this exact structure:
  [
    {
      "technology": "Name of Technology",
      "description": "Brief description",
      "popularity": 85,
      "growthRate": 75,
      "category": "Category Name",
      "whyUseIt": ["Reason 1", "Reason 2", "Reason 3"],
      "sources": ["Source 1", "Source 2"],
      "companyAdoptions": [
        {
          "name": "Company Name",
          "description": "Implementation description",
          "useCase": "Specific use case",
          "impact": "Measurable impact"
        }
      ]
    }
  ]

  Make sure to:
  1. Keep all numbers between 0 and 100
  2. Include real, verifiable company examples
  3. Provide specific, measurable impacts
  4. Use proper JSON formatting with double quotes
  5. Only return the JSON array, no additional text`

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      response_format: { type: "json_object" }
    })

    const content = response.choices[0]?.message?.content

    if (!content) {
      throw new Error('No content generated')
    }

    try {
      const trends = JSON.parse(content)
      if (!Array.isArray(trends)) {
        throw new Error('Response is not an array')
      }
      return trends
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError)
      console.error('Response content:', content)
      return null
    }
  } catch (error) {
    console.error('OpenAI API Error:', error)
    return null
  }
}

export default openai 