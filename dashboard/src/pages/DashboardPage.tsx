import { useRef } from 'react'
import { Navbar } from '../components/Navbar'
import { Container } from '../components/ui/Container'
import { Button } from '../components/ui/Button'
import { SectionHeader } from '../components/dashboard/SectionHeader'
import { EmptyState } from '../components/dashboard/EmptyState'
import { MeetingCard } from '../components/dashboard/MeetingCard'
import { MeetingInput } from '../components/dashboard/MeetingInput'
import { RagSearch } from '../components/dashboard/RagSearch'
import { initialActiveMeetings, initialPastMeetings } from '../mock/meetings'

function BackgroundGlow() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
      <div className="absolute left-1/2 top-[-15%] h-[560px] w-[900px] -translate-x-1/2 animate-[glow-shift_16s_ease-in-out_infinite] rounded-full bg-sky-500/[0.06] blur-[130px]" />
    </div>
  )
}

export function DashboardPage() {
  const activeMeetings = initialActiveMeetings
  const pastMeetings = initialPastMeetings

  const meetingInputRef = useRef<HTMLDivElement>(null)

  function scrollToMeetingInput() {
    meetingInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  const hasNoMeetingsAtAll = activeMeetings.length === 0 && pastMeetings.length === 0

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
            <MeetingInput onBringIn={() => {}} />
          </div>

          <section className="mt-16">
            <SectionHeader
              title="Active meetings"
              action={
                <span className="text-xs text-white/35">
                  {activeMeetings.length} active
                </span>
              }
            />
            <div className="mt-6">
              {activeMeetings.length === 0 ? (
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
                  {activeMeetings.map((meeting) => (
                    <MeetingCard
                      key={meeting.id}
                      variant="active"
                      id={meeting.id}
                      title={meeting.title}
                      url={meeting.url}
                      status={meeting.status}
                      durationLabel={meeting.durationLabel}
                      onEnd={() => {}}
                    />
                  ))}
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
              {pastMeetings.length === 0 ? (
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
                      title={meeting.title}
                      dateLabel={meeting.dateLabel}
                      chunksLabel={meeting.chunksLabel}
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
