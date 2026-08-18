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
  // Job-type events never render in the main timeline (filtered into the
  // nested job accordion instead) - these only exist so the Record above is
  // exhaustive over every MeetingEvent value.
  PROCESS_TRANSCRIPT: { title: 'Processing transcript', description: '' },
  GENERATE_EMBEDDINGS: { title: 'Generating embeddings', description: '' },
  INDEX_PINECONE: { title: 'Indexing transcript', description: '' },
  GENERATE_SUMMARY: { title: 'Generating summary', description: '' },
  EXTRACT_ACTION_ITEMS: { title: 'Extracting action items', description: '' },
}

// Lifecycle events where there's still work in flight - only these get a
// spinning indicator while they're the current step. MEETING_PROCESSED stays
// current (and spinning) for the whole recording *and* background-processing
// window, since no further lifecycle event is logged until COMPLETED/FAILED.
const LIVE_EVENTS = new Set<MeetingEvent>([
  'STARTING',
  'CREATING_JOINEE_BOT',
  'JOINING_MEETING',
  'MEETING_PROCESSED',
])

function isLiveEvent(event: MeetingEvent): boolean {
  return LIVE_EVENTS.has(event)
}

function StepIcon({ event, isCurrent }: { event: MeetingEvent; isCurrent: boolean }) {
  if (event === 'FAILED') {
    return (
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-400/10 text-red-400">
        <ErrorIcon className="h-3 w-3" />
      </span>
    )
  }

  if (isCurrent && isLiveEvent(event)) {
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

export function StatusTimeline({ logs, startedAt }: StatusTimelineProps) {
  const lifecycleLogs = logs.filter((log) => !JOB_EVENTS.has(log.event))
  const chronological = [...lifecycleLogs].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  )
  const latest = chronological[chronological.length - 1]
  const latestId = latest?.id
  const isLatestLive = latest ? isLiveEvent(latest.event) : false

  const baseline = new Date(startedAt).getTime()
  const liveElapsed = useElapsedSeconds(startedAt, isLatestLive)

  // Job-type rows, reduced to the latest row per event type (chronological
  // Map insertion order keeps them in the order each step first started).
  const latestJobByEvent = new Map<MeetingEvent, MeetingStatusLog>()
  for (const log of [...logs].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())) {
    if (JOB_EVENTS.has(log.event)) latestJobByEvent.set(log.event, log)
  }
  const jobRows = Array.from(latestJobByEvent.values())
  const hasActiveJobs = jobRows.some((log) => log.status === 'PENDING')

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
            {latest && <span className="text-xs text-white/35">{STATUS_META[latest.event].title}</span>}
          </div>
        }
      >
        <div className="space-y-0">
          {chronological.map((log, index) => {
            const meta = STATUS_META[log.event]
            const isCurrent = log.id === latestId
            const isLastRow = index === chronological.length - 1
            const elapsedSeconds =
              isCurrent && isLatestLive
                ? liveElapsed
                : Math.max(0, Math.floor((new Date(log.createdAt).getTime() - baseline) / 1000))

            return (
              <div key={log.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <StepIcon event={log.event} isCurrent={isCurrent} />
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
                    {log.event === 'FAILED' && log.error ? log.error : meta.description}
                  </p>
                  {log.event === 'MEETING_PROCESSED' && jobRows.length > 0 && (
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
                        <JobStatusList jobs={jobRows} />
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
