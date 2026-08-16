import type { Job, Meeting, MeetingStatusLog, TranscriptSegment } from '../types'

export interface CreateMeetingRequest {
  url: string
}

export type MeetingCreated = Meeting & { statusLogs: MeetingStatusLog[] }

export type MeetingListItem = Meeting & { statusLogs: MeetingStatusLog[] }

export type MeetingDetail = Meeting & { jobs: Job[]; statusLogs: MeetingStatusLog[] }

export type { TranscriptSegment }
