import { Link } from 'react-router-dom'
import { BrandMark } from '../components/ui/BrandMark'

export function DashboardPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 bg-[#05060a] text-white/70">
      <BrandMark className="h-8 w-8" />
      <p className="text-sm text-white/40">Dashboard coming soon.</p>
      <Link to="/" className="text-sm text-sky-400 hover:text-sky-300">
        Back to home
      </Link>
    </div>
  )
}
