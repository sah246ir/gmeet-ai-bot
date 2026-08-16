import { api } from '../../lib/api'
import type { QueryRequest, QueryResponse } from './ai.types'

export async function queryMeeting(meetingId: string, question: string): Promise<QueryResponse> {
  const body: QueryRequest = { question }
  const { data } = await api.post<QueryResponse>(`/meetings/${meetingId}/query`, body)
  return data
}

export async function querySession(question: string): Promise<QueryResponse> {
  const body: QueryRequest = { question }
  const { data } = await api.post<QueryResponse>('/session/query', body)
  return data
}
