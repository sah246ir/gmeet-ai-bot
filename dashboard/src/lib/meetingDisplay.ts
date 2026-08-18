import type { MeetingEvent, MeetingState, MeetingStatusLog } from '../services/types'
import type { MeetingStatusType } from '../components/dashboard/MeetingStatus'
import type { MeetingLifecycleStatus } from '../mock/meetingDetail'

// Job-type events interleave with lifecycle events in the same statusLogs
// array now, so anything wanting "the current lifecycle stage" needs to skip
// past them.
export const JOB_EVENTS = new Set<MeetingEvent>([
  'PROCESS_TRANSCRIPT',
  'GENERATE_EMBEDDINGS',
  'INDEX_PINECONE',
  'GENERATE_SUMMARY',
  'EXTRACT_ACTION_ITEMS',
])

export function latestLifecycleEvent(statusLogs: MeetingStatusLog[]): MeetingEvent {
  return statusLogs.find((log) => !JOB_EVENTS.has(log.event))?.event ?? 'STARTING'
}

export function deriveMeetingTitle(url: string): string {
  const match = url.match(/meet\.google\.com\/([a-z0-9-]+)/i)
  return match ? `Meeting ${match[1]}` : 'Google Meet'
}

export function toDashboardStatus(statusLogs: MeetingStatusLog[]): MeetingStatusType {
  const latest = latestLifecycleEvent(statusLogs)
  const isProcessing = statusLogs.some((log) => JOB_EVENTS.has(log.event))

  switch (latest) {
    case 'STARTING':
    case 'CREATING_JOINEE_BOT':
    case 'JOINING_MEETING':
      return 'joining'
    case 'MEETING_PROCESSED':
      return isProcessing ? 'processing' : 'active'
    case 'COMPLETED':
      return 'ready'
    case 'FAILED':
      return 'failed'
    default:
      return 'joining'
  }
}

export function toLifecycleStatus(statusLogs: MeetingStatusLog[]): MeetingLifecycleStatus {
  const latest = latestLifecycleEvent(statusLogs)
  const isProcessing = statusLogs.some((log) => JOB_EVENTS.has(log.event))

  switch (latest) {
    case 'STARTING':
    case 'CREATING_JOINEE_BOT':
    case 'JOINING_MEETING':
      return 'joining'
    case 'MEETING_PROCESSED':
      return isProcessing ? 'processing' : 'recording'
    case 'COMPLETED':
      return 'completed'
    case 'FAILED':
      return 'failed'
    default:
      return 'joining'
  }
}

export function isActiveMeeting(state: MeetingState): boolean {
  return state === 'PENDING'
}

export function isTerminalStatus(state: MeetingState | undefined): boolean {
  return state !== undefined && state !== 'PENDING'
}

export function formatElapsedSince(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime()
  const minutes = Math.max(0, Math.floor(ms / 60000))
  return `${minutes} min`
}

export function formatMeetingDate(iso: string): string {
  const date = new Date(iso)
  const now = new Date()

  if (date.toDateString() === now.toDateString()) return 'Today'

  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const NO_RESULTS_PHRASE = "couldn't find that information"

export function isNoResultsAnswer(answer: string): boolean {
  const trimmed = answer.trim()
  return trimmed.length === 0 || trimmed.toLowerCase().includes(NO_RESULTS_PHRASE)
}
