import { useEffect, useState } from 'react'

export function useElapsedSeconds(sinceIso: string | undefined, isTicking: boolean): number {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (!isTicking || !sinceIso) return
    const interval = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(interval)
  }, [sinceIso, isTicking])

  if (!sinceIso) return 0
  return Math.max(0, Math.floor((now - new Date(sinceIso).getTime()) / 1000))
}
