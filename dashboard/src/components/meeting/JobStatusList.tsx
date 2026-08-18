import { Spinner } from '../ui/Spinner'
import { CheckIcon, ErrorIcon, PendingIcon } from './StatusIcons'
import type { Job, JobStatus, JobType } from '../../services/types'

const JOB_LABELS: Record<JobType, string> = {
  PROCESS_TRANSCRIPT: 'Processing transcript',
  GENERATE_EMBEDDINGS: 'Generating embeddings',
  INDEX_PINECONE: 'Indexing transcript',
  GENERATE_SUMMARY: 'Generating summary',
  EXTRACT_ACTION_ITEMS: 'Extracting action items',
}

function JobIcon({ status }: { status: JobStatus }) {
  if (status === 'COMPLETED') {
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
  if (status === 'RUNNING') {
    return <Spinner className="h-5 w-5 border-2 border-white/15 border-t-sky-400" />
  }
  return (
    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/[0.04] text-white/25">
      <PendingIcon className="h-2.5 w-2.5" />
    </span>
  )
}

interface JobStatusListProps {
  jobs: Job[]
}

export function JobStatusList({ jobs }: JobStatusListProps) {
  return (
    <div className="space-y-2">
      {jobs.map((job) => (
        <div key={job.id} className="flex items-center gap-2.5">
          <JobIcon status={job.status} />
          <span className="min-w-0 flex-1 truncate text-xs text-white/55">
            {JOB_LABELS[job.type]}
            {job.status === 'FAILED' && job.error ? ` — ${job.error}` : ''}
          </span>
        </div>
      ))}
    </div>
  )
}
