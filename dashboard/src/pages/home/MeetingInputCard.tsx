import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'

export function MeetingInputCard() {
  const [url, setUrl] = useState('')
  const navigate = useNavigate()

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    navigate('/dashboard')
  }

  return (
    <Card
      glow
      className="animate-[fade-in-up_0.8s_ease_0.25s_both] p-8 sm:p-10"
    >
      <h2 className="text-xl font-semibold text-white">Start with a meeting</h2>
      <p className="mt-2 text-sm leading-relaxed text-white/50">
        Paste a Google Meet link and turn the conversation into searchable
        knowledge.
      </p>

      <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-4">
        <Input
          type="url"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="https://meet.google.com/..."
          aria-label="Google Meet link"
          required
        />
        <Button type="submit" className="w-full">
          Continue
          <span aria-hidden="true">→</span>
        </Button>
      </form>

      <p className="mt-4 text-xs text-white/30">Google Meet links only</p>
    </Card>
  )
}
