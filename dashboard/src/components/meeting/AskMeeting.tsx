import { useState, type FormEvent } from 'react'
import { Card } from '../ui/Card'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { SuggestedQuestion } from './SuggestedQuestion'
import { RagAnswer, type RagState } from './RagAnswer'

const SUGGESTED_QUESTIONS = [
  'What decisions were made?',
  'Who owns the action items?',
  'What did we decide about the database?',
  'What are the next steps?',
]

const MOCK_ANSWER =
  'We decided to migrate the database to PostgreSQL on Sunday. John will prepare the migration script before Friday.'

const MOCK_SOURCES = [
  {
    range: '02:14 – 02:38',
    excerpt: 'We discussed the current database and agreed that PostgreSQL would be better...',
  },
  {
    range: '03:05 – 03:22',
    excerpt: "Let's plan the migration for Sunday so we have a buffer before the week starts.",
  },
]

export function AskMeeting() {
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
            placeholder="Ask anything about this meeting..."
            aria-label="Ask this meeting"
            disabled={state === 'loading'}
            className="w-full"
          />
        </div>
        <Button type="submit" disabled={state === 'loading'} className="shrink-0 sm:w-auto">
          Ask <span aria-hidden="true">→</span>
        </Button>
      </form>

      <div className="mt-4 flex flex-wrap gap-2">
        {SUGGESTED_QUESTIONS.map((question) => (
          <SuggestedQuestion key={question} label={question} onClick={() => setQuery(question)} />
        ))}
      </div>

      <div className="mt-6 border-t border-white/[0.06] pt-6">
        <RagAnswer
          state={state}
          answer={MOCK_ANSWER}
          sources={MOCK_SOURCES}
          onRetry={() => runSearch(query)}
        />
      </div>
    </Card>
  )
}
