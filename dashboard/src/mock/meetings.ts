export type ActiveMeetingStatus = 'joining' | 'active' | 'processing' | 'failed'

export interface ActiveMeeting {
  id: string
  title: string
  url: string
  status: ActiveMeetingStatus
  durationLabel: string
}

export interface PastMeeting {
  id: string
  title: string
  dateLabel: string
  chunksLabel?: string
}
