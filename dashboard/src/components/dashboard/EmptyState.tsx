import type { ReactNode } from 'react'

interface EmptyStateProps {
  title: string
  description: string
  action?: ReactNode
}

function DefaultIcon() {
  return (
    <svg viewBox="0 0 32 32" fill="none" className="h-8 w-8 text-white/20" aria-hidden="true">
      <rect x="4" y="8" width="24" height="17" rx="4" stroke="currentColor" strokeWidth="1.4" />
      <path d="M4 13h24" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="11" cy="18.5" r="1.3" fill="currentColor" />
      <circle cx="16" cy="18.5" r="1.3" fill="currentColor" />
      <circle cx="21" cy="18.5" r="1.3" fill="currentColor" />
    </svg>
  )
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.015] px-6 py-14 text-center">
      <DefaultIcon />
      <div className="space-y-1">
        <p className="text-sm font-medium text-white/70">{title}</p>
        <p className="mx-auto max-w-[320px] text-sm leading-relaxed text-white/40">
          {description}
        </p>
      </div>
      {action}
    </div>
  )
}
