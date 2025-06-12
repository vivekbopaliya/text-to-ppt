import { useQuery } from '@tanstack/react-query'

const API_BASE_URL = 'http://localhost:8000'

export const useUserPresentations = (userId) => {
  return useQuery({
    queryKey: ['user-presentations', userId],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/api/v1/presentations/${userId}`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    },
    enabled: !!userId,
  })
} 