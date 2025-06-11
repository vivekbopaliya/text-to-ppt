import { useMutation } from '@tanstack/react-query'

const API_BASE_URL = 'http://localhost:8000'

export const useGeneratePPT = () => {
  return useMutation({
    mutationFn: async (presentationRequest) => {
      const response = await fetch(`${API_BASE_URL}/api/v1/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(presentationRequest),
      })

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please wait before generating another presentation.')
        }
        if (response.status === 400) {
          const errorData = await response.json()
          throw new Error(errorData.detail || 'Invalid request')
        }
        if (response.status === 402) {
          throw new Error('Daily quota exceeded. Please try again tomorrow.')
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    },
    retry: (failureCount, error) => {
      // Don't retry on rate limit or quota errors
      if (error.message.includes('Rate limit') || error.message.includes('quota')) {
        return false
      }
      return failureCount < 1
    },
  })
}