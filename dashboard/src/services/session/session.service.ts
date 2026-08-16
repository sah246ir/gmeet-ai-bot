import { api, setSessionToken } from '../../lib/api'
import type { SessionCreated } from './session.types'

export async function createSession(): Promise<SessionCreated> {
  const { data } = await api.post<SessionCreated>('/session')
  setSessionToken(data.token)
  return data
}
