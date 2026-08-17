import { useState, type FormEvent } from 'react'
import { Card } from '../ui/Card'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { RagResult, type RagState } from './RagResult'
import { useQuerySession } from '../../hooks/useAi'
import { isNoResultsAnswer } from '../../lib/meetingDisplay'

export function RagSearch() {
  const [query, setQuery] = useState('')
  const [state, setState] = useState<RagState>('empty')
  const [answer, setAnswer] = useState('')
  const querySession = useQuerySession()

  function runSearch(value: string) {
    const trimmed = value.trim()
    if (!trimmed) return

    setState('loading')
    querySession.mutate(trimmed, {
      onSuccess: (data) => {
        if (isNoResultsAnswer(data.answer)) {
          setState('no-results')
        } else {
          setAnswer(data.answer)
          setState('success')
        }
      },
      onError: () => {
        setState('error')
      },
    })
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
          answer={answer}
          sources={[]}
          onRetry={() => runSearch(query)}
        />
      </div>
    </Card>
  )
}
