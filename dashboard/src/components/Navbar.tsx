import { Link, useLocation } from 'react-router-dom'
import { BrandMark } from './ui/BrandMark'
import { Container } from './ui/Container'

export function Navbar() {
  const { pathname } = useLocation()
  const isDashboard = pathname.startsWith('/dashboard')

  return (
    <header className="relative z-10">
      <Container className="flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <BrandMark className="h-6 w-6" />
          <span className="text-[15px] font-medium tracking-tight text-white/90">
            memora
          </span>
        </Link>
        <Link
          to="/dashboard"
          aria-current={isDashboard ? 'page' : undefined}
          className={`text-sm transition-colors duration-200 ${
            isDashboard ? 'text-white/90' : 'text-white/45 hover:text-white/80'
          }`}
        >
          Dashboard
        </Link>
      </Container>
    </header>
  )
}
