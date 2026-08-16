import type { ReactNode } from 'react'

interface SummarySectionProps {
  title: string
  children: ReactNode
}

export function SummarySection({ title, children }: SummarySectionProps) {
  return (
    <div>
      <h3 className="text-xs font-medium uppercase tracking-wide text-white/30">{title}</h3>
      <div className="mt-3">{children}</div>
    </div>
  )
}
