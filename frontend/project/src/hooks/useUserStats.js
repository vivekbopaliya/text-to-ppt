import { useQuery } from '@tanstack/react-query'

const API_BASE_URL = 'http://localhost:8000'

export const useUserStats = (userId) => {
  return useQuery({
    queryKey: ['user-stats', userId],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/api/v1/user/${userId}/stats`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    },
    enabled: !!userId,
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 10000, // Consider stale after 10 seconds
  })
}