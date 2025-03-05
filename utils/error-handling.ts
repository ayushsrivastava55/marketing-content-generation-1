export const handleAIError = (error: any) => {
  if (error.response) {
    // OpenAI API error
    return {
      error: error.response.data.error.message || 'OpenAI API error',
      status: error.response.status
    }
  }
  return {
    error: 'Internal server error',
    status: 500
  }
} 