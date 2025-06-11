import { useMutation } from '@tanstack/react-query'

const API_BASE_URL = 'http://localhost:8000'

export const useDeletePresentation = () => {
  return useMutation({
    mutationFn: async (presentationId) => {
      const response = await fetch(`${API_BASE_URL}/api/v1/presentation/${presentationId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Presentation not found')
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    },
    retry: false,
  })
}