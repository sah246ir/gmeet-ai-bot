import { useState, type ReactNode } from 'react'

interface AccordionProps {
  title: ReactNode
  defaultOpen?: boolean
  className?: string
  bodyClassName?: string
  children: ReactNode
}

function ChevronIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden="true">
      <path
        d="M4.5 6L8 9.5L11.5 6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function Accordion({
  title,
  defaultOpen = true,
  className = '',
  bodyClassName = 'mt-4',
  children,
}: AccordionProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className={className}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 rounded-lg text-left transition-opacity duration-150 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/15"
      >
        {title}
        <ChevronIcon
          className={`h-4 w-4 shrink-0 text-white/40 transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>
      {open && <div className={bodyClassName}>{children}</div>}
    </div>
  )
}
