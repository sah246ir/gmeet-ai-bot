import { Spinner } from '../ui/Spinner'
import { Skeleton } from '../ui/Skeleton'
import { ErrorState } from '../dashboard/ErrorState'
import { SourceCard } from './SourceCard'

export type RagState = 'empty' | 'loading' | 'success' | 'error' | 'no-results'

interface Source {
  range: string
  excerpt: string
}

interface RagAnswerProps {
  state: RagState
  answer: string
  sources: Source[]
  onRetry: () => void
}

export function RagAnswer({ state, answer, sources, onRetry }: RagAnswerProps) {
  if (state === 'empty') {
    return <p className="text-sm text-white/35">Ask a question about this meeting.</p>
  }

  if (state === 'loading') {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-white/45">
          <Spinner className="h-3.5 w-3.5 border-[1.5px] border-white/20 border-t-white/70" />
          Searching the meeting...
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
        title="Couldn't answer that question"
        description="Something went wrong while searching the meeting."
        onRetry={onRetry}
      />
    )
  }

  if (state === 'no-results') {
    return (
      <div className="space-y-1">
        <p className="text-sm text-white/50">Couldn&apos;t find anything relevant in this meeting.</p>
        <p className="text-xs text-white/35">
          Try asking about a specific topic, decision, or action item.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <p className="text-sm leading-relaxed text-white/75">{answer}</p>
      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-white/30">Sources</p>
        <div className="space-y-2">
          {sources.map((source) => (
            <SourceCard key={source.range} range={source.range} excerpt={source.excerpt} />
          ))}
        </div>
      </div>
    </div>
  )
}
