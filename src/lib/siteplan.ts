import type { FeasibilityInput } from '@/domain/types'

/* ============================================================
   Site-plan geometry — turns feasibility inputs into rectangles
   the Studio renders as an SVG massing schematic: the parcel,
   its setback envelope, and the tower footprints laid inside.
   Coordinates are in feet, origin top-left (road at bottom).
   ============================================================ */

const FT_PER_M = 3.28084

export interface Rect {
  x: number
  y: number
  w: number
  h: number
}

export interface SitePlan {
  plot: Rect
  buildable: Rect
  towers: Rect[]
  frontageFt: number
  depthFt: number
  setbackFt: number
}

export function buildSitePlan(f: FeasibilityInput, footprintSqft: number): SitePlan {
  // Assume a plausible rectangular parcel (depth a touch greater than frontage).
  const aspect = 1.3 // depth / frontage
  const frontage = Math.sqrt(f.plotAreaSqft / aspect)
  const depth = f.plotAreaSqft / frontage
  const plot: Rect = { x: 0, y: 0, w: frontage, h: depth }

  const setbackFt = f.setbackM * FT_PER_M
  const buildable: Rect = {
    x: setbackFt,
    y: setbackFt,
    w: Math.max(20, frontage - 2 * setbackFt),
    h: Math.max(20, depth - 2 * setbackFt),
  }

  const n = Math.max(1, Math.round(f.towers))
  // Bias column count toward the wider dimension so towers spread naturally.
  const cols = Math.max(1, Math.min(n, Math.round(Math.sqrt(n * (buildable.w / buildable.h)))))
  const rows = Math.ceil(n / cols)

  const gapX = buildable.w * 0.06
  const gapY = buildable.h * 0.06
  const idealSide = Math.sqrt(Math.max(1, footprintSqft / n))
  const maxSideX = (buildable.w - (cols + 1) * gapX) / cols
  const maxSideY = (buildable.h - (rows + 1) * gapY) / rows
  const side = Math.max(8, Math.min(idealSide, maxSideX, maxSideY))

  const totalW = cols * side + (cols - 1) * gapX
  const totalH = rows * side + (rows - 1) * gapY
  const startX = buildable.x + (buildable.w - totalW) / 2
  const startY = buildable.y + (buildable.h - totalH) / 2

  const towers: Rect[] = []
  for (let i = 0; i < n; i++) {
    const r = Math.floor(i / cols)
    const c = i % cols
    towers.push({
      x: startX + c * (side + gapX),
      y: startY + r * (side + gapY),
      w: side,
      h: side,
    })
  }

  return { plot, buildable, towers, frontageFt: frontage, depthFt: depth, setbackFt }
}
