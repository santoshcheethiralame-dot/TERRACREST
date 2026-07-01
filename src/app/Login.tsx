import { useEffect, useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '@/auth/AuthContext'
import { Seal } from '@/components/Seal'
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
    <main className="grain blueprint relative grid min-h-screen place-items-center px-6 py-16">
      <div className="pointer-events-none absolute inset-0 vignette" />
      <motion.div variants={stagger(0.1, 0.09)} initial="hidden" animate="show" className="relative w-full max-w-md">
        <motion.div variants={rise} className="mb-8 flex flex-col items-center text-center">
          <Seal size={54} />
          <p className="label mt-5 text-ivory-faint">DB Terracrest Advisory</p>
        </motion.div>

        <motion.form variants={rise} onSubmit={submit} className="border border-line bg-ink-raise/70 p-8 shadow-deep backdrop-blur-sm">
          <div className="mb-8 h-px w-full" style={{ background: 'linear-gradient(90deg, var(--gold), var(--emerald-bright))' }} />
          <h1 className="font-display text-3xl text-ivory">Member access</h1>
          <p className="mt-2 text-sm text-ivory-faint">Enter your admin-issued credentials.</p>

          <div className="mt-7 space-y-5">
            <Field label="Username" value={username} onChange={setUsername} placeholder="builder_______" autoFocus />
            <Field label="Password" value={password} onChange={setPassword} type="password" placeholder="••••••••" />
          </div>

          {error && <p className="mt-5 text-[0.82rem] leading-snug text-oxblood-bright">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="label mt-7 w-full bg-gold py-4 text-ink transition-colors hover:bg-gold-bright disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Verifying…' : 'Enter →'}
          </button>

          <p className="mt-6 text-center text-[0.72rem] leading-relaxed text-ivory-faint">
            No sign-up · No OTP · No online password reset.
            <br />
            Access is by invitation. Speak to your relationship manager.
          </p>
        </motion.form>

        <motion.div variants={rise} className="mt-6">
          <p className="label mb-3 text-center text-ivory-faint">Demo access — any password</p>
          <div className="grid grid-cols-3 gap-2">
            {DEMO.map((d) => (
              <button
                key={d.u}
                type="button"
                onClick={() => {
                  setUsername(d.u)
                  setPassword('demo')
                }}
                className="label border border-line px-2 py-2.5 text-[0.58rem] text-ivory-dim transition-colors hover:border-[color:var(--line-gold)] hover:text-gold"
              >
                {d.label}
              </button>
            ))}
          </div>
        </motion.div>

        <motion.div variants={rise} className="mt-8 text-center">
          <Link to="/" className="label text-ivory-faint transition-colors hover:text-ivory">
            ← Return
          </Link>
        </motion.div>
      </motion.div>
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
      <span className="label text-ivory-faint">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        autoComplete="off"
        className="mono mt-2 w-full border border-line bg-ink px-4 py-3 text-ivory outline-none transition-colors placeholder:text-ivory-faint focus:border-[color:var(--line-gold)]"
      />
    </label>
  )
}
