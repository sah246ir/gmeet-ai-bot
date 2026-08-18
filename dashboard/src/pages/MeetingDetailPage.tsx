import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Navbar } from '../components/Navbar'
import { Container } from '../components/ui/Container'
import { ConfirmationDialog } from '../components/ui/ConfirmationDialog'
import { SectionHeader } from '../components/dashboard/SectionHeader'
import { ErrorState } from '../components/dashboard/ErrorState'
import { Spinner } from '../components/ui/Spinner'
import { MeetingHeader } from '../components/meeting/MeetingHeader'
import { StatusTimeline } from '../components/meeting/StatusTimeline'
import { AskMeeting } from '../components/meeting/AskMeeting'
import { TranscriptList, type TranscriptState } from '../components/meeting/TranscriptList'
import { MeetingSummary, type SummaryState } from '../components/meeting/MeetingSummary'
import { useEndMeeting, useMeeting, useMeetingInsight, useMeetingTranscripts } from '../hooks/useMeetings'
import { useEnsureSession } from '../hooks/useSession'
import {
  deriveMeetingTitle,
  latestStatus,
  toLifecycleStatus,
} from '../lib/meetingDisplay'
import { formatElapsed } from '../mock/meetingDetail'
import type { MeetingInsight } from '../services/meeting/meeting.types'

const EMPTY_INSIGHT: MeetingInsight = {
  id: '',
  meetingId: '',
  overview: '',
  keyPoints: [],
  decisions: [],
  actionItems: [],
  speakerCount: 0,
  speakers: [],
  createdAt: '',
  updatedAt: '',
}

function BackgroundGlow() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
      <div className="absolute left-1/2 top-[-15%] h-[560px] w-[900px] -translate-x-1/2 animate-[glow-shift_16s_ease-in-out_infinite] rounded-full bg-sky-500/[0.06] blur-[130px]" />
    </div>
  )
}

export function MeetingDetailPage() {
  const { meetingId } = useParams<{ meetingId: string }>()
  const sessionQuery = useEnsureSession()
  const meetingQuery = useMeeting(meetingId)
  const meeting = meetingQuery.data
  const status = meeting ? latestStatus(meeting.statusLogs) : undefined
  const hasEnded = status === 'COMPLETED' || status === 'PROCESSING_MEETING'

  const summaryJob = meeting?.jobs.find((job) => job.type === 'GENERATE_SUMMARY')
  const insightQuery = useMeetingInsight(meetingId, summaryJob?.status === 'COMPLETED')

  const transcriptsQuery = useMeetingTranscripts(meetingId, !!meeting, !hasEnded)
  const endMeeting = useEndMeeting(meetingId)

  const [endDialogOpen, setEndDialogOpen] = useState(false)

  if (sessionQuery.isLoading || meetingQuery.isLoading) {
    return (
      <div className="relative flex min-h-svh flex-col overflow-hidden bg-[#05060a]">
        <BackgroundGlow />
        <Navbar />
        <main className="relative z-10 flex flex-1 items-center justify-center">
          <Spinner className="h-6 w-6 border-2 border-white/15 border-t-white/60" />
        </main>
      </div>
    )
  }

  if (meetingQuery.isError || !meeting || !meetingId) {
    return (
      <div className="relative flex min-h-svh flex-col overflow-hidden bg-[#05060a]">
        <BackgroundGlow />
        <Navbar />
        <main className="relative z-10 flex-1 py-14 sm:py-16">
          <Container>
            <ErrorState
              title="Couldn't load this meeting"
              description="It may not exist, or something went wrong while loading it."
              onRetry={() => meetingQuery.refetch()}
            />
          </Container>
        </main>
      </div>
    )
  }

  const lifecycleStatus = toLifecycleStatus(status!)

  const summaryState: SummaryState = !summaryJob
    ? 'locked'
    : summaryJob.status === 'FAILED'
      ? 'error'
      : summaryJob.status !== 'COMPLETED'
        ? 'processing'
        : insightQuery.isError
          ? 'error'
          : insightQuery.data
            ? 'completed'
            : 'processing'

  const transcriptState: TranscriptState = transcriptsQuery.isLoading
    ? 'loading'
    : transcriptsQuery.isError
      ? 'error'
      : (transcriptsQuery.data?.length ?? 0) === 0
        ? 'empty'
        : 'ready'

  const segments = (transcriptsQuery.data ?? []).map((segment) => {
    const speakerNumber = segment.words?.[0]?.speaker
    return {
      id: segment.id,
      speaker: speakerNumber !== undefined ? `Speaker ${speakerNumber + 1}` : 'Unknown speaker',
      timestamp: formatElapsed(segment.startTime),
      text: segment.text,
    }
  })

  return (
    <div className="relative flex min-h-svh flex-col overflow-hidden bg-[#05060a]">
      <BackgroundGlow />
      <Navbar />

      <main className="relative z-10 flex-1 py-14 sm:py-16">
        <Container>
          <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            {deriveMeetingTitle(meeting.url)}
          </h1>

          <div className="mt-4">
            <MeetingHeader
              url={meeting.url}
              hasEnded={hasEnded}
              onEndMeeting={() => setEndDialogOpen(true)}
            />
          </div>

          <section className="mt-10">
            <SectionHeader title="Meeting Insights" />
            <div className="mt-6">
              <MeetingSummary
                state={summaryState}
                summary={insightQuery.data ?? EMPTY_INSIGHT}
                onRetry={() => insightQuery.refetch()}
              />
            </div>
          </section>

          <div className="mt-10">
            <StatusTimeline logs={meeting.statusLogs} startedAt={meeting.createdAt} jobs={meeting.jobs} />
          </div>

          <section className="mt-16">
            <SectionHeader
              title="Ask this meeting"
              description="Ask questions about anything discussed in this meeting."
            />
            <div className="mt-6">
              <AskMeeting meetingId={meetingId} />
            </div>
          </section>

          <section className="mt-16">
            <SectionHeader title="Transcript" description="Live conversation" />
            <div className="mt-6">
              <TranscriptList
                state={transcriptState}
                segments={segments}
                isLive={lifecycleStatus === 'recording'}
                onRetry={() => transcriptsQuery.refetch()}
              />
            </div>
          </section>
        </Container>
      </main>

      <ConfirmationDialog
        open={endDialogOpen}
        title="End this meeting?"
        description="This will stop the Memora bot and begin processing the meeting transcript."
        confirmLabel="End Meeting"
        cancelLabel="Cancel"
        destructive
        onConfirm={() => {
          setEndDialogOpen(false)
          endMeeting.mutate(meetingId)
        }}
        onCancel={() => setEndDialogOpen(false)}
      />
    </div>
  )
}
