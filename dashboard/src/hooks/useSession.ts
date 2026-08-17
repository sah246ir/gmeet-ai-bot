import { useQuery } from '@tanstack/react-query'
import { createSession } from '../services/session/session.service'

export function useEnsureSession() {
  return useQuery({
    queryKey: ['session'],
    queryFn: createSession,
    staleTime: Infinity,
    retry: 1,
  })
}
