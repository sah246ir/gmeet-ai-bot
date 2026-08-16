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

export const initialActiveMeetings: ActiveMeeting[] = [
  {
    id: 'seed-active-1',
    title: 'Product Planning',
    url: 'https://meet.google.com/abc-defg-hij',
    status: 'active',
    durationLabel: '18 min',
  },
  {
    id: 'seed-active-2',
    title: 'Engineering Sync',
    url: 'https://meet.google.com/xyz-uvwt-rst',
    status: 'joining',
    durationLabel: 'Starting...',
  },
]

export const initialPastMeetings: PastMeeting[] = [
  {
    id: 'seed-past-1',
    title: 'Product Strategy',
    dateLabel: 'Today · 42 min',
    chunksLabel: '124 transcript chunks',
  },
  {
    id: 'seed-past-2',
    title: 'Engineering Sync',
    dateLabel: 'Yesterday · 36 min',
    chunksLabel: '98 transcript chunks',
  },
  {
    id: 'seed-past-3',
    title: 'Client Discussion',
    dateLabel: 'Aug 14 · 51 min',
  },
]
