import { useState } from 'react'
import { Button } from '../ui/Button'

interface MeetingHeaderProps {
  url: string
  hasEnded: boolean
  onEndMeeting: () => void
}

function CopyIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <rect x="7" y="7" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="1.3" />
      <path
        d="M13 7V5.5A1.5 1.5 0 0 0 11.5 4H4.5A1.5 1.5 0 0 0 3 5.5v7A1.5 1.5 0 0 0 4.5 14H6"
        stroke="currentColor"
        strokeWidth="1.3"
      />
    </svg>
  )
}

export function MeetingHeader({ url, hasEnded, onEndMeeting }: MeetingHeaderProps) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard?.writeText(url).catch(() => {})
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-2">
        <span className="truncate text-sm text-white/45">{url}</span>
        <div className="group relative shrink-0">
          <button
            type="button"
            onClick={handleCopy}
            aria-label="Copy meeting link"
            className="flex h-7 w-7 items-center justify-center rounded-md border border-white/10 text-white/40 transition-colors duration-200 hover:border-white/20 hover:text-white/70"
          >
            <CopyIcon className="h-3.5 w-3.5" />
          </button>
          <span
            role="tooltip"
            className="pointer-events-none absolute left-1/2 top-full z-10 mt-2 -translate-x-1/2 whitespace-nowrap rounded-md border border-white/10 bg-[#0a0c14] px-2 py-1 text-[11px] text-white/70 opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100"
          >
            {copied ? 'Copied' : 'Copy meeting link'}
          </span>
        </div>
      </div>

      {hasEnded ? (
        <span className="text-sm text-white/35">Meeting ended</span>
      ) : (
        <Button type="button" variant="destructive" onClick={onEndMeeting} className="shrink-0">
          End Meeting
        </Button>
      )}
    </div>
  )
}
