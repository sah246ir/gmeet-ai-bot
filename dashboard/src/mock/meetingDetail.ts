export type MeetingLifecycleStatus = 'joining' | 'recording' | 'processing' | 'completed' | 'failed'

export interface TranscriptSegment {
  id: string
  speaker: string
  timestamp: string
  text: string
}

export interface SummaryData {
  overview: string
  keyPoints: string[]
  decisions: { title: string; description: string }[]
  actionItems: { owner: string; task: string; due: string }[]
}

export interface MeetingDetailSeed {
  title: string
  url: string
  initialStatus: MeetingLifecycleStatus
  initialElapsedSeconds: number
  initialSegmentCount: number
}

export const MOCK_TRANSCRIPT_SEGMENTS: TranscriptSegment[] = [
  {
    id: 'seg-1',
    speaker: 'Speaker 1',
    timestamp: '02:14',
    text: 'We should probably migrate the database this weekend.',
  },
  {
    id: 'seg-2',
    speaker: 'Speaker 2',
    timestamp: '02:21',
    text: "Agreed. I'll prepare the migration script.",
  },
  {
    id: 'seg-3',
    speaker: 'Speaker 1',
    timestamp: '02:38',
    text: 'PostgreSQL seems like the better fit long term compared to sticking with MySQL.',
  },
  {
    id: 'seg-4',
    speaker: 'Speaker 3',
    timestamp: '03:05',
    text: "Let's plan for Sunday so we have a buffer before the week starts.",
  },
  {
    id: 'seg-5',
    speaker: 'Speaker 2',
    timestamp: '03:40',
    text: "I'll have the script ready by Friday for review.",
  },
]

export const MOCK_SUMMARY: SummaryData = {
  overview:
    'The team discussed migrating the database from MySQL to PostgreSQL. They agreed PostgreSQL would better support long-term scaling needs and settled on a migration date that minimizes risk to ongoing work.',
  keyPoints: [
    'PostgreSQL was selected for the database migration.',
    'Migration is planned for Sunday.',
    'The current MySQL setup is becoming difficult to maintain.',
  ],
  decisions: [{ title: 'Database migration', description: 'Move from MySQL to PostgreSQL.' }],
  actionItems: [{ owner: 'John', task: 'Prepare migration script', due: 'Due Friday' }],
}

const SEEDS: Record<string, MeetingDetailSeed> = {
  'seed-active-1': {
    title: 'Product Planning',
    url: 'https://meet.google.com/abc-defg-hij',
    initialStatus: 'recording',
    initialElapsedSeconds: 18 * 60 + 42,
    initialSegmentCount: 42,
  },
  'seed-active-2': {
    title: 'Engineering Sync',
    url: 'https://meet.google.com/xyz-uvwt-rst',
    initialStatus: 'joining',
    initialElapsedSeconds: 0,
    initialSegmentCount: 0,
  },
  'seed-past-1': {
    title: 'Product Strategy',
    url: 'https://meet.google.com/prod-strat-482',
    initialStatus: 'completed',
    initialElapsedSeconds: 42 * 60,
    initialSegmentCount: 124,
  },
  'seed-past-2': {
    title: 'Engineering Sync',
    url: 'https://meet.google.com/eng-sync-119',
    initialStatus: 'completed',
    initialElapsedSeconds: 36 * 60,
    initialSegmentCount: 98,
  },
  'seed-past-3': {
    title: 'Client Discussion',
    url: 'https://meet.google.com/client-disc-773',
    initialStatus: 'completed',
    initialElapsedSeconds: 51 * 60,
    initialSegmentCount: 88,
  },
}

const DEFAULT_URL = 'https://meet.google.com/new-meeting'

export function resolveMeetingDetail(id: string): MeetingDetailSeed {
  const seed = SEEDS[id]
  if (seed) return seed

  if (id.toLowerCase().includes('fail')) {
    return {
      title: 'Untitled meeting',
      url: DEFAULT_URL,
      initialStatus: 'failed',
      initialElapsedSeconds: 4 * 60,
      initialSegmentCount: 14,
    }
  }

  if (id.startsWith('past-')) {
    return {
      title: 'Untitled meeting',
      url: DEFAULT_URL,
      initialStatus: 'completed',
      initialElapsedSeconds: 20 * 60,
      initialSegmentCount: 30,
    }
  }

  return {
    title: 'Untitled meeting',
    url: DEFAULT_URL,
    initialStatus: 'recording',
    initialElapsedSeconds: 0,
    initialSegmentCount: 0,
  }
}

export function formatElapsed(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}
