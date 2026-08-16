interface SourceCardProps {
  range: string
  excerpt: string
}

export function SourceCard({ range, excerpt }: SourceCardProps) {
  return (
    <button
      type="button"
      className="block w-full rounded-lg border border-white/[0.08] bg-white/[0.02] px-4 py-3 text-left transition-colors duration-200 hover:border-sky-400/20 hover:bg-white/[0.03]"
    >
      <span className="text-xs font-medium text-sky-400/80">{range}</span>
      <p className="mt-1 text-sm leading-relaxed text-white/50">{excerpt}</p>
    </button>
  )
}
