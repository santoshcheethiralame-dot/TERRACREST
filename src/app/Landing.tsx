import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MassingArt } from '@/components/MassingArt'
import { Redaction } from '@/components/Redaction'
import { EASE, fade, rise, stagger, inView } from '@/lib/motion'

export function Landing() {
  return (
    <div className="grain relative min-h-screen bg-paper text-ink">
      <TopBar />
      <Hero />
      <Marquee />
      <StatsBand />
      <Platform />
      <StudioTease />
      <Protocol />
      <Footer />
    </div>
  )
}

/* ----------------------------------------------------------------- top bar */
function TopBar() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-line bg-paper/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-shell items-center justify-between px-6 py-4 md:px-10">
        <Link to="/" className="flex items-baseline gap-2.5">
          <span className="h-2 w-2 shrink-0 self-center bg-accent" aria-hidden />
          <span className="font-display text-[1.05rem] font-bold tracking-tight2 text-ink">TERRACREST</span>
        </Link>
        <nav className="flex items-center gap-8">
          <a href="#platform" className="label hidden text-ink-faint transition-colors hover:text-ink md:block">
            Platform
          </a>
          <a href="#intelligence" className="label hidden text-ink-faint transition-colors hover:text-ink md:block">
            Intelligence
          </a>
          <a href="#access" className="label hidden text-ink-faint transition-colors hover:text-ink md:block">
            Access
          </a>
          <Link to="/login" className="label bg-accent px-5 py-3 text-paper transition-colors duration-300 hover:bg-accent-bright">
            Member Access ↗
          </Link>
        </nav>
      </div>
    </header>
  )
}

/* --------------------------------------------------------------------- hero */
function RevealLine({ children, delay }: { children: ReactNode; delay: number }) {
  return (
    <span className="block overflow-hidden pb-[0.06em]">
      <motion.span
        className="block"
        initial={{ y: '112%' }}
        animate={{ y: 0 }}
        transition={{ duration: 1.15, delay, ease: EASE }}
      >
        {children}
      </motion.span>
    </span>
  )
}

function Hero() {
  return (
    <section className="dotgrid relative overflow-hidden">
      <div className="bloom pointer-events-none absolute inset-0" />
      <div className="relative mx-auto grid max-w-shell grid-cols-1 items-center gap-14 px-6 pb-16 pt-36 md:px-10 md:pt-48 lg:grid-cols-[1.12fr_0.88fr] lg:pb-24">
        {/* statement */}
        <div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.9, delay: 0.15 }}
            className="label text-accent"
          >
            By invitation only — 20–200 principals — Bengaluru
          </motion.p>

          <h1 className="mt-8 font-display text-[clamp(3.3rem,7.4vw,7.6rem)] font-semibold leading-[0.94] tracking-[-0.04em] text-ink">
            <RevealLine delay={0.25}>The market</RevealLine>
            <RevealLine delay={0.35}>you were never</RevealLine>
            <RevealLine delay={0.45}>
              <span className="text-beam">meant to see.</span>
            </RevealLine>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.95, delay: 0.85, ease: EASE }}
            className="mt-9 max-w-xl text-lg leading-relaxed text-ink-dim"
          >
            A private, non-bypassable advisory for land that never lists. Every parcel is walked and verified on the
            ground. Every principal is known to us in person. Introductions are made under signature — never brokered
            in the open.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.95, delay: 1.0, ease: EASE }}
            className="mt-11 flex flex-wrap items-center gap-5"
          >
            <Link
              to="/login"
              className="label group inline-flex items-center gap-3 bg-accent px-8 py-4 text-paper shadow-glow transition-colors duration-300 hover:bg-accent-bright"
            >
              Request an introduction
              <span className="transition-transform duration-500 group-hover:translate-x-1">→</span>
            </Link>
            <Link to="/login" className="label inline-flex items-center gap-2 border border-line px-6 py-4 text-ink-dim transition-colors hover:border-[color:var(--line-accent)] hover:text-ink">
              Member access
            </Link>
          </motion.div>
        </div>

        {/* the massing — drawn, not photographed */}
        <motion.div variants={fade} initial="hidden" animate="show" transition={{ delay: 0.5 }} className="relative">
          <MassingArt className="mx-auto w-full max-w-[620px]" />
        </motion.div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ marquee */
const TAPE = [
  'Joint development',
  'Warehouse',
  'Big land',
  'Verified on the ground',
  'Sealed until signed',
  'Zero public listings',
  'Bengaluru',
]

function Marquee() {
  const row = (key: string) => (
    <div key={key} className="flex shrink-0 items-center">
      {TAPE.map((t) => (
        <span key={t} className="label flex items-center whitespace-nowrap py-5 text-ink-faint">
          <span className="mx-7">{t}</span>
          <span className="text-accent">◆</span>
        </span>
      ))}
    </div>
  )
  return (
    <div className="overflow-hidden border-y border-line">
      <div className="animate-marquee flex w-max">{[row('a'), row('b')]}</div>
    </div>
  )
}

/* -------------------------------------------------------------- stats band */
const STATS = [
  { k: '20–200', v: 'Principals, ever' },
  { k: '100%', v: 'In-person KYC' },
  { k: '0.88', v: 'Valuation model R²' },
  { k: 'Zero', v: 'Public listings' },
]

function StatsBand() {
  return (
    <section>
      <motion.div
        variants={stagger(0.1, 0.12)}
        initial="hidden"
        whileInView="show"
        viewport={inView}
        className="mx-auto grid max-w-shell grid-cols-2 divide-x divide-y divide-[color:var(--line)] md:grid-cols-4 md:divide-y-0"
      >
        {STATS.map((s) => (
          <motion.div key={s.v} variants={fade} className="px-8 py-14 text-center">
            <div className="font-display text-5xl font-semibold tracking-tight2 text-ink md:text-6xl">{s.k}</div>
            <div className="label mt-4 text-ink-faint">{s.v}</div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}

/* ----------------------------------------------------------- the platform */
function Platform() {
  return (
    <section id="platform" className="border-t border-line">
      <div className="mx-auto max-w-shell px-6 py-24 md:px-10 md:py-32">
        <motion.div variants={stagger()} initial="hidden" whileInView="show" viewport={inView}>
          <motion.p variants={rise} className="label text-accent">
            The platform
          </motion.p>
          <motion.h2 variants={rise} className="mt-6 max-w-3xl font-display text-5xl font-semibold tracking-tight2 text-ink md:text-7xl">
            Not a portal.
            <br />A principal.
          </motion.h2>
        </motion.div>

        <div className="mt-24 space-y-24 md:space-y-32">
          <Row n="01" title="Walked before it's shown." visual={<ManifestVisual />}>
            No parcel goes live until our team walks the land, inspects the title chain, and confirms every survey
            number against the record. Nothing here is scraped, syndicated, or self-listed — the book is small because
            the bar is high.
          </Row>

          <Row n="02" title="Sealed until it's signed." visual={<DossierVisual />} flip>
            Location, ownership, and the document vault are withheld by the server itself — not hidden in the
            interface. They unseal only when a witnessed NDA is logged by the desk, so the introduction cannot be
            bypassed, screenshotted, or scraped.
          </Row>

          <Row n="03" title="Priced by a model that learns." visual={<ModelVisual />}>
            A parametric engine models every parcel's development value live — then a learned model corrects it,
            trained on what our empanelled architects actually sign. Every delivery sharpens the corpus. The number
            comes with calibrated uncertainty, never false precision.
          </Row>

          <Row n="04" title="Signed off by a human." visual={<ArchitectVisual />} flip>
            Machine speed, human credibility. Commission the empanelled architect from the Studio and a stamped,
            buildable figure returns beside the model's — variance shown, drawings issued to your deal room.
          </Row>
        </div>
      </div>
    </section>
  )
}

function Row({ n, title, children, visual, flip }: { n: string; title: string; children: ReactNode; visual: ReactNode; flip?: boolean }) {
  return (
    <motion.div
      variants={stagger(0.1, 0.12)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.25 }}
      className="grid grid-cols-1 gap-10 md:grid-cols-[88px_1fr] md:gap-6"
    >
      {/* numeral rail */}
      <motion.div variants={fade} className="flex items-start gap-5 md:flex-col md:gap-6">
        <span className="mono text-xl text-accent">{n}</span>
        <span className="hidden h-full w-px bg-[color:var(--line)] md:block" />
        <span className="block h-px flex-1 bg-[color:var(--line)] md:hidden" />
      </motion.div>

      <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-20">
        <motion.div variants={rise} className={flip ? 'lg:order-2' : ''}>
          <h3 className="font-display text-4xl font-semibold tracking-tight2 text-ink md:text-5xl">{title}</h3>
          <p className="mt-6 max-w-lg text-[1.02rem] leading-relaxed text-ink-dim">{children}</p>
        </motion.div>
        <motion.div variants={rise} className={flip ? 'lg:order-1' : ''}>
          {visual}
        </motion.div>
      </div>
    </motion.div>
  )
}

/* --- row visuals ---------------------------------------------------------- */
function Frame({ children, caption }: { children: ReactNode; caption: string }) {
  return (
    <figure className="border border-line bg-paper-raise/60 shadow-deep">
      <figcaption className="flex items-center justify-between border-b border-line px-5 py-3.5">
        <span className="label text-ink-faint">{caption}</span>
        <span className="flex gap-1.5" aria-hidden>
          <span className="h-1 w-1 bg-[color:var(--line-strong)]" />
          <span className="h-1 w-1 bg-[color:var(--line-strong)]" />
          <span className="h-1 w-1 bg-accent" />
        </span>
      </figcaption>
      <div className="p-6">{children}</div>
    </figure>
  )
}

function ManifestVisual() {
  const rows = [
    ['Title chain traced', '30 yrs · clean'],
    ['Survey nos. cross-checked', 'DTP record'],
    ['Encumbrance certificate', 'nil charges'],
    ['Site walked', '12 Jun 2026'],
  ]
  return (
    <Frame caption="Verification manifest · JD-BLR-2026-012">
      <ul className="divide-y divide-[color:var(--line)]">
        {rows.map(([k, v]) => (
          <li key={k} className="flex items-center justify-between gap-6 py-3.5">
            <span className="flex items-center gap-3 text-[0.95rem] text-ink">
              <span className="text-emerald-bright" aria-hidden>
                ✓
              </span>
              {k}
            </span>
            <span className="mono text-[0.72rem] text-ink-faint">{v}</span>
          </li>
        ))}
      </ul>
      <p className="label mt-5 text-emerald-bright">Physically verified — Terracrest site team</p>
    </Frame>
  )
}

function DossierVisual() {
  return (
    <Frame caption="Sealed dossier · pre-NDA view">
      <dl className="divide-y divide-[color:var(--line)]">
        <VRow term="Location">
          <Redaction>Sector 4, Devanahalli</Redaction>
        </VRow>
        <VRow term="Owner of record">
          <Redaction>Ramanathan Holdings LLP</Redaction>
        </VRow>
        <VRow term="Survey no.">
          <Redaction>141/2B, 141/3</Redaction>
        </VRow>
        <VRow term="Guidance (GDV)">
          <span className="mono text-gold">₹85–95 Cr</span>
        </VRow>
      </dl>
      <p className="mt-5 text-[0.8rem] leading-relaxed text-ink-faint">
        The sealed fields never leave the server without a logged NDA — there is nothing in the page to inspect.
      </p>
    </Frame>
  )
}

function VRow({ term, children }: { term: string; children: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-6 py-3.5">
      <dt className="label text-ink-faint">{term}</dt>
      <dd className="text-right text-[0.95rem] text-ink">{children}</dd>
    </div>
  )
}

function ModelVisual() {
  const bars = [
    ['High-rise premium floors', 92, 'lowers'],
    ['FSI', 57, 'lowers'],
    ['Sale price assumption', 47, 'lowers'],
    ['Floor-plate efficiency', 25, 'raises'],
  ] as const
  return (
    <Frame caption="Valuation model · ridge regression">
      <div className="flex items-baseline justify-between">
        <span className="mono text-3xl text-ink">R² 0.88</span>
        <span className="label text-ink-faint">holdout</span>
      </div>
      <div className="mt-6 space-y-3">
        {bars.map(([label, w, dir]) => (
          <div key={label} className="flex items-center gap-3">
            <span className="w-44 shrink-0 text-[0.8rem] text-ink-dim">{label}</span>
            <span className="relative h-1.5 flex-1 bg-[color:var(--line)]">
              <span className={`absolute inset-y-0 left-0 ${dir === 'raises' ? 'bg-emerald-bright' : 'bg-accent'}`} style={{ width: `${w}%` }} />
            </span>
          </div>
        ))}
      </div>
      <p className="mono mt-6 text-[0.72rem] text-ink-faint">Every architect delivery becomes a labelled training example.</p>
    </Frame>
  )
}

function ArchitectVisual() {
  return (
    <Frame caption="Stage two · architect validation">
      <div className="grid grid-cols-2 gap-px border border-line bg-[color:var(--line)]">
        <div className="bg-paper p-5">
          <p className="label text-ink-faint">Studio model</p>
          <p className="mono mt-2 text-2xl text-ink">₹86.2 Cr</p>
        </div>
        <div className="bg-paper p-5">
          <p className="label text-accent">Architect · stamped</p>
          <p className="mono mt-2 text-2xl text-beam">₹83.4 Cr</p>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between border border-line px-5 py-3">
        <span className="label text-ink-faint">Variance to model</span>
        <span className="mono text-sm text-oxblood-bright">−3.2%</span>
      </div>
      <p className="mono mt-5 text-[0.72rem] text-ink-faint">Sundaram &amp; Associates · CoA CA/2011/48210 · drawings issued</p>
    </Frame>
  )
}

/* ------------------------------------------------------------- studio tease */
function StudioTease() {
  return (
    <section id="intelligence" className="border-t border-line">
      <div className="mx-auto grid max-w-shell grid-cols-1 items-center gap-16 px-6 py-24 md:px-10 md:py-32 lg:grid-cols-[1fr_0.95fr]">
        <motion.div variants={stagger()} initial="hidden" whileInView="show" viewport={inView}>
          <motion.p variants={rise} className="label text-accent">
            The feasibility studio
          </motion.p>
          <motion.h2 variants={rise} className="mt-6 font-display text-5xl font-semibold leading-[0.98] tracking-tight2 text-ink md:text-7xl">
            Model the profit
            <br />
            before the fee.
          </motion.h2>
          <motion.p variants={rise} className="mt-7 max-w-xl text-lg leading-relaxed text-ink-dim">
            Draw a parcel's massing from its own by-laws, assign materials surface by surface, and watch a three-zone
            development value resolve live — corrected by the model, banded by its uncertainty.
          </motion.p>
          <motion.div variants={rise} className="mt-10">
            <Link
              to="/login"
              className="label group inline-flex items-center gap-3 bg-accent px-8 py-4 text-paper transition-colors duration-300 hover:bg-accent-bright"
            >
              Enter the studio
              <span className="transition-transform duration-500 group-hover:translate-x-1">→</span>
            </Link>
          </motion.div>
        </motion.div>

        <motion.div variants={fade} initial="hidden" whileInView="show" viewport={inView}>
          <TickerMock />
        </motion.div>
      </div>
    </section>
  )
}

function TickerMock() {
  return (
    <div className="blueprint border border-line shadow-deep">
      <div className="flex items-center justify-between border-b border-line px-6 py-4">
        <span className="mono text-[0.72rem] text-ink-dim">JD-BLR-2026-012 · DEVANAHALLI</span>
        <span className="label text-emerald-bright">● Live</span>
      </div>
      <div className="px-6 py-8">
        <p className="label text-ink-faint">ML-adjusted NDV · market</p>
        <p className="mt-3 font-display text-6xl font-semibold tracking-tight2 text-beam md:text-7xl">₹84.1 Cr</p>
        <p className="mono mt-3 text-[0.78rem] text-ink-dim">
          P10–P90 ₹82.0–86.2 Cr · <span className="text-oxblood-bright">−2.6%</span> vs parametric
        </p>
        <div className="mt-8 grid grid-cols-3 gap-px border border-line bg-[color:var(--line)]">
          {(
            [
              ['Bear', '₹70.1 Cr', 'text-oxblood-bright'],
              ['Base', '₹86.3 Cr', 'text-gold'],
              ['Bull', '₹98.8 Cr', 'text-emerald-bright'],
            ] as const
          ).map(([z, v, tone]) => (
            <div key={z} className="bg-paper px-4 py-4">
              <p className={`label ${tone}`}>{z}</p>
              <p className="mono mt-2 text-sm text-ink">{v}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ----------------------------------------------------------------- protocol */
const STEPS = [
  {
    n: '01',
    t: 'Introduction',
    b: 'Referred by an existing principal. KYC is completed in person, at the desk — never online.',
  },
  {
    n: '02',
    t: 'Signature',
    b: 'One witnessed NDA per parcel, executed before our lawyer. Nothing digital to leak or forward.',
  },
  {
    n: '03',
    t: 'The desk opens',
    b: 'The dossier unseals: exact location, ownership, the document vault, the deal room, the studio.',
  },
]

function Protocol() {
  return (
    <section id="access" className="border-t border-line">
      <div className="mx-auto max-w-shell px-6 py-24 md:px-10 md:py-32">
        <motion.div variants={stagger()} initial="hidden" whileInView="show" viewport={inView}>
          <motion.p variants={rise} className="label text-accent">
            Access
          </motion.p>
          <motion.h2 variants={rise} className="mt-6 font-display text-5xl font-semibold tracking-tight2 text-ink md:text-7xl">
            The protocol.
          </motion.h2>
        </motion.div>

        <motion.div
          variants={stagger(0.15, 0.14)}
          initial="hidden"
          whileInView="show"
          viewport={inView}
          className="mt-16 grid grid-cols-1 gap-px overflow-hidden border border-line bg-[color:var(--line)] md:grid-cols-3"
        >
          {STEPS.map((s) => (
            <motion.article key={s.n} variants={rise} className="group bg-paper px-8 py-12 transition-colors duration-500 hover:bg-paper-raise">
              <span className="mono text-xl text-accent">{s.n}</span>
              <h3 className="mt-8 font-display text-3xl font-semibold tracking-tight2 text-ink">{s.t}</h3>
              <p className="mt-4 text-[0.98rem] leading-relaxed text-ink-dim">{s.b}</p>
            </motion.article>
          ))}
        </motion.div>

        <motion.div variants={fade} initial="hidden" whileInView="show" viewport={inView} className="mt-14 flex flex-wrap items-center gap-6">
          <Link
            to="/login"
            className="label group inline-flex items-center gap-3 bg-accent px-8 py-4 text-paper shadow-glow transition-colors duration-300 hover:bg-accent-bright"
          >
            Request an introduction
            <span className="transition-transform duration-500 group-hover:translate-x-1">→</span>
          </Link>
          <p className="mono text-[0.72rem] text-ink-faint">No sign-up · No OTP · No public listings</p>
        </motion.div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------- footer */
function Footer() {
  return (
    <footer className="relative overflow-hidden bg-navy text-paper">
      <div className="mx-auto max-w-shell px-6 pb-10 pt-20 md:px-10">
        <div className="flex flex-col justify-between gap-10 md:flex-row md:items-end">
          <div>
            <p className="flex items-baseline gap-2.5">
              <span className="h-2 w-2 shrink-0 self-center bg-gold" aria-hidden />
              <span className="font-display text-lg font-bold tracking-tight2 text-paper">TERRACREST</span>
            </p>
            <p className="mono mt-4 max-w-sm text-[0.7rem] leading-relaxed tracking-widest text-paper/50">
              A PRIVATE DEAL PORTAL, NOT A LISTING SERVICE.
              <br />
              ALL PARCELS PHYSICALLY INSPECTED.
            </p>
          </div>
          <nav className="flex flex-wrap gap-x-10 gap-y-3">
            <a href="#platform" className="label text-paper/55 transition-colors hover:text-paper">
              Platform
            </a>
            <a href="#intelligence" className="label text-paper/55 transition-colors hover:text-paper">
              Intelligence
            </a>
            <a href="#access" className="label text-paper/55 transition-colors hover:text-paper">
              Access
            </a>
            <Link to="/login" className="label text-gold-bright transition-colors hover:text-gold">
              Member access ↗
            </Link>
          </nav>
          <p className="mono text-[0.7rem] tracking-widest text-paper/50">BENGALURU · © MMXXVI</p>
        </div>

        {/* the watermark — gold-struck wordmark sinking into the forest */}
        <div
          aria-hidden
          className="text-outline pointer-events-none mt-16 select-none whitespace-nowrap text-center font-display text-[clamp(3.6rem,12.5vw,11.5rem)] font-bold leading-none tracking-[-0.05em]"
          style={{ maskImage: 'linear-gradient(to bottom, black 45%, transparent 96%)', WebkitMaskImage: 'linear-gradient(to bottom, black 45%, transparent 96%)' }}
        >
          TERRACREST
        </div>
      </div>
    </footer>
  )
}
