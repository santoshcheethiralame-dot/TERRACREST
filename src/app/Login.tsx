import { useEffect, useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '@/auth/AuthContext'
import { MassingArt } from '@/components/MassingArt'
import { rise, stagger } from '@/lib/motion'

const DEMO = [
  { u: 'builder_rajesh_001', label: 'Builder' },
  { u: 'landowner_ramanathan_002', label: 'Land Owner' },
  { u: 'investor_khanna_005', label: 'Investor' },
]

export function Login() {
  const { login, loading, error, user } = useAuth()
  const nav = useNavigate()
  const loc = useLocation()
  const from = (loc.state as { from?: string } | null)?.from ?? '/app'

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  useEffect(() => {
    if (user) nav(from, { replace: true })
  }, [user, from, nav])

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const u = await login(username.trim(), password)
    if (u) nav(from, { replace: true })
  }

  return (
    <main className="grain relative grid min-h-screen grid-cols-1 lg:grid-cols-[1.05fr_0.95fr]">
      {/* left — the statement panel */}
      <section className="dotgrid relative hidden overflow-hidden border-r border-line lg:block">
        <div className="bloom pointer-events-none absolute inset-0" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <Link to="/" className="flex items-baseline gap-2.5">
            <span className="h-2 w-2 shrink-0 self-center bg-accent" aria-hidden />
            <span className="font-display text-[1.05rem] font-bold tracking-tight2 text-ink">TERRACREST</span>
          </Link>

          <MassingArt className="mx-auto w-full max-w-[440px] opacity-80" />

          <div>
            <p className="font-display text-4xl font-semibold leading-[1.02] tracking-tight2 text-ink xl:text-5xl">
              The market you were
              <br />
              <span className="text-beam">never meant to see.</span>
            </p>
            <p className="mono mt-6 text-[0.7rem] tracking-widest text-ink-faint">
              BY INVITATION ONLY · 20–200 PRINCIPALS · BENGALURU
            </p>
          </div>
        </div>
      </section>

      {/* right — the access terminal */}
      <section className="relative grid place-items-center px-6 py-16">
        <motion.div variants={stagger(0.1, 0.09)} initial="hidden" animate="show" className="w-full max-w-md">
          <motion.div variants={rise} className="mb-10 lg:hidden">
            <Link to="/" className="flex items-baseline gap-2.5">
              <span className="h-2 w-2 shrink-0 self-center bg-accent" aria-hidden />
              <span className="font-display text-[1.05rem] font-bold tracking-tight2 text-ink">TERRACREST</span>
            </Link>
          </motion.div>

          <motion.p variants={rise} className="label text-accent">
            Member access
          </motion.p>
          <motion.h1 variants={rise} className="mt-5 font-display text-5xl font-semibold tracking-tight2 text-ink">
            State your name.
          </motion.h1>
          <motion.p variants={rise} className="mt-4 text-sm text-ink-faint">
            Credentials are issued by the desk after in-person KYC.
          </motion.p>

          <motion.form variants={rise} onSubmit={submit} className="mt-10">
            <div className="space-y-6">
              <Field label="Username" value={username} onChange={setUsername} placeholder="builder_______" autoFocus />
              <Field label="Password" value={password} onChange={setPassword} type="password" placeholder="••••••••" />
            </div>

            {error && <p className="mt-5 text-[0.82rem] leading-snug text-oxblood-bright">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="label mt-8 w-full bg-accent py-4 text-paper transition-colors hover:bg-accent-bright disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Verifying…' : 'Enter →'}
            </button>

            <p className="mono mt-6 text-center text-[0.68rem] leading-relaxed tracking-widest text-ink-faint">
              NO SIGN-UP · NO OTP · NO ONLINE RESET
            </p>
          </motion.form>

          <motion.div variants={rise} className="mt-10 border-t border-line pt-8">
            <p className="label mb-3 text-ink-faint">Demo access — password "demo"</p>
            <div className="grid grid-cols-3 gap-2">
              {DEMO.map((d) => (
                <button
                  key={d.u}
                  type="button"
                  onClick={() => {
                    setUsername(d.u)
                    setPassword('demo')
                  }}
                  className="label border border-line px-2 py-3 text-[0.58rem] text-ink-dim transition-colors hover:border-[color:var(--line-accent)] hover:text-accent"
                >
                  {d.label}
                </button>
              ))}
            </div>
          </motion.div>

          <motion.div variants={rise} className="mt-10">
            <Link to="/" className="label text-ink-faint transition-colors hover:text-ink">
              ← Return
            </Link>
          </motion.div>
        </motion.div>
      </section>
    </main>
  )
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  autoFocus,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
  placeholder?: string
  autoFocus?: boolean
}) {
  return (
    <label className="block">
      <span className="label text-ink-faint">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        autoComplete="off"
        className="mono mt-2.5 w-full border border-line bg-transparent px-4 py-3.5 text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-[color:var(--accent)]"
      />
    </label>
  )
}
