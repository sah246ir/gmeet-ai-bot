import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { getWebSocketUrl } from '../lib/ws'
import type { MeetingStatusLog, TranscriptSegment } from '../services/types'
import type { MeetingDetail, MeetingListItem } from '../services/meeting/meeting.types'

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

      queryClient.setQueryData<MeetingDetail>(['meetings', message.meetingId], (prev) =>
        prev ? { ...prev, statusLogs: [message.statusLog, ...prev.statusLogs] } : prev,
      )

      queryClient.setQueryData<MeetingListItem[]>(['meetings'], (prev) =>
        prev
          ? prev.map((meeting) =>
              meeting.id === message.meetingId
                ? { ...meeting, statusLogs: [message.statusLog] }
                : meeting,
            )
          : prev,
      )
    }

    return () => ws.close()
  }, [queryClient])
}
