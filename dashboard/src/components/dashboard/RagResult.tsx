import { Spinner } from '../ui/Spinner'
import { Skeleton } from '../ui/Skeleton'
import { ErrorState } from './ErrorState'
import { SourceCard } from './SourceCard'

export type RagState = 'empty' | 'loading' | 'success' | 'error' | 'no-results'

interface Source {
  label: string
  timestamp: string
}

interface RagResultProps {
  state: RagState
  answer: string
  sources: Source[]
  onRetry: () => void
}

export function RagResult({ state, answer, sources, onRetry }: RagResultProps) {
  if (state === 'empty') {
    return <p className="text-sm text-white/35">Ask a question about your meetings.</p>
  }

  if (state === 'loading') {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-white/45">
          <Spinner className="h-3.5 w-3.5 border-[1.5px] border-white/20 border-t-white/70" />
          Searching your meetings...
        </div>
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
        <Skeleton className="h-3 w-2/3" />
      </div>
    )
  }

  if (state === 'error') {
    return (
      <ErrorState
        title="Couldn't search your meetings"
        description="Something went wrong while retrieving your meeting knowledge."
        onRetry={onRetry}
      />
    )
  }

  if (state === 'no-results') {
    return (
      <p className="text-sm text-white/40">
        Couldn&apos;t find anything relevant in your meetings.
      </p>
    )
  }

  return (
    <div className="space-y-5">
      <p className="text-sm leading-relaxed text-white/75">{answer}</p>
      {sources.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-white/30">
            Sources
          </p>
          <div className="flex flex-wrap gap-2">
            {sources.map((source) => (
              <SourceCard key={`${source.label}-${source.timestamp}`} label={source.label} timestamp={source.timestamp} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
