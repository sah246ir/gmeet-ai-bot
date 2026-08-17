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
import { MeetingSummary } from '../components/meeting/MeetingSummary'
import { useEndMeeting, useMeeting, useMeetingTranscripts } from '../hooks/useMeetings'
import {
  deriveMeetingTitle,
  latestStatus,
  toLifecycleStatus,
} from '../lib/meetingDisplay'
import { formatElapsed, type SummaryData } from '../mock/meetingDetail'

const EMPTY_SUMMARY: SummaryData = { overview: '', keyPoints: [], decisions: [], actionItems: [] }

function BackgroundGlow() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
      <div className="absolute left-1/2 top-[-15%] h-[560px] w-[900px] -translate-x-1/2 animate-[glow-shift_16s_ease-in-out_infinite] rounded-full bg-sky-500/[0.06] blur-[130px]" />
    </div>
  )
}

export function MeetingDetailPage() {
  const { meetingId } = useParams<{ meetingId: string }>()
  const meetingQuery = useMeeting(meetingId)
  const meeting = meetingQuery.data
  const status = meeting ? latestStatus(meeting.statusLogs) : undefined

  const transcriptsQuery = useMeetingTranscripts(meetingId, !!meeting)
  const endMeeting = useEndMeeting(meetingId)

  const [endDialogOpen, setEndDialogOpen] = useState(false)

  if (meetingQuery.isLoading) {
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
  const hasEnded = status === 'COMPLETED' || status === 'PROCESSING_MEETING'

  const transcriptState: TranscriptState = transcriptsQuery.isLoading
    ? 'loading'
    : transcriptsQuery.isError
      ? 'error'
      : (transcriptsQuery.data?.length ?? 0) === 0
        ? 'empty'
        : 'ready'

  const segments = (transcriptsQuery.data ?? []).map((segment) => ({
    id: segment.id,
    speaker: segment.speakerId ?? 'Unknown speaker',
    timestamp: formatElapsed(segment.startTime),
    text: segment.text,
  }))

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

          <div className="mt-6">
            <StatusTimeline logs={meeting.statusLogs} startedAt={meeting.createdAt} />
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

          <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <SectionHeader title="Transcript" description="Live conversation" />
              <div className="mt-6">
                <TranscriptList
                  state={transcriptState}
                  segments={segments}
                  isLive={lifecycleStatus === 'recording'}
                  onRetry={() => transcriptsQuery.refetch()}
                />
              </div>
            </div>

            <div className="lg:col-span-1">
              <SectionHeader title="Meeting Summary" />
              <div className="mt-6">
                <MeetingSummary state="locked" summary={EMPTY_SUMMARY} />
              </div>
            </div>
          </div>
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
