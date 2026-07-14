/* ============================================================
   Material catalogue — four tiers per category, each carrying
   a ₹/sq-ft contribution to built-up construction cost.
   Brands mirror the specification's finishes table.
   ============================================================ */

export type Tier = 'budget' | 'mid' | 'premium' | 'luxury'

export const TIERS: Tier[] = ['budget', 'mid', 'premium', 'luxury']

export const TIER_LABEL: Record<Tier, string> = {
  budget: 'Budget',
  mid: 'Mid',
  premium: 'Premium',
  luxury: 'Luxury',
}

export interface MaterialOption {
  /** Illustrative brand / spec shown to the builder. */
  label: string
  /** Contribution to construction cost, ₹ per sq ft of built-up area. */
  psf: number
}

export interface MaterialCategory {
  key: string
  name: string
  options: Record<Tier, MaterialOption>
}

export const MATERIALS: MaterialCategory[] = [
  {
    key: 'flooring',
    name: 'Flooring',
    options: {
      budget: { label: 'Vitrified', psf: 45 },
      mid: { label: 'Ceramic granite', psf: 85 },
      premium: { label: 'Italian marble', psf: 220 },
      luxury: { label: 'Imported onyx', psf: 450 },
    },
  },
  {
    key: 'sanitary',
    name: 'Sanitaryware & CP',
    options: {
      budget: { label: 'Parryware / Cera', psf: 20 },
      mid: { label: 'Jaquar', psf: 45 },
      premium: { label: 'Kohler / Grohe', psf: 95 },
      luxury: { label: 'Dornbracht / V&B', psf: 190 },
    },
  },
  {
    key: 'kitchen',
    name: 'Kitchen',
    options: {
      budget: { label: 'Carpenter-made', psf: 30 },
      mid: { label: 'Sleek / Häfele', psf: 70 },
      premium: { label: 'Hacker / Leicht', psf: 150 },
      luxury: { label: 'Boffi / Poliform', psf: 320 },
    },
  },
  {
    key: 'windows',
    name: 'Windows & Glazing',
    options: {
      budget: { label: 'MS + local glass', psf: 35 },
      mid: { label: 'UPVC + Saint-Gobain', psf: 80 },
      premium: { label: 'Aluminium + double glaze', psf: 160 },
      luxury: { label: 'Schüco / Reynaers', psf: 300 },
    },
  },
  {
    key: 'lift',
    name: 'Lifts',
    options: {
      budget: { label: 'Local hydraulic', psf: 15 },
      mid: { label: 'Kone / Otis', psf: 35 },
      premium: { label: 'Kone EcoSpace', psf: 60 },
      luxury: { label: 'Otis Gen2', psf: 95 },
    },
  },
  {
    key: 'facade',
    name: 'Façade & External',
    options: {
      budget: { label: 'Cement paint', psf: 25 },
      mid: { label: 'Apex Ultima', psf: 55 },
      premium: { label: 'Apex Ultima Pro', psf: 95 },
      luxury: { label: 'Sto / Sika system', psf: 210 },
    },
  },
]
