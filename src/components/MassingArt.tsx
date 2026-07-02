import { motion } from 'framer-motion'

/* ============================================================
   MassingArt — axonometric wireframe of a parcel's massing,
   drawn from the same numbers the Studio models. The house
   illustration style: indigo line-work, mono survey callouts.
   ============================================================ */

const C = Math.cos(Math.PI / 6)
const S = Math.sin(Math.PI / 6)
const U = 34 // px per plot unit

const P = (x: number, y: number, z: number): [number, number] => [(x - y) * C * U, (x + y) * S * U - z * U]
const M = (pts: [number, number][]) => pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ')

type Box = { x: number; y: number; w: number; d: number; z: number; h: number }

/** Wireframe paths for one box, split by draw style. */
function box({ x, y, w, d, z, h }: Box) {
  const a = [x, y] as const
  const b = [x + w, y] as const
  const c = [x + w, y + d] as const
  const e = [x, y + d] as const
  const top = M([P(a[0], a[1], z + h), P(b[0], b[1], z + h), P(c[0], c[1], z + h), P(e[0], e[1], z + h)]) + ' Z'
  const verticals = [b, c, e].map(([px, py]) => M([P(px, py, z), P(px, py, z + h)]))
  const base = M([P(b[0], b[1], z), P(c[0], c[1], z), P(e[0], e[1], z)])
  const hidden = [M([P(a[0], a[1], z), P(a[0], a[1], z + h)]), M([P(a[0], a[1], z), P(b[0], b[1], z)]), M([P(e[0], e[1], z), P(a[0], a[1], z)])]
  return { top, verticals, base, hidden }
}

const PODIUM: Box = { x: 0.5, y: 0.5, w: 9.0, d: 7.0, z: 0, h: 0.7 }
const TOWERS: Box[] = [
  { x: 1.2, y: 1.2, w: 2.0, d: 2.0, z: 0.7, h: 4.6 },
  { x: 4.2, y: 1.0, w: 2.0, d: 2.0, z: 0.7, h: 6.2 },
  { x: 7.2, y: 1.4, w: 1.9, d: 1.9, z: 0.7, h: 3.8 },
  { x: 2.6, y: 4.4, w: 2.2, d: 2.2, z: 0.7, h: 7.4 },
]

const ACCENT = '#8A7DFF'
const FAINT = '#67676F'

function Wire({ b, delay }: { b: Box; delay: number }) {
  const { top, verticals, base, hidden } = box(b)
  const draw = (d: string, i: number, cls: { stroke: string; opacity: number; width: number; dash?: string }) => (
    <motion.path
      key={d}
      d={d}
      fill="none"
      stroke={cls.stroke}
      strokeOpacity={cls.opacity}
      strokeWidth={cls.width}
      strokeDasharray={cls.dash}
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 1.3, delay: delay + i * 0.06, ease: [0.16, 1, 0.3, 1] }}
    />
  )
  return (
    <g>
      {hidden.map((d, i) => draw(d, i, { stroke: ACCENT, opacity: 0.14, width: 1, dash: '3 5' }))}
      {draw(base, 3, { stroke: ACCENT, opacity: 0.4, width: 1 })}
      {verticals.map((d, i) => draw(d, 4 + i, { stroke: ACCENT, opacity: 0.65, width: 1.2 }))}
      <motion.path
        d={top}
        fill={ACCENT}
        fillOpacity={0.06}
        stroke={ACCENT}
        strokeOpacity={0.85}
        strokeWidth={1.3}
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.4, delay: delay + 0.4, ease: [0.16, 1, 0.3, 1] }}
      />
    </g>
  )
}

export function MassingArt({ className = '' }: { className?: string }) {
  const boundary = M([P(0, 0, 0), P(10, 0, 0), P(10, 8, 0), P(0, 8, 0)]) + ' Z'
  const road = M([P(0, 8.6, 0), P(10, 8.6, 0), P(10, 9.6, 0), P(0, 9.6, 0)]) + ' Z'
  const gridLines = [2, 4, 6, 8].map((gx) => M([P(gx, 0, 0), P(gx, 8, 0)])).concat([2, 4, 6].map((gy) => M([P(0, gy, 0), P(10, gy, 0)])))
  const [tallX, tallY] = P(2.6 + 2.2, 4.4, 0.7 + 7.4)

  return (
    <motion.div
      className={className}
      animate={{ y: [0, -9, 0] }}
      transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
      aria-hidden
    >
      <svg viewBox="-268 -290 590 640" className="h-auto w-full" role="img" aria-label="Axonometric massing of a verified parcel">
        {/* floor grid */}
        {gridLines.map((d) => (
          <path key={d} d={d} fill="none" stroke="#EDECE8" strokeOpacity="0.05" strokeWidth="1" />
        ))}

        {/* parcel boundary + road */}
        <path d={boundary} fill={ACCENT} fillOpacity="0.02" stroke={ACCENT} strokeOpacity="0.5" strokeWidth="1.2" strokeDasharray="7 6" />
        <path d={road} fill={FAINT} fillOpacity="0.06" stroke={FAINT} strokeOpacity="0.4" strokeWidth="1" />

        {/* massing */}
        <Wire b={PODIUM} delay={0.3} />
        {TOWERS.map((t, i) => (
          <Wire key={i} b={t} delay={0.7 + i * 0.28} />
        ))}

        {/* survey callouts */}
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.1, duration: 1 }}>
          <line x1={tallX} y1={tallY} x2={tallX + 46} y2={tallY - 26} stroke={FAINT} strokeWidth="0.8" />
          <text x={tallX + 52} y={tallY - 30} fill="#A2A1A8" fontFamily="'IBM Plex Mono', monospace" fontSize="12" letterSpacing="2">
            G+14
          </text>

          <text x={-258} y={-16} fill={FAINT} fontFamily="'IBM Plex Mono', monospace" fontSize="11" letterSpacing="2">
            FSI 2.25
          </text>
          <text x={-258} y={4} fill={FAINT} fontFamily="'IBM Plex Mono', monospace" fontSize="11" letterSpacing="2">
            ≈ 2.4 AC
          </text>

          {/* coordinates stay masked — the moat, even in the illustration */}
          <text x={60} y={-258} fill={FAINT} fontFamily="'IBM Plex Mono', monospace" fontSize="11" letterSpacing="2">
            13.2█°N · 77.7█°E
          </text>
          <text x={60} y={-240} fill={ACCENT} fillOpacity="0.75" fontFamily="'IBM Plex Mono', monospace" fontSize="10" letterSpacing="2.4">
            SEALED · NDA REQUIRED
          </text>

          {/* road label + north arrow */}
          <text x={P(5, 9.6, 0)[0]} y={P(5, 9.6, 0)[1] + 20} textAnchor="middle" fill={FAINT} fontFamily="'IBM Plex Mono', monospace" fontSize="10" letterSpacing="2.6">
            40 FT ROAD · FRONTAGE
          </text>
          <g transform="translate(282 -270)" stroke={FAINT} strokeWidth="1" fill="none">
            <path d="M0 22 L0 0 M-5 6 L0 0 L5 6" />
            <text x="-4" y="40" fill={FAINT} stroke="none" fontFamily="'IBM Plex Mono', monospace" fontSize="11">
              N
            </text>
          </g>
        </motion.g>
      </svg>
    </motion.div>
  )
}
