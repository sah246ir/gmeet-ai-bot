import { Link } from 'react-router-dom'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { MeetingStatus, type MeetingStatusType } from './MeetingStatus'

interface ActiveMeetingCardProps {
  variant: 'active'
  id: string
  title: string
  url: string
  status: Extract<MeetingStatusType, 'joining' | 'active' | 'processing' | 'failed'>
  durationLabel: string
  onEnd: () => void
}

interface PastMeetingCardProps {
  variant: 'past'
  id: string
  title: string
  dateLabel: string
  chunksLabel?: string
}

type MeetingCardProps = ActiveMeetingCardProps | PastMeetingCardProps

// The bot has already left the call by this point (only server-side
// processing remains), so there's nothing left to "end".
const LIVE_STATUSES = new Set<MeetingStatusType>(['joining', 'active'])

export function MeetingCard(props: MeetingCardProps) {
  if (props.variant === 'active') {
    const { id, title, url, status, durationLabel, onEnd } = props
    const canEnd = LIVE_STATUSES.has(status) || status === 'failed'

    return (
      <Link to={`/meeting/${id}`} className="block">
        <Card className="flex flex-col gap-5 p-6 transition-colors duration-200 hover:border-white/15">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate text-[15px] font-medium text-white">{title}</h3>
              <p className="mt-1 truncate text-xs text-white/35">{url}</p>
            </div>
            <MeetingStatus status={status} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/40">{durationLabel}</span>
            {canEnd && (
              <Button
                type="button"
                variant="ghost"
                onClick={(e) => {
                  e.preventDefault()
                  onEnd()
                }}
                className="!px-3 !py-1.5 text-xs text-red-400/70 hover:bg-red-400/[0.06] hover:text-red-300"
              >
                {status === 'failed' ? 'Dismiss' : 'End meeting'}
              </Button>
            )}
          </div>
        </Card>
      </Link>
    )
  }

  const { id, title, dateLabel, chunksLabel } = props
  return (
    <Link to={`/meeting/${id}`} className="block">
      <Card className="flex flex-col gap-5 p-6 transition-colors duration-200 hover:border-white/15">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-[15px] font-medium text-white">{title}</h3>
            <p className="mt-1 text-xs text-white/35">{dateLabel}</p>
          </div>
          <MeetingStatus status="ready" />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-white/35">{chunksLabel ?? ''}</span>
          <span className="inline-flex items-center gap-1 text-xs font-medium text-sky-400">
            Open meeting <span aria-hidden="true">→</span>
          </span>
        </div>
      </Card>
    </Link>
  )
}
