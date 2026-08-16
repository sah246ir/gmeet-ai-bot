import type { ButtonHTMLAttributes } from 'react'

type ButtonVariant = 'primary' | 'ghost' | 'destructive'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
}

const base =
  'inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#05060a] disabled:pointer-events-none disabled:opacity-40'

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-white px-5 py-3 text-[#05060a] shadow-[0_0_0_1px_rgba(255,255,255,0.06)] hover:bg-white/90 focus-visible:ring-white/40',
  ghost:
    'px-4 py-2 text-white/70 hover:bg-white/[0.04] hover:text-white focus-visible:ring-white/20',
  destructive:
    'border border-red-500/25 bg-red-500/10 px-5 py-3 text-red-300 hover:border-red-500/35 hover:bg-red-500/15 hover:text-red-200 focus-visible:ring-red-400/30',
}

export function Button({
  variant = 'primary',
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props} />
  )
}
