import { Skeleton } from '../ui/Skeleton'
import { EmptyState } from '../dashboard/EmptyState'
import { ErrorState } from '../dashboard/ErrorState'
import { TranscriptItem } from './TranscriptItem'
import type { TranscriptSegment } from '../../mock/meetingDetail'

export type TranscriptState = 'loading' | 'empty' | 'ready' | 'error'

interface TranscriptListProps {
  state: TranscriptState
  segments: TranscriptSegment[]
  isLive?: boolean
  onRetry?: () => void
}

export function TranscriptList({ state, segments, isLive = false, onRetry }: TranscriptListProps) {
  if (state === 'loading') {
    return (
      <div className="space-y-1">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="flex gap-4 px-3 py-2.5">
            <div className="w-24 shrink-0 space-y-1.5 sm:w-28">
              <Skeleton className="h-3.5 w-16" />
              <Skeleton className="h-3 w-10" />
            </div>
            <Skeleton className="h-3.5 w-full" />
          </div>
        ))}
      </div>
    )
  }

  if (state === 'error') {
    return (
      <ErrorState
        title="Couldn't load transcript"
        description="Something went wrong while loading this meeting's transcript."
        onRetry={onRetry}
      />
    )
  }

  if (state === 'empty' || segments.length === 0) {
    return (
      <EmptyState
        title="No transcript yet"
        description="Transcript segments will appear here once the meeting starts."
      />
    )
  }

  return (
    <div>
      <div className="space-y-1">
        {segments.map((segment, index) => (
          <TranscriptItem
            key={segment.id}
            speaker={segment.speaker}
            timestamp={segment.timestamp}
            text={segment.text}
            active={isLive && index === segments.length - 1}
          />
        ))}
      </div>
      {isLive && (
        <div className="mt-3 flex items-center gap-2 px-3 text-xs text-sky-300/70">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-sky-400" />
          Transcribing...
        </div>
      )}
    </div>
  )
}
