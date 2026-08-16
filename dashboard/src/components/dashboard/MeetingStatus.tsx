import { Spinner } from '../ui/Spinner'

export type MeetingStatusType = 'joining' | 'active' | 'processing' | 'ready' | 'failed'

interface StatusConfig {
  label: string
  tone: string
  indicator: 'spin' | 'pulse' | 'dot'
}

const statusConfig: Record<MeetingStatusType, StatusConfig> = {
  joining: {
    label: 'Joining meeting',
    tone: 'border-white/10 bg-white/[0.03] text-white/60',
    indicator: 'spin',
  },
  active: {
    label: 'Transcribing',
    tone: 'border-sky-400/25 bg-sky-400/[0.07] text-sky-300/90',
    indicator: 'pulse',
  },
  processing: {
    label: 'Processing transcript',
    tone: 'border-white/10 bg-white/[0.03] text-white/60',
    indicator: 'spin',
  },
  ready: {
    label: 'Ready',
    tone: 'border-emerald-400/20 bg-emerald-400/[0.05] text-emerald-300/80',
    indicator: 'dot',
  },
  failed: {
    label: 'Failed',
    tone: 'border-red-400/20 bg-red-400/[0.05] text-red-300/80',
    indicator: 'dot',
  },
}

interface MeetingStatusProps {
  status: MeetingStatusType
  className?: string
}

export function MeetingStatus({ status, className = '' }: MeetingStatusProps) {
  const { label, tone, indicator } = statusConfig[status]

  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${tone} ${className}`}
    >
      {indicator === 'spin' && (
        <Spinner className="h-3 w-3 border-[1.5px] border-white/20 border-t-white/70" />
      )}
      {indicator === 'pulse' && (
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-sky-400" />
      )}
      {indicator === 'dot' && (
        <span
          className={`h-1.5 w-1.5 rounded-full ${status === 'failed' ? 'bg-red-400/80' : 'bg-emerald-400/80'}`}
        />
      )}
      {label}
    </span>
  )
}
