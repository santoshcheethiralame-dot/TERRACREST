/* ============================================================
   Domain model — the shared language of the platform.
   Kept framework-agnostic so it is reused by UI, the GDV
   engine, and (later) a FastAPI/Postgres backend unchanged.
   ============================================================ */

export type Role = 'builder' | 'landowner' | 'investor' | 'admin'

export type Vertical = 'joint-development' | 'warehouse' | 'big-land'

export const VERTICAL_LABEL: Record<Vertical, string> = {
  'joint-development': 'Joint Development',
  warehouse: 'Warehouse',
  'big-land': 'Big Land',
}

/** Admin-controlled listing lifecycle. Nothing goes LIVE until VERIFIED. */
export type ListingStatus =
  | 'draft'
  | 'documents-uploaded'
  | 'under-review'
  | 'verified'
  | 'live'
  | 'under-offer'
  | 'closed'

export const STATUS_LABEL: Record<ListingStatus, string> = {
  draft: 'Draft',
  'documents-uploaded': 'Documents Uploaded',
  'under-review': 'Under Admin Review',
  verified: 'Verified',
  live: 'Live',
  'under-offer': 'Under Offer',
  closed: 'Closed',
}

export interface User {
  id: string
  username: string
  displayName: string
  role: Role
  /** Builders only — used for pre-calculated distance to a parcel. */
  officeLocation?: string
  kycVerified: boolean
  memberSince: string
}

export interface GeoPoint {
  lat: number
  lng: number
}

/** Coarse, admin-set area shown before an NDA — never the exact plot. */
export interface PublicArea {
  lat: number
  lng: number
  radiusKm: number
}

export interface Comparable {
  project: string
  distanceKm: number
  psf: number
  year: number
  note: string
}

/** Everything hidden behind the masking layer until an NDA is logged. */
export interface SealedDetails {
  coords: GeoPoint
  address: string
  ownerName: string
  ownerId: string
  surveyNos: string[]
  contact: string
}

export interface JointDevelopmentSpec {
  fsi: number
  approval: string
  roadWidthFt: number
  suggestedModel: string
  timelineMonths: number
}

export interface WarehouseSpec {
  clearHeightM: number
  docks: number
  powerKw: number
  floorLoadTonM2: number
  leaseType: string
}

export interface BigLandSpec {
  soil: string
  waterTable: string
  disputes: string
  horizonYears: number
  appreciationNote: string
}

/** The knobs the GDV engine and the site-plan generator consume. */
export interface FeasibilityInput {
  plotAreaSqft: number
  fsi: number
  setbackM: number
  roadWidthFt: number
  towers: number
  floors: number
  floorPlateEfficiency: number
  avgUnitSqft: number
  baseSalePsf: number
}

export interface Listing {
  id: string
  vertical: Vertical
  headline: string
  status: ListingStatus
  // --- masked-safe (visible in discovery) ---
  localityLabel: string
  areaLabel: string
  landAreaSqft: number
  zoning: string
  localityNote: string
  verification: { by: string; on: string }
  guidance: { low: number; high: number } // in crore
  publicArea?: PublicArea
  // --- sealed (unlock-only) — absent from the API response until an NDA is logged ---
  sealed?: SealedDetails
  // --- vertical-specific ---
  jd?: JointDevelopmentSpec
  warehouse?: WarehouseSpec
  bigLand?: BigLandSpec
  comps: Comparable[]
  feasibility: FeasibilityInput
  createdAt: string
}

export interface Nda {
  id: string
  builderId: string
  landownerId: string
  listingId: string
  signedOn: string
  witnessedBy: string
  scanRef: string
}

export type DealStage = 'new-lead' | 'nda-signed' | 'site-visit' | 'term-sheet' | 'closed'

export const DEAL_STAGE_LABEL: Record<DealStage, string> = {
  'new-lead': 'New Lead',
  'nda-signed': 'NDA Signed',
  'site-visit': 'Site Visit',
  'term-sheet': 'Term Sheet',
  closed: 'Closed',
}

export interface Deal {
  id: string
  listingId: string
  builderId: string
  stage: DealStage
  estCommission: number
  rm: string
}

export type OfferStatus = 'pending' | 'chosen' | 'declined'

export interface Offer {
  id: string
  listingId: string
  builder: string
  type: string
  quote: string
  terms: string
  status: OfferStatus
}

export interface EngagementEvent {
  by: string
  at: string
}

export interface Engagement {
  listingId: string
  views: EngagementEvent[]
  shortlists: string[]
  siteVisits: EngagementEvent[]
}

export interface Document {
  id: string
  listingId: string
  name: string
  kind: string
}
