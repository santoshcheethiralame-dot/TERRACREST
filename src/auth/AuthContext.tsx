import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { User } from '@/domain/types'
import { repo } from '@/data/repository'
import { setTokens, configureAuth } from '@/data/api'
import { useLang } from '@/i18n/LanguageContext'

/* ============================================================
   Auth — real JWT semantics against the backend when enabled,
   the same mock semantics on the seed when not. Holds an
   access + refresh token pair; the api client refreshes the
   access token silently, and this context persists the result.
   ============================================================ */

interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
  login: (username: string, password: string) => Promise<User | null>
  logout: () => void
}

const AuthContext = createContext<AuthState | undefined>(undefined)
const STORAGE_KEY = 'terracrest.session'

interface Persisted {
  user: User
  accessToken: string | null
  refreshToken: string | null
}

function readSession(): Persisted | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const p = JSON.parse(raw)
    if (p && p.user) return { user: p.user, accessToken: p.accessToken ?? p.token ?? null, refreshToken: p.refreshToken ?? null }
    if (p && p.id) return { user: p as User, accessToken: null, refreshToken: null } // tolerate older bare-user shape
    return null
  } catch {
    return null
  }
}

function persist(user: User, accessToken: string | null, refreshToken: string | null): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ user, accessToken, refreshToken }))
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { t } = useLang()
  const [user, setUser] = useState<User | null>(() => {
    const session = readSession()
    if (session) setTokens(session.accessToken, session.refreshToken)
    return session?.user ?? null
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    configureAuth({
      onAuthChange: (access, refresh) => {
        const current = readSession()
        if (current) persist(current.user, access, refresh)
      },
      onLogout: () => {
        setUser(null)
        setTokens(null, null)
        localStorage.removeItem(STORAGE_KEY)
      },
    })
  }, [])

  const login = async (username: string, password: string): Promise<User | null> => {
    setLoading(true)
    setError(null)
    let result: Awaited<ReturnType<typeof repo.authenticate>>
    try {
      result = await repo.authenticate(username, password)
    } catch {
      setLoading(false)
      setError(t('login.errorServer'))
      return null
    }
    setLoading(false)
    if (result) {
      setUser(result.user)
      setTokens(result.accessToken, result.refreshToken)
      persist(result.user, result.accessToken, result.refreshToken)
      return result.user
    }
    setError(t('login.errorCredentials'))
    return null
  }

  const logout = () => {
    setUser(null)
    setTokens(null, null)
    localStorage.removeItem(STORAGE_KEY)
  }

  return <AuthContext.Provider value={{ user, loading, error, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
