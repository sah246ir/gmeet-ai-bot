import { Skeleton } from '../ui/Skeleton'

interface LoadingStateProps {
  count?: number
  className?: string
}

export function LoadingState({ count = 2, className = 'grid grid-cols-1 gap-4 lg:grid-cols-2' }: LoadingStateProps) {
  return (
    <div className={className}>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-6 w-24 shrink-0 rounded-full" />
          </div>
          <div className="mt-6 flex items-center justify-between">
            <Skeleton className="h-3 w-14" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      ))}
    </div>
  )
}
