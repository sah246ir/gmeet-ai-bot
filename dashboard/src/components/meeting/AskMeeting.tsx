import { useState, type FormEvent } from 'react'
import { Card } from '../ui/Card'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { SuggestedQuestion } from './SuggestedQuestion'
import { RagAnswer, type RagState } from './RagAnswer'
import { useQueryMeeting } from '../../hooks/useAi'
import { isNoResultsAnswer } from '../../lib/meetingDisplay'

const SUGGESTED_QUESTIONS = [
  'What decisions were made?',
  'Who owns the action items?',
  'What did we decide about the database?',
  'What are the next steps?',
]

interface AskMeetingProps {
  meetingId: string
}

export function AskMeeting({ meetingId }: AskMeetingProps) {
  const [query, setQuery] = useState('')
  const [state, setState] = useState<RagState>('empty')
  const [answer, setAnswer] = useState('')
  const queryMeeting = useQueryMeeting(meetingId)

  function runSearch(value: string) {
    const trimmed = value.trim()
    if (!trimmed) return

    setState('loading')
    queryMeeting.mutate(trimmed, {
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
          answer={answer}
          sources={[]}
          onRetry={() => runSearch(query)}
        />
      </div>
    </Card>
  )
}
