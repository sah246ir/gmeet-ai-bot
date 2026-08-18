export type MeetingEvent =
  | 'STARTING'
  | 'CREATING_JOINEE_BOT'
  | 'JOINING_MEETING'
  | 'WAITING_FOR_ENTRY'
  | 'MEETING_PROCESSED'
  | 'PROCESS_TRANSCRIPT'
  | 'GENERATE_EMBEDDINGS'
  | 'INDEX_PINECONE'
  | 'GENERATE_SUMMARY'
  | 'EXTRACT_ACTION_ITEMS'
  | 'COMPLETED'
  | 'FAILED'

export type MeetingLogStatus = 'PENDING' | 'FAILED' | 'SUCCESS'

export type MeetingState = 'PENDING' | 'DONE' | 'FAILED'

export interface Meeting {
  id: string
  url: string
  createdAt: string
  updatedAt: string
  sessionToken: string
  state: MeetingState
  completedAt: string | null
}

export interface MeetingStatusLog {
  id: string
  meetingId: string
  event: MeetingEvent
  status: MeetingLogStatus
  error: string | null
  createdAt: string
  closingState: string | null
}

export interface TranscriptWord {
  word: string
  speaker?: number
}

export interface TranscriptSegment {
  id: string
  meetingId: string
  text: string
  startTime: number
  endTime: number
  speakerId: string | null
  words: TranscriptWord[] | null
  createdAt: string
}

export interface ApiError {
  error: string
  details?: unknown
}
