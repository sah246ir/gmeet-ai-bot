interface SuggestedQuestionProps {
  label: string
  onClick: () => void
}

export function SuggestedQuestion({ label, onClick }: SuggestedQuestionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-lg border border-white/10 bg-white/[0.02] px-3 py-1.5 text-xs text-white/55 transition-colors duration-200 hover:border-sky-400/25 hover:bg-sky-400/[0.05] hover:text-sky-300/90"
    >
      {label}
    </button>
  )
}
