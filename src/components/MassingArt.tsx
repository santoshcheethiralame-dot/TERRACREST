import { motion } from 'framer-motion'

/* ============================================================
   MassingArt — axonometric survey drawing of a parcel's massing,
   drawn from the same numbers the Studio models. The house
   illustration: forest line-work on ledger stock, storey-by-storey
   construction draw, a gold tower crane, mono survey callouts.
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

/** Storey lines across the two visible faces — the "construction" detail. */
function floorsPath({ x, y, w, d, z, h }: Box, storey = 0.42): string {
  const segs: string[] = []
  for (let fz = z + storey; fz < z + h - 0.12; fz += storey) {
    segs.push(M([P(x + w, y, fz), P(x + w, y + d, fz)]))
    segs.push(M([P(x + w, y + d, fz), P(x, y + d, fz)]))
  }
  return segs.join(' ')
}

/** Facade mullions — vertical thirds on each visible face. */
function mullionsPath({ x, y, w, d, z, h }: Box): string {
  const segs: string[] = []
  for (let k = 1; k <= 3; k++) {
    segs.push(M([P(x + w, y + (d * k) / 4, z), P(x + w, y + (d * k) / 4, z + h)]))
    segs.push(M([P(x + (w * k) / 4, y + d, z), P(x + (w * k) / 4, y + d, z + h)]))
  }
  return segs.join(' ')
}

const PODIUM: Box = { x: 0.5, y: 0.5, w: 9.0, d: 7.0, z: 0, h: 0.7 }
const TOWERS: Box[] = [
  { x: 1.2, y: 1.2, w: 2.0, d: 2.0, z: 0.7, h: 4.6 },
  { x: 4.2, y: 1.0, w: 2.0, d: 2.0, z: 0.7, h: 6.2 },
  { x: 7.2, y: 1.4, w: 1.9, d: 1.9, z: 0.7, h: 3.8 },
  { x: 2.6, y: 4.4, w: 2.2, d: 2.2, z: 0.7, h: 7.4 },
]

const ACCENT = '#1E4D3B'
const LEAF = '#2E7D5B'
const GOLD = '#8A6B1F'
const FAINT = '#7C857D'
const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

function Wire({ b, delay, detail }: { b: Box; delay: number; detail?: boolean }) {
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
      transition={{ duration: 1.2, delay: delay + i * 0.05, ease: EASE }}
    />
  )
  return (
    <g>
      {hidden.map((d, i) => draw(d, i, { stroke: ACCENT, opacity: 0.13, width: 1, dash: '3 5' }))}
      {draw(base, 3, { stroke: ACCENT, opacity: 0.4, width: 1 })}
      {verticals.map((d, i) => draw(d, 4 + i, { stroke: ACCENT, opacity: 0.7, width: 1.2 }))}
      <motion.path
        d={top}
        fill={ACCENT}
        fillOpacity={0.06}
        stroke={ACCENT}
        strokeOpacity={0.9}
        strokeWidth={1.3}
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.2, delay: delay + 0.35, ease: EASE }}
      />
      {detail && (
        <>
          {/* storeys rise one by one — a single dashed path drawn in sequence */}
          <motion.path
            d={floorsPath(b)}
            fill="none"
            stroke={ACCENT}
            strokeOpacity={0.22}
            strokeWidth={0.8}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.6, delay: delay + 0.5, ease: 'easeOut' }}
          />
          <motion.path
            d={mullionsPath(b)}
            fill="none"
            stroke={ACCENT}
            strokeOpacity={0.1}
            strokeWidth={0.7}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: delay + 1.5 }}
          />
        </>
      )}
    </g>
  )
}

/** A line-art tower crane in old gold — wealth, under construction. */
function Crane({ delay }: { delay: number }) {
  const bx = 6.2
  const by = 5.6
  const baseZ = 0.7
  const topZ = 8.8
  const apexZ = 9.6
  const mastB = P(bx, by, baseZ)
  const mastT = P(bx, by, topZ)
  const apex = P(bx, by, apexZ)
  const jibTip = P(3.6, 3.0, topZ)
  const counterTip = P(7.6, 7.0, topZ)
  const hookTop = P(4.6, 4.0, topZ)
  const hookBot = P(4.6, 4.0, 5.4)

  const el = (d: string, i: number, w = 1.1, o = 0.8, dash?: string) => (
    <motion.path
      key={i}
      d={d}
      fill="none"
      stroke={GOLD}
      strokeOpacity={o}
      strokeWidth={w}
      strokeDasharray={dash}
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 0.9, delay: delay + i * 0.12, ease: EASE }}
    />
  )

  return (
    <g>
      {/* mast + lattice ticks */}
      {el(M([mastB, mastT]), 0, 1.3)}
      {el(
        [0.25, 0.45, 0.65]
          .map((t) => {
            const z = baseZ + (topZ - baseZ) * t
            return M([P(bx - 0.16, by + 0.16, z), P(bx + 0.16, by - 0.16, z + 0.5)])
          })
          .join(' '),
        1,
        0.7,
        0.55,
      )}
      {/* apex + jib + counter-jib + ties */}
      {el(M([mastT, apex]), 2)}
      {el(M([mastT, jibTip]), 3, 1.2)}
      {el(M([mastT, counterTip]), 4, 1.2)}
      {el(M([apex, jibTip]), 5, 0.7, 0.55)}
      {el(M([apex, counterTip]), 6, 0.7, 0.55)}
      {/* counterweight */}
      {el(M([counterTip, P(7.6, 7.0, topZ - 0.5)]), 7, 2.2, 0.9)}
      {/* hook cable + hook */}
      {el(M([hookTop, hookBot]), 8, 0.7, 0.6, '2 3')}
      <motion.rect
        x={hookBot[0] - 2.5}
        y={hookBot[1]}
        width={5}
        height={5}
        fill="none"
        stroke={GOLD}
        strokeWidth={1}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.85 }}
        transition={{ delay: delay + 1.3, duration: 0.5 }}
      />
    </g>
  )
}

/** Boundary trees — canopy circles with stems, planted outside the wall. */
function Trees({ delay }: { delay: number }) {
  const spots: [number, number][] = [
    [-0.7, 1.4],
    [-0.7, 3.4],
    [-0.7, 5.4],
    [1.6, -0.8],
    [4.2, -0.8],
    [6.8, -0.8],
  ]
  return (
    <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay, duration: 1.2 }}>
      {spots.map(([tx, ty], i) => {
        const stemB = P(tx, ty, 0)
        const stemT = P(tx, ty, 0.5)
        return (
          <g key={i}>
            <path d={M([stemB, stemT])} stroke={LEAF} strokeOpacity="0.5" strokeWidth="1" fill="none" />
            <circle cx={stemT[0]} cy={stemT[1] - 6} r="8" fill="none" stroke={LEAF} strokeOpacity="0.45" strokeWidth="1" />
            <circle cx={stemT[0]} cy={stemT[1] - 6} r="3.5" fill={LEAF} fillOpacity="0.18" stroke="none" />
          </g>
        )
      })}
    </motion.g>
  )
}

/** Surveyor's dimension line with end ticks and a mono label. */
function Dim({ from, to, label, dx = 0, dy = 0 }: { from: [number, number]; to: [number, number]; label: string; dx?: number; dy?: number }) {
  return (
    <g stroke={FAINT} strokeWidth="0.8">
      <path d={M([from, to])} strokeOpacity="0.55" fill="none" />
      <path d={`M${from[0]} ${from[1] - 5} L${from[0]} ${from[1] + 5} M${to[0]} ${to[1] - 5} L${to[0]} ${to[1] + 5}`} strokeOpacity="0.55" fill="none" />
      <text
        x={(from[0] + to[0]) / 2 + dx}
        y={(from[1] + to[1]) / 2 + dy}
        textAnchor="middle"
        fill={FAINT}
        stroke="none"
        fontFamily="'IBM Plex Mono', monospace"
        fontSize="10.5"
        letterSpacing="2"
      >
        {label}
      </text>
    </g>
  )
}

export function MassingArt({ className = '' }: { className?: string }) {
  const boundary = M([P(0, 0, 0), P(10, 0, 0), P(10, 8, 0), P(0, 8, 0)]) + ' Z'
  const setback = M([P(0.9, 0.9, 0), P(9.1, 0.9, 0), P(9.1, 7.1, 0), P(0.9, 7.1, 0)]) + ' Z'
  const road = M([P(0, 8.6, 0), P(10, 8.6, 0), P(10, 9.6, 0), P(0, 9.6, 0)]) + ' Z'
  const roadDash = M([P(0.4, 9.1, 0), P(9.6, 9.1, 0)])
  const gridLines = [2, 4, 6, 8].map((gx) => M([P(gx, 0, 0), P(gx, 8, 0)])).concat([2, 4, 6].map((gy) => M([P(0, gy, 0), P(10, gy, 0)])))
  const [tallX, tallY] = P(2.6 + 2.2, 4.4, 0.7 + 7.4)

  return (
    <motion.div
      className={className}
      animate={{ y: [0, -9, 0] }}
      transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
      aria-hidden
    >
      <svg viewBox="-268 -300 590 690" className="h-auto w-full" role="img" aria-label="Axonometric survey drawing of a verified parcel">
        {/* floor grid */}
        {gridLines.map((d) => (
          <path key={d} d={d} fill="none" stroke="#1A1E1B" strokeOpacity="0.07" strokeWidth="1" />
        ))}

        {/* boundary — marching ants, the survey line being walked */}
        <motion.path
          d={boundary}
          fill={ACCENT}
          fillOpacity="0.02"
          stroke={ACCENT}
          strokeOpacity="0.55"
          strokeWidth="1.2"
          strokeDasharray="7 6"
          animate={{ strokeDashoffset: [0, -26] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: 'linear' }}
        />
        <path d={setback} fill="none" stroke={ACCENT} strokeOpacity="0.22" strokeWidth="0.9" strokeDasharray="3 5" />

        {/* road + centreline */}
        <path d={road} fill={FAINT} fillOpacity="0.06" stroke={FAINT} strokeOpacity="0.4" strokeWidth="1" />
        <path d={roadDash} fill="none" stroke={FAINT} strokeOpacity="0.5" strokeWidth="1" strokeDasharray="8 7" />

        <Trees delay={0.5} />

        {/* massing — podium, then towers rise storey by storey */}
        <Wire b={PODIUM} delay={0.3} />
        {TOWERS.map((t, i) => (
          <Wire key={i} b={t} delay={0.7 + i * 0.28} detail />
        ))}

        <Crane delay={2.1} />

        {/* survey callouts */}
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.4, duration: 1 }}>
          <line x1={tallX} y1={tallY} x2={tallX + 46} y2={tallY - 26} stroke={FAINT} strokeWidth="0.8" />
          <text x={tallX + 52} y={tallY - 30} fill="#4F5852" fontFamily="'IBM Plex Mono', monospace" fontSize="12" letterSpacing="2">
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
          <text x={60} y={-240} fill={GOLD} fontFamily="'IBM Plex Mono', monospace" fontSize="10" letterSpacing="2.4">
            SEALED · NDA REQUIRED
          </text>

          {/* road label + surveyor's dimensions + north arrow */}
          <text x={P(5, 9.1, 0)[0]} y={P(5, 9.1, 0)[1] + 26} textAnchor="middle" fill={FAINT} fontFamily="'IBM Plex Mono', monospace" fontSize="10" letterSpacing="2.6">
            40 FT ROAD · FRONTAGE
          </text>
          <Dim from={P(0, 10.4, 0)} to={P(10, 10.4, 0)} label="≈ 283 FT" dy={18} />
          <Dim from={P(-0.9, 0, 0)} to={P(-0.9, 8, 0)} label="≈ 368 FT" dx={-46} dy={-6} />
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
