interface TranscriptItemProps {
  speaker: string
  timestamp: string
  text: string
  active?: boolean
}

export function TranscriptItem({ speaker, timestamp, text, active = false }: TranscriptItemProps) {
  return (
    <div
      className={`flex gap-4 rounded-lg px-3 py-2.5 transition-colors duration-300 ${
        active ? 'bg-sky-400/[0.05]' : ''
      }`}
    >
      <div className="w-24 shrink-0 sm:w-28">
        <p className="text-sm font-medium text-white/70">{speaker}</p>
        <p className="text-xs text-white/30">{timestamp}</p>
      </div>
      <p className="text-sm leading-relaxed text-white/70">{text}</p>
    </div>
  )
}
