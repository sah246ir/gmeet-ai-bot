import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createMeeting,
  endMeeting,
  getMeeting,
  getMeetingInsight,
  getMeetingTranscripts,
  listMeetings,
} from '../services/meeting/meeting.service'
import { isTerminalStatus, latestStatus } from '../lib/meetingDisplay'

export function useMeetings() {
  return useQuery({
    queryKey: ['meetings'],
    queryFn: listMeetings,
  })
}

export function useMeeting(meetingId: string | undefined) {
  return useQuery({
    queryKey: ['meetings', meetingId],
    queryFn: () => getMeeting(meetingId!),
    enabled: !!meetingId,
    refetchInterval: (query) => {
      const data = query.state.data
      return data && isTerminalStatus(latestStatus(data.statusLogs)) ? false : 4000
    },
  })
}

export function useMeetingTranscripts(meetingId: string | undefined, enabled: boolean, live: boolean) {
  return useQuery({
    queryKey: ['meetings', meetingId, 'transcripts'],
    queryFn: () => getMeetingTranscripts(meetingId!),
    enabled: !!meetingId && enabled,
    refetchInterval: live ? 4000 : false,
  })
}

export function useMeetingInsight(meetingId: string | undefined, enabled: boolean) {
  return useQuery({
    queryKey: ['meetings', meetingId, 'insights'],
    queryFn: () => getMeetingInsight(meetingId!),
    enabled: !!meetingId && enabled,
  })
}

export function useCreateMeeting() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (url: string) => createMeeting({ url }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meetings'] })
    },
  })
}

export function useEndMeeting(meetingId?: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => endMeeting(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ['meetings'] })
      queryClient.invalidateQueries({ queryKey: ['meetings', meetingId ?? id] })
    },
  })
}
