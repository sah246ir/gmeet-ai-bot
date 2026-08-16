import { useState, type FormEvent } from 'react'
import { Card } from '../ui/Card'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { RagResult, type RagState } from './RagResult'

const MOCK_ANSWER =
  'PostgreSQL was chosen for the migration, with the migration planned for Sunday. John will prepare the migration script.'

const MOCK_SOURCES = [
  { label: 'Engineering Sync', timestamp: '02:14' },
  { label: 'Product Planning', timestamp: '18:42' },
]

export function RagSearch() {
  const [query, setQuery] = useState('')
  const [state, setState] = useState<RagState>('empty')

  function runSearch(value: string) {
    const trimmed = value.trim()
    if (!trimmed) return

    setState('loading')
    window.setTimeout(() => {
      const lower = trimmed.toLowerCase()
      if (lower.includes('error')) {
        setState('error')
      } else if (lower.includes('no results') || lower.includes('nothing')) {
        setState('no-results')
      } else {
        setState('success')
      }
    }, 1100)
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    runSearch(query)
  }

  return (
    <Card glow className="p-6 sm:p-8">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
        <div className="grow">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Ask anything about your meetings..."
            aria-label="Ask your meetings"
            disabled={state === 'loading'}
            className="w-full"
          />
        </div>
        <Button
          type="submit"
          disabled={state === 'loading'}
          className="shrink-0 sm:w-auto"
        >
          Ask <span aria-hidden="true">→</span>
        </Button>
      </form>

      <p className="mt-3 text-xs text-white/30">
        Search across all past and active meetings.
      </p>

      <div className="mt-6 border-t border-white/[0.06] pt-6">
        <RagResult
          state={state}
          answer={MOCK_ANSWER}
          sources={MOCK_SOURCES}
          onRetry={() => runSearch(query)}
        />
      </div>
    </Card>
  )
}
