/* ============================================================
   Thin HTTP client for the FastAPI backend. Enabled only when
   VITE_API_URL is set — otherwise the repository falls back to
   the in-memory seed. Silently refreshes an expired access
   token on a 401 and retries once, so sessions never drop
   mid-use; if the refresh itself fails, it triggers logout.
   ============================================================ */

export const API_URL = (import.meta.env.VITE_API_URL ?? '').trim().replace(/\/$/, '')
export const apiEnabled = API_URL.length > 0

let accessToken: string | null = null
let refreshToken: string | null = null
let onAuthChange: ((access: string | null, refresh: string | null) => void) | null = null
let onLogout: (() => void) | null = null

export function setTokens(access: string | null, refresh: string | null): void {
  accessToken = access
  refreshToken = refresh
}

/** Let the auth context persist silently-refreshed tokens and force logout. */
export function configureAuth(cb: {
  onAuthChange?: (access: string | null, refresh: string | null) => void
  onLogout?: () => void
}): void {
  onAuthChange = cb.onAuthChange ?? null
  onLogout = cb.onLogout ?? null
}

export class ApiError extends Error {
  constructor(public status: number, message?: string) {
    super(message ?? `API error ${status}`)
    this.name = 'ApiError'
  }
}

async function doRefresh(): Promise<boolean> {
  if (!refreshToken) return false
  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })
    if (!res.ok) return false
    const data = (await res.json()) as { accessToken: string; refreshToken?: string }
    accessToken = data.accessToken
    refreshToken = data.refreshToken ?? refreshToken
    onAuthChange?.(accessToken, refreshToken)
    return true
  } catch {
    return false
  }
}

async function authedFetch(path: string, init?: RequestInit, retry = true): Promise<Response> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
  })
  // Access token expired mid-session → refresh once and retry, transparently.
  if (res.status === 401 && retry && refreshToken && !path.startsWith('/auth/')) {
    if (await doRefresh()) return authedFetch(path, init, false)
    onLogout?.()
  }
  return res
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await authedFetch(path, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
  })
  if (!res.ok) throw new ApiError(res.status)
  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}

/** Fetch a binary response (e.g. a PDF) with auth + silent refresh, return an object URL. */
export async function getBlobUrl(path: string): Promise<string> {
  const res = await authedFetch(path)
  if (!res.ok) throw new ApiError(res.status)
  return URL.createObjectURL(await res.blob())
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body: body === undefined ? undefined : JSON.stringify(body) }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PATCH', body: body === undefined ? undefined : JSON.stringify(body) }),
}
