import { Button } from '../ui/Button'

interface ErrorStateProps {
  title: string
  description: string
  actionLabel?: string
  onRetry?: () => void
}

export function ErrorState({ title, description, actionLabel = 'Try again', onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-red-400/10 bg-red-400/[0.03] px-6 py-10 text-center">
      <div className="space-y-1">
        <p className="text-sm font-medium text-white/80">{title}</p>
        <p className="mx-auto max-w-[320px] text-sm leading-relaxed text-white/45">
          {description}
        </p>
      </div>
      {onRetry && (
        <Button type="button" variant="ghost" onClick={onRetry} className="mt-1 !px-4 !py-2 text-xs">
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
