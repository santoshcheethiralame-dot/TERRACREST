import type { ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { Role } from '@/domain/types'
import { useAuth } from '@/auth/AuthContext'
import { useLang } from '@/i18n/LanguageContext'
import { LangToggle } from '@/components/LangToggle'

/** Shared chrome for authenticated screens: crest, member identity, sign-out. */
export function AppShell({ children, nav }: { children: ReactNode; nav?: ReactNode }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { t } = useLang()

  const roleLabel: Record<Role, string> = {
    builder: t('role.builder'),
    landowner: t('role.landowner'),
    investor: t('role.investor'),
    admin: t('role.deskShort'),
  }

  const onLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="grain min-h-screen bg-paper text-ink">
      <header className="sticky top-0 z-40 border-b border-line bg-paper/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-shell items-center justify-between px-6 py-4 md:px-10">
          <div className="flex items-center gap-8">
            <Link to="/app" className="flex items-baseline gap-2.5">
              <span className="h-2 w-2 shrink-0 self-center bg-accent" aria-hidden />
              <span className="font-display text-[0.98rem] font-bold tracking-tight2 text-ink">TERRACREST</span>
            </Link>
            {nav}
          </div>
          <div className="flex items-center gap-4">
            {user && (
              <div className="hidden text-right sm:block">
                <p className="mono text-[0.72rem] text-ink">{user.displayName.split('·')[0].trim()}</p>
                <p className="label text-ink-faint">{roleLabel[user.role]}</p>
              </div>
            )}
            <LangToggle />
            <button
              onClick={onLogout}
              className="label border border-line px-4 py-2.5 text-ink-faint transition-colors hover:border-[color:var(--line-accent)] hover:text-accent"
            >
              {t('appshell.signOut')}
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-shell px-6 py-10 md:px-10 md:py-14">{children}</main>
    </div>
  )
}
