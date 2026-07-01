import type { FeasibilityInput } from '@/domain/types'
import { MATERIALS, type Tier } from '@/lib/materials'

/* ============================================================
   The GDV engine — pure, deterministic, framework-agnostic.
   Feasibility geometry -> construction cost (live from
   materials) -> three-zone Net Development Value.
   Reusable on a server for the architect-validation step.
   ============================================================ */

export type MaterialSelection = Record<string, Tier>

export interface Feasibility {
  builtUpAreaSqft: number
  saleableAreaSqft: number
  unitCount: number
  parkingCount: number
  footprintSqft: number
  greenPct: number
  efficiencyPct: number
}

export type ZoneKey = 'bear' | 'base' | 'bull'

export interface ZoneResult {
  key: ZoneKey
  label: string
  salePsf: number
  grossGdv: number
  constructionCost: number
  financingCost: number
  netValue: number
  marginPct: number
}

export interface GdvResult {
  feas: Feasibility
  finishesPsf: number
  constructionPsfBase: number
  zones: Record<ZoneKey, ZoneResult>
}

/** Baseline structure + MEP + preliminaries, ₹/sq ft of built-up. */
const BASE_BUILD_PSF = 2150

/** Scenario adjustments, per the specification's three-zone method. */
const SALE_MULT: Record<ZoneKey, number> = { bear: 0.9, base: 1.0, bull: 1.1 }
const COST_MULT: Record<ZoneKey, number> = { bear: 1.0, base: 1.0, bull: 1.05 }
const FINANCE_RATE: Record<ZoneKey, number> = { bear: 0.1, base: 0.08, bull: 0.07 }
const ZONE_LABEL: Record<ZoneKey, string> = { bear: 'Conservative', base: 'Market', bull: 'Optimistic' }

export function defaultSelection(): MaterialSelection {
  return Object.fromEntries(MATERIALS.map((c) => [c.key, 'mid'])) as MaterialSelection
}

/** Sum of material contributions, ₹/sq ft of built-up area. */
export function finishesPsf(selection: MaterialSelection): number {
  return MATERIALS.reduce((sum, cat) => {
    const tier = selection[cat.key] ?? 'mid'
    return sum + cat.options[tier].psf
  }, 0)
}

export function computeFeasibility(f: FeasibilityInput): Feasibility {
  const builtUp = f.plotAreaSqft * f.fsi
  const saleable = builtUp * f.floorPlateEfficiency
  const unitCount = Math.max(1, Math.round(saleable / f.avgUnitSqft))
  const parkingCount = Math.round(unitCount * 1.1)
  const footprint = builtUp / Math.max(1, f.floors)
  const greenPct = Math.max(0, Math.min(0.9, 1 - footprint / f.plotAreaSqft))
  return {
    builtUpAreaSqft: builtUp,
    saleableAreaSqft: saleable,
    unitCount,
    parkingCount,
    footprintSqft: footprint,
    greenPct,
    efficiencyPct: f.floorPlateEfficiency,
  }
}

export function computeGdv(f: FeasibilityInput, selection: MaterialSelection): GdvResult {
  const feas = computeFeasibility(f)
  const fin = finishesPsf(selection)
  const constructionPsfBase = BASE_BUILD_PSF + fin

  const zone = (key: ZoneKey): ZoneResult => {
    const salePsf = f.baseSalePsf * SALE_MULT[key]
    const constructionCost = feas.builtUpAreaSqft * constructionPsfBase * COST_MULT[key]
    const financingCost = constructionCost * FINANCE_RATE[key]
    const grossGdv = feas.saleableAreaSqft * salePsf
    const netValue = grossGdv - constructionCost - financingCost
    return {
      key,
      label: ZONE_LABEL[key],
      salePsf,
      grossGdv,
      constructionCost,
      financingCost,
      netValue,
      marginPct: grossGdv > 0 ? netValue / grossGdv : 0,
    }
  }

  return {
    feas,
    finishesPsf: fin,
    constructionPsfBase,
    zones: { bear: zone('bear'), base: zone('base'), bull: zone('bull') },
  }
}
