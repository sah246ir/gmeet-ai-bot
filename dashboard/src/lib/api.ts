import axios from 'axios'

const SESSION_TOKEN_STORAGE_KEY = 'memora_session_token'

export function getSessionToken(): string | null {
  return localStorage.getItem(SESSION_TOKEN_STORAGE_KEY)
}

export function setSessionToken(token: string): void {
  localStorage.setItem(SESSION_TOKEN_STORAGE_KEY, token)
}

export function clearSessionToken(): void {
  localStorage.removeItem(SESSION_TOKEN_STORAGE_KEY)
}

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

let sessionPromise: Promise<string> | null = null

async function ensureSessionToken(): Promise<string> {
  const existing = getSessionToken()
  if (existing) return existing

  if (!sessionPromise) {
    sessionPromise = api
      .post<{ token: string; expiresAt: string }>('/session')
      .then(({ data }) => {
        setSessionToken(data.token)
        return data.token
      })
      .finally(() => {
        sessionPromise = null
      })
  }

  return sessionPromise
}

api.interceptors.request.use(async (config) => {
  if (config.url === '/session') {
    const token = getSessionToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  }

  config.headers.Authorization = `Bearer ${await ensureSessionToken()}`
  return config
})
