import { Card } from '../ui/Card'
import { Spinner } from '../ui/Spinner'
import { Skeleton } from '../ui/Skeleton'
import { ErrorState } from '../dashboard/ErrorState'
import { SummarySection } from './SummarySection'
import { ActionItem } from './ActionItem'
import type { MeetingInsight } from '../../services/meeting/meeting.types'

export type SummaryState = 'locked' | 'processing' | 'completed' | 'error'

function LockIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <rect x="4.5" y="8.5" width="11" height="8" rx="2" stroke="currentColor" strokeWidth="1.3" />
      <path d="M6.5 8.5V6a3.5 3.5 0 0 1 7 0v2.5" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  )
}

interface MeetingSummaryProps {
  state: SummaryState
  summary: MeetingInsight
  onRetry?: () => void
}

export function MeetingSummary({ state, summary, onRetry }: MeetingSummaryProps) {
  if (state === 'locked') {
    return (
      <Card className="flex flex-col items-center gap-2 border-dashed p-8 text-center">
        <LockIcon className="h-5 w-5 text-white/20" />
        <p className="text-sm font-medium text-white/60">Summary will appear after the meeting</p>
        <p className="max-w-sm text-sm leading-relaxed text-white/35">
          Once the meeting ends, Memora will generate a summary with the key discussion points,
          decisions, and action items.
        </p>
      </Card>
    )
  }

  if (state === 'processing') {
    return (
      <Card className="p-6 sm:p-8">
        <div className="flex items-center gap-2 text-sm text-white/50">
          <Spinner className="h-3.5 w-3.5 border-[1.5px] border-white/20 border-t-white/70" />
          Generating summary...
        </div>
        <div className="mt-6 space-y-4">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-5/6" />
          <Skeleton className="h-3 w-2/3" />
          <div className="grid grid-cols-1 gap-3 pt-2">
            <Skeleton className="h-12 w-full rounded-lg" />
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>
        </div>
      </Card>
    )
  }

  if (state === 'error') {
    return (
      <Card className="p-6 sm:p-8">
        <ErrorState
          title="Couldn't generate the summary"
          description="Something went wrong while summarizing this meeting."
          onRetry={onRetry}
        />
      </Card>
    )
  }

  return (
    <Card className="flex flex-col gap-8 p-6 sm:p-8">
      <SummarySection title="Overview">
        <p className="text-sm leading-relaxed text-white/70">{summary.overview}</p>
      </SummarySection>

      <SummarySection title="Key points">
        <ul className="space-y-2">
          {summary.keyPoints.map((point) => (
            <li key={point} className="flex gap-2.5 text-sm leading-relaxed text-white/65">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-white/30" />
              {point}
            </li>
          ))}
        </ul>
      </SummarySection>

      <SummarySection title="Decisions">
        <div className="space-y-2">
          {summary.decisions.map((decision) => (
            <div
              key={decision.title}
              className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3"
            >
              <p className="text-sm font-medium text-white/80">{decision.title}</p>
              <p className="mt-0.5 text-sm text-white/45">{decision.description}</p>
            </div>
          ))}
        </div>
      </SummarySection>

      {summary.speakers.length > 0 && (
        <SummarySection title={`Speakers (${summary.speakerCount})`}>
          <div className="space-y-2">
            {summary.speakers.map((speaker) => (
              <div
                key={speaker.label}
                className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3"
              >
                <p className="text-sm font-medium text-white/80">{speaker.label}</p>
                {speaker.note && <p className="mt-0.5 text-sm text-white/45">{speaker.note}</p>}
              </div>
            ))}
          </div>
        </SummarySection>
      )}

      <SummarySection title="Action items">
        <div className="space-y-2">
          {summary.actionItems.map((item) => (
            <ActionItem key={item.task} owner={item.owner} task={item.task} due={item.due} />
          ))}
        </div>
      </SummarySection>
    </Card>
  )
}
