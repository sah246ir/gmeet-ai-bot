import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Spinner } from '../ui/Spinner'
import type { MeetingLifecycleStatus } from '../../mock/meetingDetail'

interface StatusConfig {
  label: string
  description: string
  tone: string
}

const statusConfig: Record<MeetingLifecycleStatus, StatusConfig> = {
  joining: {
    label: 'Joining meeting',
    description: 'Memora is joining the Google Meet...',
    tone: 'text-white/85',
  },
  recording: {
    label: 'Recording',
    description: 'Memora is capturing and transcribing the meeting.',
    tone: 'text-sky-300',
  },
  processing: {
    label: 'Processing meeting',
    description: 'Preparing transcript and meeting knowledge...',
    tone: 'text-white/85',
  },
  completed: {
    label: 'Meeting ready',
    description: 'Transcript and meeting knowledge are ready.',
    tone: 'text-emerald-300',
  },
  failed: {
    label: 'Processing failed',
    description: 'Something went wrong while processing this meeting.',
    tone: 'text-red-300',
  },
}

function StatusIcon({ status }: { status: MeetingLifecycleStatus }) {
  if (status === 'joining' || status === 'processing') {
    return <Spinner className="mt-1 h-5 w-5 border-2 border-white/15 border-t-white/60" />
  }

  if (status === 'recording') {
    return (
      <span className="relative mt-1.5 flex h-4 w-4 shrink-0 items-center justify-center">
        <span className="absolute h-3 w-3 animate-ping rounded-full bg-sky-400/40" />
        <span className="relative h-2 w-2 rounded-full bg-sky-400" />
      </span>
    )
  }

  if (status === 'completed') {
    return (
      <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-400/10">
        <span className="h-2 w-2 rounded-full bg-emerald-400" />
      </span>
    )
  }

  return (
    <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-400/10">
      <span className="h-2 w-2 rounded-full bg-red-400" />
    </span>
  )
}

interface MeetingStatusIndicatorProps {
  status: MeetingLifecycleStatus
  elapsedLabel?: string
  segmentLabel?: string
  onRetry?: () => void
}

export function MeetingStatusIndicator({
  status,
  elapsedLabel,
  segmentLabel,
  onRetry,
}: MeetingStatusIndicatorProps) {
  const { label, description, tone } = statusConfig[status]

  return (
    <Card className="p-6 sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <StatusIcon status={status} />
          <div>
            <p className={`text-base font-semibold ${tone}`}>{label}</p>
            <p className="mt-1 max-w-xl text-sm leading-relaxed text-white/50">{description}</p>
          </div>
        </div>
        {status === 'failed' && onRetry && (
          <Button type="button" variant="ghost" onClick={onRetry} className="shrink-0">
            Retry
          </Button>
        )}
      </div>

      {status === 'recording' && (
        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-white/[0.06] pt-5 text-sm text-white/45">
          <span>{elapsedLabel}</span>
          <span className="text-white/15">·</span>
          <span>{segmentLabel}</span>
          <span className="ml-auto flex items-center gap-1.5 text-xs text-sky-300/80">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-sky-400" />
            Transcribing...
          </span>
        </div>
      )}
    </Card>
  )
}
