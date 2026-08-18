import { Card } from '../ui/Card'
import { Spinner } from '../ui/Spinner'
import { Accordion } from '../ui/Accordion'
import { CheckIcon, ErrorIcon } from './StatusIcons'
import { JobStatusList } from './JobStatusList'
import { useElapsedSeconds } from '../../hooks/useElapsedSeconds'
import { formatElapsed } from '../../mock/meetingDetail'
import type { Job, MeetingStatus, MeetingStatusLog } from '../../services/types'

interface StatusMeta {
  title: string
  description: string
}

const STATUS_META: Record<MeetingStatus, StatusMeta> = {
  STARTING: {
    title: 'Meeting started',
    description: 'Memora received the request to bring in this meeting.',
  },
  CREATING_JOINEE_BOT: {
    title: 'Creating bot',
    description: 'Spinning up a sandbox to run the Memora bot.',
  },
  JOINING_MEETING: {
    title: 'Joining meeting',
    description: 'The bot is joining the Google Meet call.',
  },
  MEETING_PROCESSED: {
    title: 'Recording',
    description: 'The bot is in the meeting, capturing and transcribing the conversation.',
  },
  PROCESSING_MEETING: {
    title: 'Processing transcript',
    description: 'Preparing the transcript and meeting knowledge.',
  },
  COMPLETED: {
    title: 'Meeting ready',
    description: 'Transcript and meeting knowledge are ready.',
  },
  FAILED: {
    title: 'Failed',
    description: 'Something went wrong while processing this meeting.',
  },
}

// Statuses where the meeting/bot is still live - only these get a spinning
// indicator. Once the call itself has ended (processing onward), every step
// shows a tick, never a moving loader.
const LIVE_STATUSES = new Set<MeetingStatus>([
  'STARTING',
  'CREATING_JOINEE_BOT',
  'JOINING_MEETING',
  'MEETING_PROCESSED',
])

function isLiveStatus(status: MeetingStatus): boolean {
  return LIVE_STATUSES.has(status)
}

function StepIcon({ status, isCurrent }: { status: MeetingStatus; isCurrent: boolean }) {
  if (status === 'FAILED') {
    return (
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-400/10 text-red-400">
        <ErrorIcon className="h-3 w-3" />
      </span>
    )
  }

  if (isCurrent && isLiveStatus(status)) {
    return <Spinner className="h-6 w-6 border-2 border-white/15 border-t-sky-400" />
  }

  return (
    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-400/10 text-emerald-400">
      <CheckIcon className="h-3 w-3" />
    </span>
  )
}

interface StatusTimelineProps {
  logs: MeetingStatusLog[]
  startedAt: string
  jobs: Job[]
}

export function StatusTimeline({ logs, startedAt, jobs }: StatusTimelineProps) {
  const chronological = [...logs].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  )
  const latest = chronological[chronological.length - 1]
  const latestId = latest?.id
  const isLatestLive = latest ? isLiveStatus(latest.status) : false

  const baseline = new Date(startedAt).getTime()
  const liveElapsed = useElapsedSeconds(startedAt, isLatestLive)

  const hasActiveJobs = jobs.some((job) => job.status === 'RUNNING' || job.status === 'PENDING')

  return (
    <Card className="p-6 sm:p-8">
      <Accordion
        defaultOpen
        bodyClassName="mt-6"
        title={
          <div className="flex items-center gap-2.5">
            {(isLatestLive || hasActiveJobs) && (
              <Spinner className="h-3.5 w-3.5 border-[1.5px] border-white/20 border-t-sky-400" />
            )}
            <p className="text-sm font-medium text-white/85">Meeting timeline</p>
            {latest && <span className="text-xs text-white/35">{STATUS_META[latest.status].title}</span>}
          </div>
        }
      >
        <div className="space-y-0">
          {chronological.map((log, index) => {
            const meta = STATUS_META[log.status]
            const isCurrent = log.id === latestId
            const isLastRow = index === chronological.length - 1
            const elapsedSeconds =
              isCurrent && isLatestLive
                ? liveElapsed
                : Math.max(0, Math.floor((new Date(log.createdAt).getTime() - baseline) / 1000))

            return (
              <div key={log.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <StepIcon status={log.status} isCurrent={isCurrent} />
                  {!isLastRow && <div className="my-1 w-px flex-1 bg-white/[0.08]" />}
                </div>
                <div className={isLastRow ? 'min-w-0 flex-1 pb-1' : 'min-w-0 flex-1 pb-6'}>
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                    <p className="text-sm font-medium text-white/85">{meta.title}</p>
                    <span className="shrink-0 text-xs text-white/30">
                      +{formatElapsed(elapsedSeconds)}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs leading-relaxed text-white/45">
                    {log.status === 'FAILED' && log.error ? log.error : meta.description}
                  </p>
                  {log.status === 'PROCESSING_MEETING' && jobs.length > 0 && (
                    <div className="mt-3">
                      <Accordion
                        defaultOpen
                        bodyClassName="mt-2"
                        title={
                          <div className="flex items-center gap-2">
                            {hasActiveJobs && (
                              <Spinner className="h-3 w-3 border-[1.5px] border-white/20 border-t-sky-400" />
                            )}
                            <p className="text-xs font-medium text-white/40">Job status</p>
                          </div>
                        }
                      >
                        <JobStatusList jobs={jobs} />
                      </Accordion>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </Accordion>
    </Card>
  )
}
