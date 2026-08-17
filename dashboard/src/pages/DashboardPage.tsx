import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Navbar } from '../components/Navbar'
import { Container } from '../components/ui/Container'
import { Button } from '../components/ui/Button'
import { SectionHeader } from '../components/dashboard/SectionHeader'
import { EmptyState } from '../components/dashboard/EmptyState'
import { LoadingState } from '../components/dashboard/LoadingState'
import { ErrorState } from '../components/dashboard/ErrorState'
import { MeetingCard } from '../components/dashboard/MeetingCard'
import { MeetingInput } from '../components/dashboard/MeetingInput'
import { RagSearch } from '../components/dashboard/RagSearch'
import { useCreateMeeting, useEndMeeting, useMeetings } from '../hooks/useMeetings'
import {
  deriveMeetingTitle,
  formatElapsedSince,
  formatMeetingDate,
  isActiveMeeting,
  latestStatus,
  toDashboardStatus,
} from '../lib/meetingDisplay'

function BackgroundGlow() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
      <div className="absolute left-1/2 top-[-15%] h-[560px] w-[900px] -translate-x-1/2 animate-[glow-shift_16s_ease-in-out_infinite] rounded-full bg-sky-500/[0.06] blur-[130px]" />
    </div>
  )
}

export function DashboardPage() {
  const navigate = useNavigate()
  const meetingsQuery = useMeetings()
  const createMeeting = useCreateMeeting()
  const endMeeting = useEndMeeting()

  const meetingInputRef = useRef<HTMLDivElement>(null)

  function scrollToMeetingInput() {
    meetingInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  function handleBringIn(url: string) {
    createMeeting.mutate(url, {
      onSuccess: (meeting) => navigate(`/meeting/${meeting.id}`),
    })
  }

  const meetings = meetingsQuery.data ?? []
  const activeMeetings = meetings.filter((m) => isActiveMeeting(latestStatus(m.statusLogs)))
  const pastMeetings = meetings.filter((m) => !isActiveMeeting(latestStatus(m.statusLogs)))
  const hasNoMeetingsAtAll = meetingsQuery.isSuccess && meetings.length === 0

  return (
    <div className="relative flex min-h-svh flex-col overflow-hidden bg-[#05060a]">
      <BackgroundGlow />
      <Navbar />

      <main className="relative z-10 flex-1 py-14 sm:py-16">
        <Container>
          <div className="max-w-2xl">
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Your meetings
            </h1>
            <p className="mt-3 text-base leading-relaxed text-white/50">
              Bring a meeting into Memora and turn the conversation into
              searchable knowledge.
            </p>
          </div>

          <div ref={meetingInputRef} className="mt-10">
            <MeetingInput onBringIn={handleBringIn} />
          </div>

          <section className="mt-16">
            <SectionHeader
              title="Active meetings"
              action={
                meetingsQuery.isSuccess && (
                  <span className="text-xs text-white/35">
                    {activeMeetings.length} active
                  </span>
                )
              }
            />
            <div className="mt-6">
              {meetingsQuery.isLoading ? (
                <LoadingState count={2} />
              ) : meetingsQuery.isError ? (
                <ErrorState
                  title="Couldn't load your meetings"
                  description="Something went wrong while loading your meetings."
                  onRetry={() => meetingsQuery.refetch()}
                />
              ) : activeMeetings.length === 0 ? (
                <EmptyState
                  title="No active meetings"
                  description="Bring in a Google Meet to start capturing a conversation."
                  action={
                    <Button type="button" variant="ghost" onClick={scrollToMeetingInput}>
                      Bring in a meeting
                    </Button>
                  }
                />
              ) : (
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  {activeMeetings.map((meeting) => {
                    const status = latestStatus(meeting.statusLogs)
                    return (
                      <MeetingCard
                        key={meeting.id}
                        variant="active"
                        id={meeting.id}
                        title={deriveMeetingTitle(meeting.url)}
                        url={meeting.url}
                        status={toDashboardStatus(status) as 'joining' | 'active' | 'processing' | 'failed'}
                        durationLabel={
                          status === 'STARTING' || status === 'CREATING_JOINEE_BOT' || status === 'JOINING_MEETING'
                            ? 'Starting...'
                            : formatElapsedSince(meeting.createdAt)
                        }
                        onEnd={() => endMeeting.mutate(meeting.id)}
                      />
                    )
                  })}
                </div>
              )}
            </div>
          </section>

          <section className="mt-16">
            <SectionHeader
              title="Ask your meetings"
              description="Search across everything you've discussed in Memora."
            />
            <div className="mt-6">
              {hasNoMeetingsAtAll ? (
                <EmptyState
                  title="Your meeting memory starts here"
                  description="Once you have meetings in Memora, ask questions across all of them."
                />
              ) : (
                <RagSearch />
              )}
            </div>
          </section>

          <section className="mt-16">
            <SectionHeader title="Past meetings" description="Your meeting history" />
            <div className="mt-6">
              {meetingsQuery.isLoading ? (
                <LoadingState count={3} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" />
              ) : meetingsQuery.isError ? (
                <ErrorState
                  title="Couldn't load your meetings"
                  description="Something went wrong while loading your meetings."
                  onRetry={() => meetingsQuery.refetch()}
                />
              ) : pastMeetings.length === 0 ? (
                <EmptyState
                  title="No meetings yet"
                  description="Your completed meetings will appear here."
                />
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {pastMeetings.map((meeting) => (
                    <MeetingCard
                      key={meeting.id}
                      variant="past"
                      id={meeting.id}
                      title={deriveMeetingTitle(meeting.url)}
                      dateLabel={formatMeetingDate(meeting.createdAt)}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>
        </Container>
      </main>
    </div>
  )
}
