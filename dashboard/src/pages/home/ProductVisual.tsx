interface TranscriptLine {
  width: string
  tag?: string
}

const transcriptLines: TranscriptLine[] = [
  { width: '92%' },
  { width: '78%' },
  { width: '85%', tag: 'Decision' },
  { width: '64%' },
  { width: '88%', tag: 'Action' },
  { width: '55%' },
]

interface PillProps {
  label: string
  accent?: boolean
  className?: string
  delay?: string
}

function Pill({ label, accent = false, className = '', delay = '0s' }: PillProps) {
  return (
    <span
      style={{ animationDelay: delay }}
      className={`absolute animate-[float_7s_ease-in-out_infinite] rounded-full border px-3 py-1.5 text-[11px] font-medium backdrop-blur-sm ${
        accent
          ? 'border-sky-400/25 bg-sky-400/[0.07] text-sky-300/90'
          : 'border-white/10 bg-white/[0.03] text-white/55'
      } ${className}`}
    >
      {label}
    </span>
  )
}

export function ProductVisual() {
  return (
    <div className="relative mx-auto w-full max-w-[440px] animate-[fade-in-up_0.8s_ease_0.15s_both] lg:mx-0">
      <div className="relative aspect-[4/3]">
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-0 h-full w-full"
          aria-hidden="true"
        >
          <path d="M12 14 L27 27" stroke="rgba(255,255,255,0.09)" strokeWidth="0.5" />
          <path d="M88 16 L73 28" stroke="rgba(255,255,255,0.09)" strokeWidth="0.5" />
          <path d="M10 84 L27 74" stroke="rgba(255,255,255,0.09)" strokeWidth="0.5" />
          <path d="M90 87 L76 73" stroke="rgba(56,189,248,0.3)" strokeWidth="0.6" />
        </svg>

        <Pill label="Conversation" className="left-0 top-[6%]" delay="0s" />
        <Pill label="Decisions" className="right-0 top-[10%]" delay="1.2s" />
        <Pill label="Action items" className="bottom-[10%] left-0" delay="0.6s" />
        <Pill label="Knowledge" accent className="bottom-[5%] right-0" delay="1.8s" />

        <div className="absolute inset-[17%] flex flex-col rounded-xl border border-white/[0.08] bg-[#0a0c14]/90 p-4 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6)]">
          <div className="mb-3 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-white/15" />
            <span className="h-1.5 w-1.5 rounded-full bg-white/15" />
            <span className="h-1.5 w-1.5 rounded-full bg-white/15" />
            <span className="ml-2 text-[10px] tracking-wide text-white/30">
              Transcript
            </span>
          </div>
          <div className="flex flex-1 flex-col justify-center gap-2.5">
            {transcriptLines.map((line) => (
              <div key={line.width + (line.tag ?? '')} className="flex items-center gap-2">
                <div
                  className={`h-1.5 rounded-full ${
                    line.tag ? 'bg-sky-400/30' : 'bg-white/10'
                  }`}
                  style={{ width: line.width }}
                />
                {line.tag && (
                  <span className="text-[9px] font-medium text-sky-300/70">
                    {line.tag}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
