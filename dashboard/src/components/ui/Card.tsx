import type { HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  glow?: boolean
}

export function Card({ glow = false, className = '', children, ...props }: CardProps) {
  return (
    <div
      className={`relative rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-sm ${
        glow ? 'shadow-[0_0_70px_-20px_rgba(56,132,255,0.28)]' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
