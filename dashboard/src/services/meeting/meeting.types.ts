import type { Meeting, MeetingStatusLog, TranscriptSegment } from '../types'

export interface CreateMeetingRequest {
  url: string
}

export type MeetingCreated = Meeting & { statusLogs: MeetingStatusLog[] }

export type MeetingListItem = Meeting & { statusLogs: MeetingStatusLog[] }

export type MeetingDetail = Meeting & { statusLogs: MeetingStatusLog[] }

export interface MeetingInsightSpeaker {
  label: string
  note?: string
}

export interface MeetingInsight {
  id: string
  meetingId: string
  overview: string
  keyPoints: string[]
  decisions: { title: string; description: string }[]
  actionItems: { owner: string; task: string; due: string }[]
  speakerCount: number
  speakers: MeetingInsightSpeaker[]
  createdAt: string
  updatedAt: string
}

export type { TranscriptSegment }
