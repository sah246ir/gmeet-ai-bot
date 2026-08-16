interface ActionItemProps {
  owner: string
  task: string
  due: string
}

export function ActionItem({ owner, task, due }: ActionItemProps) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3">
      <div className="min-w-0">
        <p className="text-sm text-white/80">{task}</p>
        <p className="mt-0.5 text-xs text-white/35">{owner}</p>
      </div>
      <span className="shrink-0 text-xs text-white/30">{due}</span>
    </div>
  )
}
