import { useQuery } from '@tanstack/react-query'

const API_BASE_URL = 'http://localhost:8000'

export const usePresentationStatus = (presentationId, { onComplete, onError } = {}) => {
  return useQuery({
    queryKey: ['presentation-status', presentationId],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/api/v1/status/${presentationId}`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    },
    enabled: !!presentationId,
    refetchInterval: (data) => {
      // Stop polling if completed or failed
      if (data?.status === 'completed' || data?.status === 'failed') {
        if (data.status === 'completed' && onComplete) {
          onComplete(data)
        }
        if (data.status === 'failed' && onError) {
          onError(new Error(data.error || 'Generation failed'))
        }
        return false
      }
      // Poll every 2 seconds while processing
      return 2000
    },
    retry: (failureCount, error) => {
      // Don't retry on 404 (presentation not found)
      if (error.message.includes('404')) {
        return false
      }
      return failureCount < 3
    },
  })
}