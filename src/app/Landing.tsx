import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Seal } from '@/components/Seal'
import { Redaction } from '@/components/Redaction'
import { rise, fade, stagger, inView } from '@/lib/motion'

export function Landing() {
  return (
    <div className="grain relative min-h-screen bg-ink text-ivory">
      <TopBar />
      <Hero />
      <Difference />
      <StatsBand />
      <StudioTease />
      <Footer />
    </div>
  )
}

/* ----------------------------------------------------------------- top bar */
function TopBar() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-line bg-ink/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-shell items-center justify-between px-6 py-4 md:px-10">
        <Link to="/" className="flex items-center gap-3">
          <Seal size={26} />
          <span className="label text-ivory-dim">DB Terracrest Advisory</span>
        </Link>
        <nav className="flex items-center gap-8">
          <a href="#difference" className="label hidden text-ivory-faint transition-colors hover:text-ivory sm:block">
            The Difference
          </a>
          <Link
            to="/login"
            className="label border border-[color:var(--line-gold)] px-4 py-2.5 text-gold transition-colors duration-500 hover:bg-gold hover:text-ink"
          >
            Member Access ↗
          </Link>
        </nav>
      </div>
    </header>
  )
}

/* --------------------------------------------------------------------- hero */
function Hero() {
  return (
    <section className="blueprint relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 vignette" />
      <div className="relative mx-auto grid max-w-shell grid-cols-1 gap-16 px-6 pb-24 pt-40 md:grid-cols-[1.15fr_0.85fr] md:items-center md:px-10 md:pb-32 md:pt-52">
        {/* left — statement */}
        <motion.div variants={stagger(0.15, 0.11)} initial="hidden" animate="show">
          <motion.p variants={rise} className="label text-gold">
            By Invitation Only · 20–200 Principals · Bengaluru
          </motion.p>

          <motion.h1
            variants={rise}
            className="mt-8 font-display text-[3.4rem] leading-[0.95] tracking-tight text-ivory sm:text-7xl lg:text-8xl"
          >
            The market you were
            <br />
            <span className="italic text-gilt">never meant to see.</span>
          </motion.h1>

          <motion.p variants={rise} className="mt-9 max-w-xl text-lg leading-relaxed text-ivory-dim">
            A private, non-bypassable advisory for land that never lists. Every parcel is walked and
            verified on the ground. Every principal is known to us in person. Introductions are made
            under signature — never brokered in the open.
          </motion.p>

          <motion.div variants={rise} className="mt-11 flex flex-wrap items-center gap-5">
            <Link
              to="/login"
              className="label group inline-flex items-center gap-3 bg-gold px-8 py-4 text-ink transition-all duration-500 hover:bg-gold-bright"
            >
              Request an Introduction
              <span className="transition-transform duration-500 group-hover:translate-x-1">→</span>
            </Link>
            <Link to="/login" className="label inline-flex items-center gap-2 text-ivory-dim transition-colors hover:text-ivory">
              Member Access
            </Link>
          </motion.div>
        </motion.div>

        {/* right — the dossier card (redaction demonstrated) */}
        <motion.div variants={fade} initial="hidden" animate="show" transition={{ delay: 0.9 }}>
          <DossierCard />
        </motion.div>
      </div>
    </section>
  )
}

function DossierCard() {
  return (
    <figure className="relative border border-line bg-ink-raise/80 shadow-deep backdrop-blur-sm">
      {/* corner ticks */}
      <Corner className="left-0 top-0" />
      <Corner className="right-0 top-0 rotate-90" />
      <Corner className="bottom-0 left-0 -rotate-90" />
      <Corner className="bottom-0 right-0 rotate-180" />

      <figcaption className="flex items-center justify-between border-b border-line px-6 py-4">
        <span className="mono text-[0.72rem] tracking-widest text-ivory-dim">JD-BLR-2026-012</span>
        <span className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-bright" />
          <span className="label text-emerald-bright">Verified · Live</span>
        </span>
      </figcaption>

      {/* mini site plan */}
      <div className="border-b border-line px-6 py-5">
        <SitePlanThumb />
      </div>

      <dl className="divide-y divide-[color:var(--line)] px-6">
        <Row term="Location">
          <Redaction>Sector 4, Devanahalli</Redaction>
          <span className="ml-2 text-ivory-faint">· Bengaluru N.</span>
        </Row>
        <Row term="Owner of Record">
          <Redaction>Ramanathan Holdings LLP</Redaction>
        </Row>
        <Row term="Survey No.">
          <Redaction>141/2B, 141/3</Redaction>
        </Row>
        <Row term="Guidance (GDV)">
          <span className="mono text-gold">₹85–95 Cr</span>
        </Row>
      </dl>

      <div className="flex items-center gap-3 border-t border-line px-6 py-4">
        <LockGlyph />
        <p className="text-[0.82rem] leading-snug text-ivory-faint">
          Location and identity unseal only upon an executed, witnessed NDA.
        </p>
      </div>
    </figure>
  )
}

function Row({ term, children }: { term: string; children: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-6 py-3.5">
      <dt className="label text-ivory-faint">{term}</dt>
      <dd className="text-right text-[0.95rem] text-ivory">{children}</dd>
    </div>
  )
}

function SitePlanThumb() {
  return (
    <svg viewBox="0 0 260 130" className="h-auto w-full" role="img" aria-label="Parcel massing schematic">
      {/* parcel boundary */}
      <rect x="10" y="10" width="240" height="110" fill="none" stroke="#c9a227" strokeOpacity="0.55" />
      {/* setback line */}
      <rect x="28" y="26" width="204" height="78" fill="none" stroke="#c9a227" strokeOpacity="0.28" strokeDasharray="3 4" />
      {/* towers */}
      {[46, 104, 162].map((x) => (
        <rect key={x} x={x} y="40" width="44" height="50" fill="#c9a227" fillOpacity="0.09" stroke="#c9a227" strokeOpacity="0.5" />
      ))}
      {/* dimension line */}
      <line x1="10" y1="126" x2="250" y2="126" stroke="#726d61" strokeWidth="0.5" />
      <text x="130" y="123" textAnchor="middle" fill="#726d61" fontFamily="'IBM Plex Mono', monospace" fontSize="6">
        ~2.35 LAKH SQ FT BUILDABLE · FSI 2.25
      </text>
      {/* north arrow */}
      <g transform="translate(238 30)" stroke="#726d61" strokeWidth="0.6" fill="none">
        <path d="M0 12 L0 0 M-3 3 L0 0 L3 3" />
        <text x="-2.5" y="22" fill="#726d61" fontFamily="'IBM Plex Mono', monospace" fontSize="6">N</text>
      </g>
    </svg>
  )
}

function Corner({ className = '' }: { className?: string }) {
  return (
    <span className={`pointer-events-none absolute ${className}`} aria-hidden>
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M0 0 H14 M0 0 V14" stroke="#c9a227" strokeOpacity="0.6" />
      </svg>
    </span>
  )
}

function LockGlyph() {
  return (
    <svg width="14" height="16" viewBox="0 0 14 16" fill="none" className="shrink-0" aria-hidden>
      <rect x="1.5" y="6.5" width="11" height="8" rx="0.5" stroke="#726d61" />
      <path d="M4 6.5V4a3 3 0 0 1 6 0v2.5" stroke="#726d61" />
    </svg>
  )
}

/* --------------------------------------------------------------- difference */
const PILLARS = [
  {
    n: '01',
    title: 'Physically verified',
    body: 'No parcel goes live until our team walks the land, inspects the title, and confirms every survey number against the record. Nothing here is scraped or self-listed.',
  },
  {
    n: '02',
    title: 'Non-bypassable',
    body: 'Buyer and seller meet only after a witnessed NDA. The platform is the unavoidable principal to the introduction — protected in writing, enforceable in court.',
  },
  {
    n: '03',
    title: 'Feasibility before fees',
    body: 'A parametric GDV studio models a parcel’s profit in three zones — before an architect is ever engaged, or a rupee committed.',
  },
]

function Difference() {
  return (
    <section id="difference" className="border-t border-line px-6 py-28 md:px-10 md:py-36">
      <div className="mx-auto max-w-shell">
        <motion.div variants={stagger()} initial="hidden" whileInView="show" viewport={inView}>
          <motion.p variants={rise} className="label text-gold">
            The Difference
          </motion.p>
          <motion.h2 variants={rise} className="mt-6 max-w-2xl font-display text-5xl text-ivory md:text-6xl">
            Not a portal. A principal.
          </motion.h2>
        </motion.div>

        <motion.div
          variants={stagger(0.15, 0.14)}
          initial="hidden"
          whileInView="show"
          viewport={inView}
          className="mt-16 grid grid-cols-1 gap-px overflow-hidden border border-line bg-[color:var(--line)] md:grid-cols-3"
        >
          {PILLARS.map((p) => (
            <motion.article key={p.n} variants={rise} className="bg-ink px-8 py-10">
              <span className="mono text-2xl text-gilt">{p.n}</span>
              <h3 className="mt-6 font-display text-3xl text-ivory">{p.title}</h3>
              <p className="mt-4 text-[0.98rem] leading-relaxed text-ivory-dim">{p.body}</p>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

/* -------------------------------------------------------------- stats band */
const STATS = [
  { k: '20–200', v: 'Principals, ever' },
  { k: '100%', v: 'In-person KYC' },
  { k: 'Zero', v: 'Cloud dependency' },
  { k: '±6%', v: 'GDV accuracy' },
]

function StatsBand() {
  return (
    <section className="border-t border-line bg-navy/40">
      <motion.div
        variants={stagger(0.1, 0.12)}
        initial="hidden"
        whileInView="show"
        viewport={inView}
        className="mx-auto grid max-w-shell grid-cols-2 divide-x divide-y divide-[color:var(--line)] md:grid-cols-4 md:divide-y-0"
      >
        {STATS.map((s) => (
          <motion.div key={s.k} variants={fade} className="px-8 py-12 text-center">
            <div className="font-display text-5xl text-gilt md:text-6xl">{s.k}</div>
            <div className="label mt-4 text-ivory-faint">{s.v}</div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}

/* ------------------------------------------------------------- studio tease */
function StudioTease() {
  return (
    <section className="border-t border-line px-6 py-28 md:px-10 md:py-36">
      <div className="mx-auto flex max-w-shell flex-col items-start justify-between gap-10 md:flex-row md:items-end">
        <motion.div variants={stagger()} initial="hidden" whileInView="show" viewport={inView} className="max-w-2xl">
          <motion.p variants={rise} className="label text-gold">
            The Feasibility Studio
          </motion.p>
          <motion.h2 variants={rise} className="mt-6 font-display text-5xl leading-tight text-ivory md:text-6xl">
            Model the profit before
            <br />
            you commit the fee.
          </motion.h2>
          <motion.p variants={rise} className="mt-7 text-lg leading-relaxed text-ivory-dim">
            Draw a parcel’s massing from its own by-laws, assign materials surface by surface, and
            watch a three-zone GDV — bear, base, bull — resolve live. The architect comes second.
          </motion.p>
        </motion.div>
        <motion.div variants={fade} initial="hidden" whileInView="show" viewport={inView}>
          <Link
            to="/login"
            className="label group inline-flex items-center gap-3 border border-[color:var(--line-gold)] px-8 py-4 text-gold transition-colors duration-500 hover:bg-gold hover:text-ink"
          >
            Enter the Studio
            <span className="transition-transform duration-500 group-hover:translate-x-1">→</span>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------- footer */
function Footer() {
  return (
    <footer className="border-t border-line px-6 py-16 md:px-10">
      <div className="mx-auto flex max-w-shell flex-col items-center gap-8 text-center">
        <Seal size={64} text="· DB TERRACREST ADVISORY · BENGALURU " />
        <p className="font-display text-3xl italic text-ivory">By invitation only.</p>
        <div className="hairline-gold w-24" />
        <p className="mono max-w-xl text-[0.68rem] leading-relaxed tracking-widest text-ivory-faint">
          DB TERRACREST ADVISORY · A PRIVATE DEAL PORTAL, NOT A LISTING SERVICE · ALL PARCELS
          PHYSICALLY INSPECTED · © MMXXVI
        </p>
      </div>
    </footer>
  )
}
