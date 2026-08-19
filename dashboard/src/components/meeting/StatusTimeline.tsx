import { Card } from '../ui/Card'
import { Spinner } from '../ui/Spinner'
import { Accordion } from '../ui/Accordion'
import { CheckIcon, ErrorIcon } from './StatusIcons'
import { JobStatusList } from './JobStatusList'
import { useElapsedSeconds } from '../../hooks/useElapsedSeconds'
import { formatElapsed } from '../../mock/meetingDetail'
import { JOB_EVENTS } from '../../lib/meetingDisplay'
import type { MeetingEvent, MeetingStatusLog } from '../../services/types'

interface StatusMeta {
  title: string
  description: string
}

const STATUS_META: Record<MeetingEvent, StatusMeta> = {
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
    title: 'Bot is ready',
    description: 'Bot is ready to listen.',
  },
  COMPLETED: {
    title: 'Meeting ready',
    description: 'Transcript and meeting knowledge are ready.',
  },
  FAILED: {
    title: 'Failed',
    description: 'Something went wrong while processing this meeting.',
  },
  // Job-type events never render as their own top-level row (folded into the
  // Post-processing meeting row instead) - these only exist so the Record
  // above is exhaustive over every MeetingEvent value.
  PROCESS_TRANSCRIPT: { title: 'Processing transcript', description: '' },
  GENERATE_EMBEDDINGS: { title: 'Generating embeddings', description: '' },
  INDEX_PINECONE: { title: 'Indexing transcript', description: '' },
  GENERATE_SUMMARY: { title: 'Generating summary', description: '' },
  EXTRACT_ACTION_ITEMS: { title: 'Extracting action items', description: '' },
}

// Lifecycle events where there's still work in flight - only these get a
// spinning indicator while they're the current step.
const LIVE_EVENTS = new Set<MeetingEvent>([
  'STARTING',
  'CREATING_JOINEE_BOT',
  'JOINING_MEETING',
  'MEETING_PROCESSED',
])

function isLiveEvent(event: MeetingEvent): boolean {
  return LIVE_EVENTS.has(event)
}

function StepIcon({ isFailed, isCurrent, isLive }: { isFailed: boolean; isCurrent: boolean; isLive: boolean }) {
  if (isFailed) {
    return (
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-400/10 text-red-400">
        <ErrorIcon className="h-3 w-3" />
      </span>
    )
  }

  if (isCurrent && isLive) {
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
}

interface TimelineRow {
  id: string
  createdAt: string
  title: string
  description: string
  isFailed: boolean
  isLive: boolean
  jobs?: MeetingStatusLog[]
}

export function StatusTimeline({ logs, startedAt }: StatusTimelineProps) {
  const lifecycleLogs = logs.filter((log) => !JOB_EVENTS.has(log.event))
  const chronologicalLogs = [...lifecycleLogs].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  )

  // Job-type rows, reduced to the latest row per event type (chronological
  // order keeps sortedJobLogs[0] as when post-processing first started).
  const sortedJobLogs = logs
    .filter((log) => JOB_EVENTS.has(log.event))
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
  const latestJobByEvent = new Map<MeetingEvent, MeetingStatusLog>()
  for (const log of sortedJobLogs) latestJobByEvent.set(log.event, log)
  const jobRows = Array.from(latestJobByEvent.values())
  const hasActiveJobs = jobRows.some((log) => log.status === 'PENDING')

  // Job steps are promoted into their own "Post-processing meeting" row,
  // inserted right after Bot is ready - they only ever start once the bot has
  // finished recording (audio-transcribe-end), and finish before
  // COMPLETED/FAILED is logged. Once this row exists it's the one that ends
  // up "current" (spinning) instead of Bot is ready, since it's now the last
  // row until the meeting reaches a terminal state.
  const rows: TimelineRow[] = []
  for (const log of chronologicalLogs) {
    rows.push({
      id: log.id,
      createdAt: log.createdAt,
      title: STATUS_META[log.event].title,
      description: log.event === 'FAILED' && log.error ? log.error : STATUS_META[log.event].description,
      isFailed: log.event === 'FAILED',
      isLive: isLiveEvent(log.event),
    })

    if (log.event === 'MEETING_PROCESSED' && jobRows.length > 0) {
      rows.push({
        id: 'post-processing',
        createdAt: sortedJobLogs[0]!.createdAt,
        title: 'Post-processing meeting',
        description: 'Indexing the transcript and generating the meeting summary and action items.',
        isFailed: false,
        isLive: hasActiveJobs,
        jobs: jobRows,
      })
    }
  }

  const latest = rows[rows.length - 1]
  const isLatestLive = latest?.isLive ?? false

  const baseline = new Date(startedAt).getTime()
  const liveElapsed = useElapsedSeconds(startedAt, isLatestLive)

  return (
    <Card className="p-6 sm:p-8">
      <Accordion
        defaultOpen
        bodyClassName="mt-6"
        title={
          <div className="flex items-center gap-2.5">
            {isLatestLive && (
              <Spinner className="h-3.5 w-3.5 border-[1.5px] border-white/20 border-t-sky-400" />
            )}
            <p className="text-sm font-medium text-white/85">Meeting timeline</p>
            {latest && <span className="text-xs text-white/35">{latest.title}</span>}
          </div>
        }
      >
        <div className="space-y-0">
          {rows.map((row, index) => {
            const isCurrent = row.id === latest?.id
            const isLastRow = index === rows.length - 1
            const elapsedSeconds =
              isCurrent && isLatestLive
                ? liveElapsed
                : Math.max(0, Math.floor((new Date(row.createdAt).getTime() - baseline) / 1000))

            return (
              <div key={row.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <StepIcon isFailed={row.isFailed} isCurrent={isCurrent} isLive={row.isLive} />
                  {!isLastRow && <div className="my-1 w-px flex-1 bg-white/[0.08]" />}
                </div>
                <div className={isLastRow ? 'min-w-0 flex-1 pb-1' : 'min-w-0 flex-1 pb-6'}>
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                    <p className="text-sm font-medium text-white/85">{row.title}</p>
                    <span className="shrink-0 text-xs text-white/30">
                      +{formatElapsed(elapsedSeconds)}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs leading-relaxed text-white/45">
                    {row.description}
                  </p>
                  {row.jobs && (
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
                        <JobStatusList jobs={row.jobs} />
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
