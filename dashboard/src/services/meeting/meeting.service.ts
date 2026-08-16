import { api } from '../../lib/api'
import type {
  CreateMeetingRequest,
  MeetingCreated,
  MeetingDetail,
  MeetingListItem,
  TranscriptSegment,
} from './meeting.types'

export async function createMeeting(body: CreateMeetingRequest): Promise<MeetingCreated> {
  const { data } = await api.post<MeetingCreated>('/meetings', body)
  return data
}

export async function listMeetings(): Promise<MeetingListItem[]> {
  const { data } = await api.get<MeetingListItem[]>('/meetings')
  return data
}

export async function getMeeting(meetingId: string): Promise<MeetingDetail> {
  const { data } = await api.get<MeetingDetail>(`/meetings/${meetingId}`)
  return data
}

export async function getMeetingTranscripts(meetingId: string): Promise<TranscriptSegment[]> {
  const { data } = await api.get<TranscriptSegment[]>(`/meetings/${meetingId}/transcripts`)
  return data
}
