import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { getWebSocketUrl } from '../lib/ws'
import type { MeetingStatusLog, TranscriptSegment } from '../services/types'

interface LiveTranscriptMessage {
  type: 'live-transcript'
  meetingId: string
  segment: TranscriptSegment
}

interface MeetingStatusMessage {
  type: 'meeting-status'
  meetingId: string
  statusLog: MeetingStatusLog
}

type SocketMessage = LiveTranscriptMessage | MeetingStatusMessage

function parseMessage(raw: string): SocketMessage | null {
  try {
    const data = JSON.parse(raw)
    if (data?.type === 'live-transcript' || data?.type === 'meeting-status') {
      return data as SocketMessage
    }
    return null
  } catch {
    return null
  }
}

/**
 * One WebSocket connection for the whole app, kept alive at the root so
 * status/transcript updates stay live regardless of which page is open.
 * Pushes updates directly into the existing react-query caches rather than
 * keeping separate local state.
 */
export function useSocket() {
  const queryClient = useQueryClient()

  useEffect(() => {
    const ws = new WebSocket(getWebSocketUrl())

    ws.onmessage = (event) => {
      const message = parseMessage(event.data)
      if (!message) return

      if (message.type === 'live-transcript') {
        queryClient.setQueryData<TranscriptSegment[]>(
          ['meetings', message.meetingId, 'transcripts'],
          (prev) => {
            if (!prev) return prev
            if (prev.some((segment) => segment.id === message.segment.id)) return prev
            return [...prev, message.segment]
          },
        )
        return
      }

      // A status change also means the meeting's jobs may have changed (e.g.
      // it only reaches COMPLETED once its jobs are already done) - refetch
      // the whole meeting rather than patching statusLogs in isolation, so
      // jobs and statusLogs never end up telling two different stories.
      queryClient.invalidateQueries({ queryKey: ['meetings', message.meetingId] })
      queryClient.invalidateQueries({ queryKey: ['meetings'], exact: true })
    }

    return () => ws.close()
  }, [queryClient])
}
