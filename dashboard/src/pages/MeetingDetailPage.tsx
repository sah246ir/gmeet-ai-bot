import { Link, useParams } from 'react-router-dom'
import { BrandMark } from '../components/ui/BrandMark'

export function MeetingDetailPage() {
  const { id } = useParams()

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 bg-[#05060a] px-6 text-center text-white/70">
      <BrandMark className="h-8 w-8" />
      <p className="text-sm text-white/40">
        Meeting detail coming soon{id ? ` — ${id}` : ''}.
      </p>
      <Link to="/dashboard" className="text-sm text-sky-400 hover:text-sky-300">
        Back to dashboard
      </Link>
    </div>
  )
}
