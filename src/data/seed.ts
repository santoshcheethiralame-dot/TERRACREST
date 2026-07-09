import type { User, Listing, Offer, Engagement, Deal, Document, Message, ActivityEvent, ArchitectReview } from '@/domain/types'

/* ============================================================
   Seed data — a realistic Bengaluru book of business.
   This is the swappable layer: the repository reads from here
   today and from a real API tomorrow, with no UI changes.
   ============================================================ */

export const users: User[] = [
  {
    id: 'builder_rajesh_001',
    username: 'builder_rajesh_001',
    displayName: 'Rajesh Menon · Rajesh Developers',
    role: 'builder',
    officeLocation: 'Koramangala, Bengaluru',
    kycVerified: true,
    memberSince: '2026-03-11',
  },
  {
    id: 'builder_priya_003',
    username: 'builder_priya_003',
    displayName: 'Priya Nair · Priya Estates',
    role: 'builder',
    officeLocation: 'Whitefield, Bengaluru',
    kycVerified: true,
    memberSince: '2026-04-02',
  },
  {
    id: 'landowner_ramanathan_002',
    username: 'landowner_ramanathan_002',
    displayName: 'S. Ramanathan · Ramanathan Holdings LLP',
    role: 'landowner',
    kycVerified: true,
    memberSince: '2026-02-19',
  },
  {
    id: 'landowner_gupta_004',
    username: 'landowner_gupta_004',
    displayName: 'A. Gupta · Gupta Warehousing',
    role: 'landowner',
    kycVerified: true,
    memberSince: '2026-03-28',
  },
  {
    id: 'landowner_narayan_006',
    username: 'landowner_narayan_006',
    displayName: 'Narayan Family Trust',
    role: 'landowner',
    kycVerified: true,
    memberSince: '2026-05-06',
  },
  {
    id: 'investor_khanna_005',
    username: 'investor_khanna_005',
    displayName: 'A. Khanna · Khanna Family Office',
    role: 'investor',
    officeLocation: 'Indiranagar, Bengaluru',
    kycVerified: true,
    memberSince: '2026-01-30',
  },
  {
    id: 'admin_terracrest',
    username: 'admin_terracrest',
    displayName: 'Terracrest Desk',
    role: 'admin',
    kycVerified: true,
    memberSince: '2025-12-01',
  },
]

export const listings: Listing[] = [
  {
    id: 'JD-BLR-2026-012',
    vertical: 'joint-development',
    headline: 'North-corridor JD parcel — podium and four towers',
    status: 'live',
    localityLabel: 'Sector 4, Devanahalli · Bengaluru North',
    areaLabel: '≈ 2.4 acres',
    landAreaSqft: 104444,
    zoning: 'Residential (BDA) · high-rise permissible',
    localityNote:
      'Personally inspected on 12 June 2026. A rare corner holding on the Devanahalli growth corridor, ten minutes from the airport toll. Clean single-owner title, no encumbrance. The frontage road is fully formed; a Prestige launch a kilometre north has reset guidance upward.',
    verification: { by: 'Terracrest Site Team', on: '12 June 2026' },
    guidance: { low: 85, high: 95 },
    publicArea: { lat: 13.25, lng: 77.7, radiusKm: 3.5 },
    sealed: {
      coords: { lat: 13.2437, lng: 77.7172 },
      address: 'Survey 141, Sector 4, Devanahalli Industrial Area, Bengaluru 562110',
      ownerName: 'Ramanathan Holdings LLP',
      ownerId: 'landowner_ramanathan_002',
      surveyNos: ['141/2B', '141/3'],
      contact: '+91 98••• ••••• (via RM)',
    },
    jd: {
      fsi: 2.25,
      approval: 'BDA approved · plan-sanction ready',
      roadWidthFt: 40,
      suggestedModel: '60:40 revenue share (owner-favoured)',
      timelineMonths: 36,
    },
    comps: [
      { project: 'Prestige (undisclosed)', distanceKm: 1.2, psf: 8200, year: 2024, note: 'Direct comparable' },
      { project: 'Sobha (undisclosed)', distanceKm: 2.8, psf: 7800, year: 2023, note: 'Older — adjust down' },
    ],
    feasibility: {
      plotAreaSqft: 104444,
      fsi: 2.25,
      setbackM: 6,
      roadWidthFt: 40,
      towers: 4,
      floors: 14,
      floorPlateEfficiency: 0.78,
      avgUnitSqft: 1400,
      baseSalePsf: 8200,
    },
    createdAt: '2026-06-14',
  },
  {
    id: 'WH-BLR-2026-047',
    vertical: 'warehouse',
    headline: 'Grade-A warehouse shell — Hoskote logistics belt',
    status: 'under-offer',
    localityLabel: 'Hoskote–Doddaballapur belt · Bengaluru East',
    areaLabel: '≈ 1.1 lakh sq ft built',
    landAreaSqft: 160000,
    zoning: 'Industrial / warehousing',
    localityNote:
      'Sits amid operational Amazon and Flipkart last-mile hubs. Labour strong — three villages within 5 km. The last-mile approach is unpaved for 200 m; we recommend grading before lease. Power reliable at 500 kW, 3-phase. No flooding risk — verified with panchayat records.',
    verification: { by: 'Terracrest Site Team', on: '12 June 2026' },
    guidance: { low: 34, high: 38 },
    publicArea: { lat: 13.08, lng: 77.79, radiusKm: 3.0 },
    sealed: {
      coords: { lat: 13.0731, lng: 77.7979 },
      address: 'Plot 22, KIADB Hoskote Phase 2, Bengaluru 560067',
      ownerName: 'Gupta Warehousing Pvt Ltd',
      ownerId: 'landowner_gupta_004',
      surveyNos: ['58/1'],
      contact: '+91 99••• ••••• (via RM)',
    },
    warehouse: {
      clearHeightM: 7.5,
      docks: 12,
      powerKw: 500,
      floorLoadTonM2: 5,
      leaseType: 'Long-term / sale',
    },
    comps: [
      { project: 'KIADB Grade-A shed', distanceKm: 2.1, psf: 3100, year: 2025, note: 'Capital-value comp' },
    ],
    feasibility: {
      plotAreaSqft: 160000,
      fsi: 1.0,
      setbackM: 9,
      roadWidthFt: 60,
      towers: 1,
      floors: 1,
      floorPlateEfficiency: 0.92,
      avgUnitSqft: 110000,
      baseSalePsf: 3100,
    },
    createdAt: '2026-05-30',
  },
  {
    id: 'BL-BLR-2026-008',
    vertical: 'big-land',
    headline: 'Contiguous 12-acre holding — Nandi foothills',
    status: 'live',
    localityLabel: 'Off Nandi Hills Road · Chikkaballapur',
    areaLabel: '≈ 12 acres',
    landAreaSqft: 522720,
    zoning: 'Agricultural · conversion potential (resort / managed farmland)',
    localityNote:
      'A clean contiguous parcel with road frontage and a live borewell. Appreciation is driven by the airport–Nandi corridor and weekend-home demand. Boundaries were walked and cross-checked against the RTC; one historical claim on the northern edge is resolved and documented.',
    verification: { by: 'Terracrest Site Team', on: '20 June 2026' },
    guidance: { low: 60, high: 72 },
    publicArea: { lat: 13.37, lng: 77.68, radiusKm: 4.0 },
    sealed: {
      coords: { lat: 13.3702, lng: 77.6835 },
      address: 'Survey 9 & 11, Sultanpet Hobli, Chikkaballapur 562101',
      ownerName: 'Estate of B. Narayan (family trust)',
      ownerId: 'landowner_narayan_006',
      surveyNos: ['9/1', '9/2', '11'],
      contact: '+91 97••• ••••• (via RM)',
    },
    bigLand: {
      soil: 'Red loam, good percolation',
      waterTable: 'Borewell at 240 ft, year-round',
      disputes: 'One northern-edge claim — resolved and documented',
      horizonYears: 5,
      appreciationNote: 'Airport–Nandi corridor; weekend-home demand rising',
    },
    comps: [
      { project: 'Managed farmland plots', distanceKm: 3.5, psf: 900, year: 2025, note: 'Per-sq-ft land comp' },
    ],
    feasibility: {
      plotAreaSqft: 522720,
      fsi: 0.15,
      setbackM: 12,
      roadWidthFt: 30,
      towers: 6,
      floors: 2,
      floorPlateEfficiency: 0.7,
      avgUnitSqft: 2400,
      baseSalePsf: 900,
    },
    createdAt: '2026-06-21',
  },
]

export const offers: Offer[] = [
  {
    id: 'OF-1',
    listingId: 'WH-BLR-2026-047',
    builder: 'Rajesh Developers',
    type: 'Lease',
    quote: '₹18.0 / sq ft',
    terms: '5-year lock · 15% escalation',
    status: 'pending',
  },
  {
    id: 'OF-2',
    listingId: 'WH-BLR-2026-047',
    builder: 'Priya Logistics',
    type: 'Lease',
    quote: '₹17.5 / sq ft',
    terms: '3-year lock · 10% escalation',
    status: 'pending',
  },
  {
    id: 'OF-3',
    listingId: 'JD-BLR-2026-012',
    builder: 'Rajesh Developers',
    type: 'Joint Development',
    quote: '62:38 revenue share',
    terms: '₹6 Cr refundable deposit',
    status: 'pending',
  },
  {
    id: 'OF-4',
    listingId: 'JD-BLR-2026-012',
    builder: 'Priya Estates',
    type: 'Joint Development',
    quote: '58:42 revenue share',
    terms: '₹4 Cr refundable deposit · faster start',
    status: 'pending',
  },
]

export const engagements: Engagement[] = [
  {
    listingId: 'JD-BLR-2026-012',
    views: [
      { by: 'builder_rajesh_001', at: 'Today 11:23' },
      { by: 'builder_priya_003', at: 'Yesterday 18:40' },
    ],
    shortlists: ['builder_rajesh_001', 'builder_priya_003'],
    siteVisits: [{ by: 'builder_rajesh_001', at: 'Scheduled 5 Jul 2026' }],
  },
  {
    listingId: 'WH-BLR-2026-047',
    views: [{ by: 'builder_rajesh_001', at: 'Today 09:05' }],
    shortlists: ['builder_rajesh_001'],
    siteVisits: [],
  },
]

export const deals: Deal[] = [
  {
    id: 'deal_001',
    listingId: 'JD-BLR-2026-012',
    builderId: 'builder_rajesh_001',
    stage: 'engaged',
    estCommission: 17000000,
    rm: 'Kavya R.',
  },
]

export const messages: Message[] = [
  {
    id: 'msg_001',
    listingId: 'JD-BLR-2026-012',
    authorId: 'landowner_ramanathan_002',
    authorName: 'S. Ramanathan · Ramanathan Holdings LLP',
    body: "Welcome, Rajesh. Happy to discuss the JD terms once you've reviewed the title set.",
    createdAt: '2026-06-25T10:15+00:00',
  },
  {
    id: 'msg_002',
    listingId: 'JD-BLR-2026-012',
    authorId: 'builder_rajesh_001',
    authorName: 'Rajesh Menon · Rajesh Developers',
    body: 'Thank you. The FSI and approvals look clean — can we schedule a site walk next week?',
    createdAt: '2026-06-25T11:40+00:00',
  },
  {
    id: 'msg_003',
    listingId: 'JD-BLR-2026-012',
    authorId: 'landowner_ramanathan_002',
    authorName: 'S. Ramanathan · Ramanathan Holdings LLP',
    body: 'Certainly. Our RM Kavya will coordinate — proposing Tuesday morning.',
    createdAt: '2026-06-26T09:05+00:00',
  },
]

export const documents: Document[] = (() => {
  const per = [
    { key: 'title-deed', name: 'Title deed', kind: 'deed' },
    { key: 'ec', name: 'Encumbrance certificate', kind: 'certificate' },
    { key: 'survey', name: 'Boundary survey', kind: 'survey' },
    { key: 'tax', name: 'Tax receipts (3 yrs)', kind: 'receipt' },
  ]
  const out: Document[] = []
  for (const lid of ['JD-BLR-2026-012', 'WH-BLR-2026-047', 'BL-BLR-2026-008']) {
    for (const p of per) out.push({ id: `${lid}-${p.key}`, listingId: lid, name: p.name, kind: p.kind })
  }
  return out
})()

export const architectReviews: ArchitectReview[] = [
  {
    id: 'ar_001',
    listingId: 'JD-BLR-2026-012',
    builderId: 'builder_rajesh_001',
    builderName: 'Rajesh Menon · Rajesh Developers',
    status: 'delivered',
    fee: 250000,
    mlSnapshot: { units: 130, saleableSqft: 183259, baseNet: 862000000, constructionCost: 731000000, salePsf: 8200 },
    architectName: 'Sundaram & Associates · CoA CA/2011/48210',
    architectGdv: 834000000,
    architectNotes:
      'Massing holds at G+14 across four towers. Two units per floor drop to meet NBC refuge-floor and lift-lobby norms, trimming saleable ~1.6%. Construction rate revised up for the podium transfer-slab. Net: a disciplined, financeable model — buildable as drawn.',
    requestedAt: '2026-06-26T09:20:00+00:00',
    deliveredAt: '2026-06-29T17:05:00+00:00',
  },
  {
    id: 'ar_002',
    listingId: 'WH-BLR-2026-047',
    builderId: 'builder_rajesh_001',
    builderName: 'Rajesh Menon · Rajesh Developers',
    status: 'requested',
    fee: 250000,
    mlSnapshot: { units: 1, saleableSqft: 101200, baseNet: 214000000, constructionCost: 289000000, salePsf: 3100 },
    requestedAt: '2026-07-01T12:40:00+00:00',
  },
]

export const activityEvents: ActivityEvent[] = [
  { id: 'ev_0', actorName: 'Terracrest Desk', actorId: 'builder_rajesh_001', kind: 'access', summary: 'Rajesh Menon · Rajesh Developers granted membership access', createdAt: '2026-03-11T09:00:00+00:00' },
  { id: 'ev_1', actorName: 'Terracrest Desk', kind: 'listing_created', listingId: 'JD-BLR-2026-012', summary: 'Parcel JD-BLR-2026-012 created — North-corridor JD parcel', createdAt: '2026-06-14T09:12:00+00:00' },
  { id: 'ev_2', actorName: 'Terracrest Desk', kind: 'status_change', listingId: 'JD-BLR-2026-012', summary: 'JD-BLR-2026-012 → live', createdAt: '2026-06-20T15:41:00+00:00' },
  { id: 'ev_3', actorName: 'Rajesh Menon · Rajesh Developers', actorId: 'builder_rajesh_001', kind: 'login', summary: 'Rajesh Menon · Rajesh Developers signed in', createdAt: '2026-06-24T08:03:00+00:00' },
  { id: 'ev_4', actorName: 'Rajesh Menon · Rajesh Developers', actorId: 'builder_rajesh_001', kind: 'document', listingId: 'JD-BLR-2026-012', summary: 'Rajesh Menon · Rajesh Developers opened “Title deed” — North-corridor JD parcel', createdAt: '2026-06-24T10:31:00+00:00' },
  { id: 'ev_5', actorName: 'Rajesh Menon · Rajesh Developers', actorId: 'builder_rajesh_001', kind: 'message', listingId: 'JD-BLR-2026-012', summary: 'Rajesh Menon · Rajesh Developers posted in the North-corridor JD parcel Deal Room', createdAt: '2026-06-25T11:40:00+00:00' },
]
