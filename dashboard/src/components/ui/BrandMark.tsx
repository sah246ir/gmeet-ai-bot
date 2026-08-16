interface BrandMarkProps {
  className?: string
}

export function BrandMark({ className = 'h-6 w-6' }: BrandMarkProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      role="img"
      aria-label="Memora"
      className={className}
    >
      <rect
        x="1"
        y="1"
        width="30"
        height="30"
        rx="9"
        className="fill-white/[0.04] stroke-white/10"
        strokeWidth="1"
      />
      <path
        d="M16 6.5V10.5M16 21.5V25.5M6.5 16H10.5M21.5 16H25.5"
        className="stroke-white/15"
        strokeWidth="1"
        strokeLinecap="round"
      />
      <circle
        cx="16"
        cy="16"
        r="5.5"
        className="stroke-sky-400/70"
        strokeWidth="1.4"
      />
      <circle cx="16" cy="16" r="1.6" className="fill-sky-400" />
    </svg>
  )
}
