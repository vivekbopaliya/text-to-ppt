import { useQuery } from '@tanstack/react-query'

const API_BASE_URL = 'http://localhost:8000'

export const useSuggestions = (topic, industry = '', audience = '') => {
  return useQuery({
    queryKey: ['suggestions', topic, industry, audience],
    queryFn: async () => {
      if (!topic || topic.length < 3) {
        return { suggestions: [] }
      }

      const response = await fetch(`${API_BASE_URL}/api/v1/suggestions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic,
          industry,
          audience,
          slide_count: 10,
        }),
      })

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please wait before requesting more suggestions.')
        }
        throw new Error(`HTTP error! status: ${response.details.msg}`)
      }

      const data = await response.json()
      return data
    },
    enabled: !!topic && topic.length >= 3,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry on rate limit errors
      if (error.message.includes('Rate limit')) {
        return false
      }
      return failureCount < 2
    },
  })
}