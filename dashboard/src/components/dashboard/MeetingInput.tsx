import { useState, type FormEvent } from 'react'
import { Card } from '../ui/Card'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { Spinner } from '../ui/Spinner'

type MeetingInputStatus = 'idle' | 'connecting' | 'error'

const MEET_URL_PATTERN = /^https:\/\/meet\.google\.com\//i

interface MeetingInputProps {
  onBringIn: (url: string) => void
}

function InfoIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <circle cx="10" cy="10" r="8.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M10 9v5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="10" cy="6.5" r="0.9" fill="currentColor" />
    </svg>
  )
}

export function MeetingInput({ onBringIn }: MeetingInputProps) {
  const [url, setUrl] = useState('')
  const [status, setStatus] = useState<MeetingInputStatus>('idle')

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const trimmed = url.trim()
    if (!trimmed || status === 'connecting') return

    setStatus('connecting')
    window.setTimeout(() => {
      if (MEET_URL_PATTERN.test(trimmed)) {
        onBringIn(trimmed)
        setUrl('')
        setStatus('idle')
      } else {
        setStatus('error')
      }
    }, 1400)
  }

  return (
    <Card glow className="p-6 sm:p-8">
      <h2 className="text-lg font-semibold text-white sm:text-xl">Bring in a meeting</h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/50">
        Paste a Google Meet link and Memora will join the meeting, capture the
        conversation, and make it searchable afterward.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Input
          type="url"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="https://meet.google.com/..."
          aria-label="Google Meet link"
          disabled={status === 'connecting'}
          className="sm:flex-1"
        />
        <Button
          type="submit"
          disabled={status === 'connecting'}
          className="shrink-0 sm:w-auto"
        >
          {status === 'connecting' ? (
            <>
              <Spinner className="h-4 w-4 border-2 border-[#05060a]/25 border-t-[#05060a]/70" />
              Bringing in bot...
            </>
          ) : (
            <>
              Bring in the bot <span aria-hidden="true">→</span>
            </>
          )}
        </Button>
      </form>

      {status === 'connecting' && (
        <p className="mt-3 flex items-center gap-2 text-xs text-white/45">
          <Spinner className="h-3 w-3 border-[1.5px] border-white/20 border-t-white/70" />
          Connecting to Google Meet...
        </p>
      )}

      {status === 'error' ? (
        <div className="mt-5 flex flex-col items-start gap-3 rounded-lg border border-red-400/15 bg-red-400/[0.03] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-medium text-white/70">Couldn&apos;t bring in the bot</p>
            <p className="mt-0.5 text-xs text-white/40">
              Check the Google Meet link and try again.
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            onClick={() => setStatus('idle')}
            className="!px-3 !py-1.5 text-xs"
          >
            Try again
          </Button>
        </div>
      ) : (
        <div className="mt-5 flex items-start gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3">
          <InfoIcon className="mt-0.5 h-4 w-4 shrink-0 text-white/30" />
          <p className="text-xs leading-relaxed text-white/40">
            <span className="font-medium text-white/55">Before you start:</span>{' '}
            You&apos;ll need to allow the Memora bot to join your Google Meet. Make
            sure participants can admit the bot when prompted.
          </p>
        </div>
      )}
    </Card>
  )
}
