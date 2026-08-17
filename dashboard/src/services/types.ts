export type MeetingStatus =
  | 'STARTING'
  | 'CREATING_JOINEE_BOT'
  | 'JOINING_MEETING'
  | 'MEETING_PROCESSED'
  | 'PROCESSING_MEETING'
  | 'COMPLETED'
  | 'FAILED'

export type JobStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED'

export type JobType =
  | 'PROCESS_TRANSCRIPT'
  | 'GENERATE_EMBEDDINGS'
  | 'INDEX_PINECONE'
  | 'GENERATE_SUMMARY'
  | 'EXTRACT_ACTION_ITEMS'

export interface Meeting {
  id: string
  url: string
  createdAt: string
  updatedAt: string
  sessionToken: string
}

export interface MeetingStatusLog {
  id: string
  meetingId: string
  status: MeetingStatus
  error: string | null
  createdAt: string
}

export interface Job {
  id: string
  meetingId: string
  type: JobType
  status: JobStatus
  error: string | null
  createdAt: string
  updatedAt: string
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
