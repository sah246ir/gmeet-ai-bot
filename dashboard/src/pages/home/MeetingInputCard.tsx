import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Spinner } from '../../components/ui/Spinner'
import { useCreateMeeting } from '../../hooks/useMeetings'

export function MeetingInputCard() {
  const [url, setUrl] = useState('')
  const navigate = useNavigate()
  const createMeeting = useCreateMeeting()

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const trimmed = url.trim()
    if (!trimmed || createMeeting.isPending) return

    createMeeting.mutate(trimmed, {
      onSuccess: (meeting) => {
        navigate(`/meeting/${meeting.id}`)
      },
    })
  }

  return (
    <Card
      glow
      className="animate-[fade-in-up_0.8s_ease_0.25s_both] p-8 sm:p-10"
    >
      <h2 className="text-xl font-semibold text-white">Start with a meeting</h2>
      <p className="mt-2 text-sm leading-relaxed text-white/50">
        Paste a Google Meet link and turn the conversation into searchable
        knowledge.
      </p>

      <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-4">
        <Input
          type="url"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="https://meet.google.com/..."
          aria-label="Google Meet link"
          disabled={createMeeting.isPending}
          required
        />
        <Button type="submit" className="w-full" disabled={createMeeting.isPending}>
          {createMeeting.isPending ? (
            <>
              <Spinner className="h-4 w-4 border-2 border-[#05060a]/25 border-t-[#05060a]/70" />
              Bringing in bot...
            </>
          ) : (
            <>
              Continue
              <span aria-hidden="true">→</span>
            </>
          )}
        </Button>
      </form>

      {createMeeting.isError ? (
        <p className="mt-4 text-xs text-red-400/80">
          Couldn&apos;t bring in the bot. Check the link and try again.
        </p>
      ) : (
        <p className="mt-4 text-xs text-white/30">Google Meet links only</p>
      )}
    </Card>
  )
}
