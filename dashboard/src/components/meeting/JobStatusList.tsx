import { Spinner } from '../ui/Spinner'
import { CheckIcon, ErrorIcon } from './StatusIcons'
import type { MeetingEvent, MeetingLogStatus, MeetingStatusLog } from '../../services/types'

const JOB_LABELS: Partial<Record<MeetingEvent, string>> = {
  PROCESS_TRANSCRIPT: 'Processing transcript',
  GENERATE_EMBEDDINGS: 'Generating embeddings',
  INDEX_PINECONE: 'Indexing transcript',
  GENERATE_SUMMARY: 'Generating summary',
  EXTRACT_ACTION_ITEMS: 'Extracting action items',
}

function JobIcon({ status }: { status: MeetingLogStatus }) {
  if (status === 'SUCCESS') {
    return (
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-400/10 text-emerald-400">
        <CheckIcon className="h-2.5 w-2.5" />
      </span>
    )
  }
  if (status === 'FAILED') {
    return (
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-400/10 text-red-400">
        <ErrorIcon className="h-2.5 w-2.5" />
      </span>
    )
  }
  return <Spinner className="h-5 w-5 border-2 border-white/15 border-t-sky-400" />
}

interface JobStatusListProps {
  jobs: MeetingStatusLog[]
}

export function JobStatusList({ jobs }: JobStatusListProps) {
  return (
    <div className="space-y-2">
      {jobs.map((log) => (
        <div key={log.id} className="flex items-center gap-2.5">
          <JobIcon status={log.status} />
          <span className="min-w-0 flex-1 truncate text-xs text-white/55">
            {JOB_LABELS[log.event] ?? log.event}
            {log.status === 'FAILED' && log.error ? ` — ${log.error}` : ''}
          </span>
        </div>
      ))}
    </div>
  )
}
