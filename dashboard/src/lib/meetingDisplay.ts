import type { MeetingStatus, MeetingStatusLog } from '../services/types'
import type { MeetingStatusType } from '../components/dashboard/MeetingStatus'
import type { MeetingLifecycleStatus } from '../mock/meetingDetail'

export function latestStatus(statusLogs: MeetingStatusLog[]): MeetingStatus {
  return statusLogs[0]?.status ?? 'STARTING'
}

export function deriveMeetingTitle(url: string): string {
  const match = url.match(/meet\.google\.com\/([a-z0-9-]+)/i)
  return match ? `Meeting ${match[1]}` : 'Google Meet'
}

export function toDashboardStatus(status: MeetingStatus): MeetingStatusType {
  switch (status) {
    case 'STARTING':
    case 'CREATING_JOINEE_BOT':
    case 'JOINING_MEETING':
      return 'joining'
    case 'MEETING_PROCESSED':
      return 'active'
    case 'PROCESSING_MEETING':
      return 'processing'
    case 'COMPLETED':
      return 'ready'
    case 'FAILED':
      return 'failed'
  }
}

export function toLifecycleStatus(status: MeetingStatus): MeetingLifecycleStatus {
  switch (status) {
    case 'STARTING':
    case 'CREATING_JOINEE_BOT':
    case 'JOINING_MEETING':
      return 'joining'
    case 'MEETING_PROCESSED':
      return 'recording'
    case 'PROCESSING_MEETING':
      return 'processing'
    case 'COMPLETED':
      return 'completed'
    case 'FAILED':
      return 'failed'
  }
}

export function isActiveMeeting(status: MeetingStatus): boolean {
  return status !== 'COMPLETED'
}

export function isTerminalStatus(status: MeetingStatus | undefined): boolean {
  return status === 'COMPLETED' || status === 'FAILED'
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
