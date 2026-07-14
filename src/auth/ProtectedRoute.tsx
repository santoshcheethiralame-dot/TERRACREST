import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import type { Role } from '@/domain/types'
import { useAuth } from '@/auth/AuthContext'

/** Gate: unauthenticated members are sent to the login, remembering intent. */
export function ProtectedRoute({ children, roles }: { children: ReactNode; roles?: Role[] }) {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />
  // Wrong role for this page → send them to their own home, never back to the
  // page they were just refused (that loops when the refused page is /studio).
  if (roles && !roles.includes(user.role)) return <Navigate to="/app" replace />

  return <>{children}</>
}
