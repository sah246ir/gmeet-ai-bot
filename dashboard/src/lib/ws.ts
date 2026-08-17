export function getWebSocketUrl(): string {
  return import.meta.env.VITE_API_URL.replace(/^http/, 'ws')
}
