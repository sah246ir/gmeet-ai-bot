import { useEffect } from 'react'
import { Container } from '../components/ui/Container'
import { Navbar } from '../components/Navbar'
import { ProductVisual } from './home/ProductVisual'
import { MeetingInputCard } from './home/MeetingInputCard'
import { createSession } from '../services/session/session.service'

function BackgroundGlow() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
      <div className="absolute left-1/2 top-[-15%] h-[560px] w-[900px] -translate-x-1/2 animate-[glow-shift_16s_ease-in-out_infinite] rounded-full bg-sky-500/[0.07] blur-[130px]" />
    </div>
  )
}

export function HomePage() {
  useEffect(() => {
    createSession().catch(() => {})
  }, [])

  return (
    <div className="relative flex min-h-svh flex-col overflow-hidden bg-[#05060a]">
      <BackgroundGlow />
      <Navbar />

      <main className="relative z-10 flex flex-1 flex-col justify-center py-16 lg:py-20">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="animate-[fade-in-up_0.7s_ease_both] text-[42px] font-semibold leading-[1.08] tracking-tight text-white sm:text-6xl md:text-[68px]">
              Your meetings.
              <br />
              <span className="text-white/90">Never </span>
              <span className="text-sky-400">forgotten.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-[540px] animate-[fade-in-up_0.7s_ease_0.1s_both] text-base leading-relaxed text-white/50 sm:text-lg">
              Memora turns conversations into searchable knowledge, so you
              can instantly find what was said, decided, and discussed.
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 items-center gap-12 lg:mt-24 lg:grid-cols-2 lg:gap-16">
            <ProductVisual />
            <MeetingInputCard />
          </div>
        </Container>
      </main>
    </div>
  )
}
