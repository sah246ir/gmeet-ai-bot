import { useMutation } from '@tanstack/react-query'
import { queryMeeting, querySession } from '../services/ai/ai.service'

export function useQueryMeeting(meetingId: string | undefined) {
  return useMutation({
    mutationFn: (question: string) => queryMeeting(meetingId!, question),
  })
}

export function useQuerySession() {
  return useMutation({
    mutationFn: (question: string) => querySession(question),
  })
}
