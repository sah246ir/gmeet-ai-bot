import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Navbar } from '../components/Navbar'
import { Container } from '../components/ui/Container'
import { ConfirmationDialog } from '../components/ui/ConfirmationDialog'
import { SectionHeader } from '../components/dashboard/SectionHeader'
import { MeetingHeader } from '../components/meeting/MeetingHeader'
import { MeetingStatusIndicator } from '../components/meeting/MeetingStatusIndicator'
import { AskMeeting } from '../components/meeting/AskMeeting'
import { TranscriptList, type TranscriptState } from '../components/meeting/TranscriptList'
import { MeetingSummary, type SummaryState } from '../components/meeting/MeetingSummary'
import {
  resolveMeetingDetail,
  formatElapsed,
  MOCK_TRANSCRIPT_SEGMENTS,
  MOCK_SUMMARY,
  type MeetingLifecycleStatus,
  type TranscriptSegment,
} from '../mock/meetingDetail'

function BackgroundGlow() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
      <div className="absolute left-1/2 top-[-15%] h-[560px] w-[900px] -translate-x-1/2 animate-[glow-shift_16s_ease-in-out_infinite] rounded-full bg-sky-500/[0.06] blur-[130px]" />
    </div>
  )
}

function initialSegmentsFor(status: MeetingLifecycleStatus): TranscriptSegment[] {
  if (status === 'recording' || status === 'completed') return MOCK_TRANSCRIPT_SEGMENTS
  if (status === 'failed') return MOCK_TRANSCRIPT_SEGMENTS.slice(0, 3)
  return []
}

function initialTranscriptStateFor(status: MeetingLifecycleStatus): TranscriptState {
  return status === 'joining' ? 'empty' : 'ready'
}

function initialSummaryStateFor(status: MeetingLifecycleStatus): SummaryState {
  if (status === 'completed') return 'completed'
  if (status === 'failed') return 'error'
  return 'locked'
}

export function MeetingDetailPage() {
  const { meetingId } = useParams<{ meetingId: string }>()
  const seed = useMemo(() => resolveMeetingDetail(meetingId ?? ''), [meetingId])

  const [status, setStatus] = useState<MeetingLifecycleStatus>(seed.initialStatus)
  const [elapsedSeconds, setElapsedSeconds] = useState(seed.initialElapsedSeconds)
  const [segmentCount, setSegmentCount] = useState(seed.initialSegmentCount)
  const [segments, setSegments] = useState<TranscriptSegment[]>(() => initialSegmentsFor(seed.initialStatus))
  const [transcriptState, setTranscriptState] = useState<TranscriptState>(() =>
    initialTranscriptStateFor(seed.initialStatus),
  )
  const [summaryState, setSummaryState] = useState<SummaryState>(() =>
    initialSummaryStateFor(seed.initialStatus),
  )
  const [endDialogOpen, setEndDialogOpen] = useState(false)

  const streamingRef = useRef(false)

  useEffect(() => {
    if (status !== 'recording') return
    const interval = window.setInterval(() => setElapsedSeconds((s) => s + 1), 1000)
    return () => window.clearInterval(interval)
  }, [status])

  useEffect(() => {
    if (status !== 'joining') return
    const timer = window.setTimeout(() => {
      setStatus('recording')
      setTranscriptState('ready')
    }, 2600)
    return () => window.clearTimeout(timer)
  }, [status])

  useEffect(() => {
    if (status !== 'recording') return
    if (segments.length >= MOCK_TRANSCRIPT_SEGMENTS.length) return
    if (streamingRef.current) return

    streamingRef.current = true
    const timer = window.setTimeout(() => {
      streamingRef.current = false
      setSegments((prev) => {
        const next = MOCK_TRANSCRIPT_SEGMENTS[prev.length]
        return next ? [...prev, next] : prev
      })
      setSegmentCount((count) => count + 1)
    }, 2200)
    return () => {
      streamingRef.current = false
      window.clearTimeout(timer)
    }
  }, [status, segments])

  function handleEndMeeting() {
    setEndDialogOpen(false)
    setStatus('processing')
    setSummaryState('processing')
    window.setTimeout(() => {
      setStatus('completed')
      setSummaryState('completed')
      setTranscriptState('ready')
    }, 2600)
  }

  function handleRetryStatus() {
    setStatus('processing')
    setSummaryState('processing')
    window.setTimeout(() => {
      setStatus('completed')
      setSummaryState('completed')
      setTranscriptState('ready')
    }, 2200)
  }

  function handleRetrySummary() {
    setSummaryState('processing')
    window.setTimeout(() => setSummaryState('completed'), 1800)
  }

  function handleRetryTranscript() {
    setTranscriptState('ready')
  }

  const hasEnded = status === 'completed' || status === 'processing'

  return (
    <div className="relative flex min-h-svh flex-col overflow-hidden bg-[#05060a]">
      <BackgroundGlow />
      <Navbar />

      <main className="relative z-10 flex-1 py-14 sm:py-16">
        <Container>
          <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            {seed.title}
          </h1>

          <div className="mt-4">
            <MeetingHeader
              url={seed.url}
              hasEnded={hasEnded}
              onEndMeeting={() => setEndDialogOpen(true)}
            />
          </div>

          <div className="mt-8">
            <MeetingStatusIndicator
              status={status}
              elapsedLabel={`${formatElapsed(elapsedSeconds)} elapsed`}
              segmentLabel={`${segmentCount} transcript segment${segmentCount === 1 ? '' : 's'}`}
              onRetry={handleRetryStatus}
            />
          </div>

          <section className="mt-16">
            <SectionHeader
              title="Ask this meeting"
              description="Ask questions about anything discussed in this meeting."
            />
            <div className="mt-6">
              <AskMeeting />
            </div>
          </section>

          <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <SectionHeader title="Transcript" description="Live conversation" />
              <div className="mt-6">
                <TranscriptList
                  state={transcriptState}
                  segments={segments}
                  isLive={status === 'recording'}
                  onRetry={handleRetryTranscript}
                />
              </div>
            </div>

            <div className="lg:col-span-1">
              <SectionHeader title="Meeting Summary" />
              <div className="mt-6">
                <MeetingSummary state={summaryState} summary={MOCK_SUMMARY} onRetry={handleRetrySummary} />
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
        onConfirm={handleEndMeeting}
        onCancel={() => setEndDialogOpen(false)}
      />
    </div>
  )
}
