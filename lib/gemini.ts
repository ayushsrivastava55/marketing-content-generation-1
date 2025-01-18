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

export async function generateProjectAnalysis(profile: any) {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

  const prompt = `Analyze this company profile and generate a detailed project and technology analysis. Return the response as a valid JSON object with this exact structure:
  {
    "techHealthScore": 85,
    "migrationProgress": {
      "planned": 30,
      "inProgress": 40,
      "completed": 30
    },
    "budgetUtilization": 65,
    "timelineAdherence": 80,
    "riskLevel": "medium",
    "recommendations": [
      {
        "technology": "Technology Name",
        "category": "Category",
        "reasons": ["Reason 1", "Reason 2"],
        "benefitsScore": {
          "performance": 85,
          "scalability": 90,
          "maintenance": 75,
          "costEfficiency": 80
        },
        "migrationComplexity": "medium",
        "estimatedCost": {
          "min": 50000,
          "max": 100000,
          "currency": "USD"
        }
      }
    ],
    "riskAnalysis": {
      "technicalDebt": {
        "score": 65,
        "issues": ["Issue 1", "Issue 2"]
      },
      "securityVulnerabilities": {
        "score": 75,
        "issues": ["Issue 1", "Issue 2"]
      },
      "scalabilityIssues": {
        "score": 80,
        "issues": ["Issue 1", "Issue 2"]
      },
      "resourceConstraints": {
        "score": 70,
        "issues": ["Issue 1", "Issue 2"]
      }
    },
    "timeline": {
      "phases": [
        {
          "name": "Phase Name",
          "duration": "3 months",
          "dependencies": ["Dependency 1"],
          "risks": ["Risk 1"]
        }
      ],
      "totalDuration": "9 months",
      "criticalPath": ["Phase 1", "Phase 3"]
    }
  }

  Company Profile to analyze:
  ${JSON.stringify(profile, null, 2)}

  Make sure to:
  1. Keep all scores between 0 and 100
  2. Provide specific, actionable recommendations
  3. Base the analysis on the company's current technology stack and challenges
  4. Use proper JSON formatting with double quotes
  5. Only return the JSON object, no additional text`

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
      const analysis = JSON.parse(cleanJson)
      if (typeof analysis !== 'object' || analysis === null) {
        throw new Error('Response is not an object')
      }
      return analysis
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
