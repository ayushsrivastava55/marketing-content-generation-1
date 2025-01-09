import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function generateTrends() {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

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
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    
    // Clean and parse the response
    const cleanJson = text.replace(/^```json\s*|\s*```$/g, '') // Remove code blocks if present
                         .trim()
                         .replace(/\n/g, '') // Remove newlines
                         .replace(/,\s*([\]}])/g, '$1') // Remove trailing commas
    
    try {
      const trends = JSON.parse(cleanJson)
      if (!Array.isArray(trends)) {
        throw new Error('Response is not an array')
      }
      return trends
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError)
      console.error('Clean JSON:', cleanJson)
      return null
    }
  } catch (error) {
    console.error('Gemini API Error:', error)
    return null
  }
}
