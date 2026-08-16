interface SpinnerProps {
  className?: string
}

export function Spinner({ className = 'h-4 w-4 border-[1.5px] border-white/20 border-t-white/70' }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={`inline-block shrink-0 animate-spin rounded-full ${className}`}
    />
  )
}
