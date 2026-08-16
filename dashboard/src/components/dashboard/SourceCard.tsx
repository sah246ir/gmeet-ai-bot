interface SourceCardProps {
  label: string
  timestamp: string
}

export function SourceCard({ label, timestamp }: SourceCardProps) {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-white/55 transition-colors duration-200 hover:border-sky-400/25 hover:text-sky-300/90"
    >
      {label}
      <span className="text-white/25">·</span>
      <span className="text-sky-400/80">{timestamp}</span>
    </button>
  )
}
