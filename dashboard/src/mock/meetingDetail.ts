export type MeetingLifecycleStatus = 'joining' | 'recording' | 'processing' | 'completed' | 'failed'

export interface TranscriptSegment {
  id: string
  speaker: string
  timestamp: string
  text: string
}

export function formatElapsed(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}
