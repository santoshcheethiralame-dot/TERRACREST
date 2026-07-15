import type { User, Listing, Engagement, Offer, Deal, Role, Document, NewListingInput, Message, DealShare, LawyerVerification, DocumentSummary, WarehouseReservation, PriceBook, ActivityEvent, ArchitectReview, MlSnapshot, ValuationContext, ValuationPrediction, ModelCard, RiskScore } from '@/domain/types'
import { users, listings, engagements, offers, deals, documents, messages, activityEvents, architectReviews, lawyerVerifications, documentSummaries, warehouseReservations } from '@/data/seed'
import { api, apiEnabled, ApiError, getBlobUrl } from '@/data/api'
import { defaultPriceBook } from '@/lib/gdv'
import { fallbackPredict, fallbackModelCard, fallbackRisk } from '@/lib/mlFallback'

/* ============================================================
   Repository — the single seam between the UI and the data.
   When VITE_API_URL is set it calls the FastAPI backend; when
   it isn't, it serves the in-memory seed. Components never know
   the difference — this is the "built to grow" pivot in action.
   ============================================================ */

export interface AuthResult {
  user: User
  accessToken: string | null
  refreshToken: string | null
}

// In-memory log — only used in fallback (no-backend) mode.
const reviewLog: ArchitectReview[] = [...architectReviews]

const latency = <T,>(value: T, ms = 160): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms))

const DISCOVERABLE: Listing['status'][] = ['verified', 'live', 'under-offer']

export const repo = {
  async authenticate(username: string, password: string): Promise<AuthResult | null> {
    if (apiEnabled) {
      try {
        const res = await api.post<{ accessToken: string; refreshToken: string; user: User }>('/auth/login', { username, password })
        return { user: res.user, accessToken: res.accessToken, refreshToken: res.refreshToken }
      } catch (e) {
        if (e instanceof ApiError && e.status === 401) return null
        throw e
      }
    }
    const u = users.find((x) => x.username.toLowerCase() === username.trim().toLowerCase())
    return latency(u && password.length > 0 ? { user: u, accessToken: null, refreshToken: null } : null)
  },

  async getUser(id: string): Promise<User | undefined> {
    return latency(users.find((u) => u.id === id))
  },

  async listListings(): Promise<Listing[]> {
    if (apiEnabled) return api.get<Listing[]>('/listings')
    return latency(listings.filter((l) => DISCOVERABLE.includes(l.status)))
  },

  async getListing(id: string): Promise<Listing | undefined> {
    if (apiEnabled) {
      try {
        return await api.get<Listing>(`/listings/${id}`)
      } catch (e) {
        if (e instanceof ApiError && e.status === 404) return undefined
        throw e
      }
    }
    return latency(listings.find((l) => l.id === id))
  },

  async getEngagement(listingId: string): Promise<Engagement | undefined> {
    if (apiEnabled) return (await api.get<Engagement | null>(`/listings/${listingId}/engagement`)) ?? undefined
    return latency(engagements.find((e) => e.listingId === listingId))
  },

  async getOffers(listingId: string): Promise<Offer[]> {
    if (apiEnabled) return api.get<Offer[]>(`/listings/${listingId}/offers`)
    return latency(offers.filter((o) => o.listingId === listingId))
  },

  async getDealsForBuilder(builderId: string): Promise<Deal[]> {
    if (apiEnabled) return api.get<Deal[]>('/me/deals')
    return latency(deals.filter((d) => d.builderId === builderId))
  },

  async listingsForOwner(ownerId: string): Promise<Listing[]> {
    if (apiEnabled) return api.get<Listing[]>('/me/properties')
    return latency(listings.filter((l) => l.sealed.ownerId === ownerId))
  },

  // --- admin operations centre ---
  async adminListUsers(): Promise<User[]> {
    if (apiEnabled) return api.get<User[]>('/admin/users')
    return latency([...users])
  },

  async adminCreateUser(input: { username: string; displayName: string; role: Role; officeLocation?: string }): Promise<User> {
    if (apiEnabled) return api.post<User>('/admin/users', input)
    const user: User = {
      id: input.username.toLowerCase(),
      username: input.username.toLowerCase(),
      displayName: input.displayName,
      role: input.role,
      officeLocation: input.officeLocation,
      kycVerified: true,
      memberSince: new Date().toISOString().slice(0, 10),
    }
    if (!users.some((u) => u.username === user.username)) users.push(user)
    return latency(user, 300)
  },

  async adminListListings(): Promise<Listing[]> {
    if (apiEnabled) return api.get<Listing[]>('/admin/listings')
    return latency([...listings])
  },

  async adminSetStatus(listingId: string, status: Listing['status']): Promise<Listing> {
    if (apiEnabled) return api.patch<Listing>(`/admin/listings/${listingId}/status`, { status })
    const listing = listings.find((l) => l.id === listingId)
    if (listing) listing.status = status
    return latency(listing as Listing, 300)
  },

  async adminListDeals(): Promise<Deal[]> {
    if (apiEnabled) return api.get<Deal[]>('/admin/deals')
    return latency([...deals])
  },

  async adminCreateListing(input: NewListingInput): Promise<Listing> {
    if (apiEnabled) return api.post<Listing>('/admin/listings', input)
    const listing: Listing = {
      id: input.id,
      vertical: input.vertical,
      headline: input.headline,
      status: 'verified',
      localityLabel: input.localityLabel,
      areaLabel: input.areaLabel,
      landAreaSqft: input.landAreaSqft,
      zoning: input.zoning,
      localityNote: input.localityNote,
      verification: { by: 'Terracrest Site Team', on: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) },
      guidance: { low: input.guidanceLow, high: input.guidanceHigh },
      publicArea: { lat: input.areaLat, lng: input.areaLng, radiusKm: input.areaRadiusKm },
      sealed: {
        coords: { lat: input.exactLat, lng: input.exactLng },
        address: input.address,
        ownerName: input.ownerName,
        ownerId: input.ownerId,
        surveyNos: input.surveyNos.split(',').map((s) => s.trim()).filter(Boolean),
        contact: input.contact,
      },
      jd: input.vertical === 'joint-development' ? { fsi: input.fsi, approval: 'Admin-entered', roadWidthFt: 40, suggestedModel: 'TBD', timelineMonths: 36 } : undefined,
      comps: [],
      feasibility: {
        plotAreaSqft: input.plotAreaSqft,
        fsi: input.fsi,
        setbackM: 6,
        roadWidthFt: 40,
        towers: input.towers,
        floors: input.floors,
        floorPlateEfficiency: 0.78,
        avgUnitSqft: input.avgUnitSqft,
        baseSalePsf: input.baseSalePsf,
      },
      createdAt: new Date().toISOString().slice(0, 10),
    }
    listings.push(listing)
    const vault = [
      ['title-deed', 'Title deed', 'deed'],
      ['ec', 'Encumbrance certificate', 'certificate'],
      ['survey', 'Boundary survey', 'survey'],
      ['tax', 'Tax receipts (3 yrs)', 'receipt'],
    ]
    for (const [key, name, kind] of vault) documents.push({ id: `${input.id}-${key}`, listingId: input.id, name, kind })
    return latency(listing, 300)
  },

  async adminResetPassword(userId: string): Promise<{ tempPassword: string }> {
    if (apiEnabled) return api.patch<{ tempPassword: string }>(`/admin/users/${userId}/password`)
    return latency({ tempPassword: 'demo' }, 200)
  },

  async adminSetActive(userId: string, active: boolean): Promise<User> {
    if (apiEnabled) return api.patch<User>(`/admin/users/${userId}/active`, { active })
    const u = users.find((x) => x.id === userId)
    if (u) u.active = active
    return latency(u as User, 200)
  },

  async adminSetKyc(userId: string, verified: boolean): Promise<User> {
    if (apiEnabled) return api.patch<User>(`/admin/users/${userId}/kyc`, { verified })
    const u = users.find((x) => x.id === userId)
    if (u) u.kycVerified = verified
    return latency(u as User, 200)
  },

  // --- document vault ---
  async getDocuments(listingId: string): Promise<Document[]> {
    if (apiEnabled) return api.get<Document[]>(`/listings/${listingId}/documents`)
    return latency(documents.filter((d) => d.listingId === listingId))
  },

  /** Returns an object URL for the (watermarked) document, fetched with auth. */
  async documentUrl(listingId: string, docId: string): Promise<string> {
    if (apiEnabled) return getBlobUrl(`/listings/${listingId}/documents/${docId}`)
    const text = `DB TERRACREST ADVISORY\n\nDocument: ${docId}\nCONFIDENTIAL — watermarked demo copy.\nEvery view and download is logged.`
    return URL.createObjectURL(new Blob([text], { type: 'text/plain' }))
  },

  // --- deal room ---
  async getMessages(listingId: string): Promise<Message[]> {
    if (apiEnabled) return api.get<Message[]>(`/listings/${listingId}/messages`)
    return latency(messages.filter((m) => m.listingId === listingId))
  },

  async postMessage(listingId: string, body: string, opts?: { meetingTime?: string; dealShare?: DealShare }): Promise<Message> {
    if (apiEnabled) return api.post<Message>(`/listings/${listingId}/messages`, { body, ...opts })
    const msg: Message = {
      id: `msg_local_${messages.length + 1}`,
      listingId,
      authorId: 'you',
      authorName: 'You',
      body,
      createdAt: new Date().toISOString().slice(0, 16),
      meetingTime: opts?.meetingTime,
      dealShare: opts?.dealShare,
    }
    messages.push(msg)
    return latency(msg, 200)
  },

  // --- verification (lawyer + document summary) ---
  async getLawyerVerification(listingId: string): Promise<LawyerVerification | null> {
    if (apiEnabled) return (await api.get<LawyerVerification | null>(`/listings/${listingId}/lawyer-verification`)) ?? null
    return latency(lawyerVerifications.find((v) => v.listingId === listingId) ?? null)
  },

  async getDocumentSummary(listingId: string): Promise<DocumentSummary | null> {
    if (apiEnabled) return (await api.get<DocumentSummary | null>(`/listings/${listingId}/document-summary`)) ?? null
    return latency(documentSummaries.find((d) => d.listingId === listingId) ?? null)
  },

  async adminSaveLawyerVerification(
    listingId: string,
    input: { lawyerName: string; barCouncilNo: string; verificationDate: string; remarks: string; verified: boolean },
  ): Promise<LawyerVerification> {
    if (apiEnabled) return api.put<LawyerVerification>(`/admin/listings/${listingId}/lawyer-verification`, input)
    const rec: LawyerVerification = { listingId, ...input }
    const i = lawyerVerifications.findIndex((v) => v.listingId === listingId)
    if (i >= 0) lawyerVerifications[i] = rec
    else lawyerVerifications.push(rec)
    return latency(rec, 200)
  },

  async adminSaveDocumentSummary(
    listingId: string,
    input: { ownershipChain: string; ecSummary: string; taxHistory: string; kathaDetails: string },
  ): Promise<DocumentSummary> {
    if (apiEnabled) return api.put<DocumentSummary>(`/admin/listings/${listingId}/document-summary`, input)
    const rec: DocumentSummary = { listingId, ...input, preparedBy: 'Terracrest Desk', updatedAt: new Date().toISOString().slice(0, 16) }
    const i = documentSummaries.findIndex((d) => d.listingId === listingId)
    if (i >= 0) documentSummaries[i] = rec
    else documentSummaries.push(rec)
    return latency(rec, 200)
  },

  // --- warehouse reservations (business owner) ---
  async getMyReservations(): Promise<WarehouseReservation[]> {
    if (apiEnabled) return api.get<WarehouseReservation[]>('/me/reservations')
    return latency([...warehouseReservations].sort((a, b) => b.heldAt.localeCompare(a.heldAt)))
  },

  async holdReservation(listingId: string): Promise<WarehouseReservation> {
    if (apiEnabled) return api.post<WarehouseReservation>(`/listings/${listingId}/reservations`)
    const ACTIVE: WarehouseReservation['status'][] = ['held', 'confirmed']
    if (warehouseReservations.some((r) => r.listingId === listingId && ACTIVE.includes(r.status))) {
      throw new ApiError(409, 'This warehouse already has an active hold')
    }
    const now = new Date()
    const expires = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000)
    const res: WarehouseReservation = {
      id: `res_local_${warehouseReservations.length + 1}`,
      listingId,
      businessOwnerId: 'you',
      status: 'held',
      heldAt: now.toISOString().slice(0, 16),
      expiresAt: expires.toISOString().slice(0, 16),
    }
    warehouseReservations.push(res)
    return latency(res, 250)
  },

  async confirmReservation(id: string): Promise<WarehouseReservation> {
    if (apiEnabled) return api.patch<WarehouseReservation>(`/reservations/${id}/confirm`)
    const r = warehouseReservations.find((x) => x.id === id)
    if (r) {
      r.status = 'confirmed'
      r.confirmedAt = new Date().toISOString().slice(0, 16)
    }
    return latency(r as WarehouseReservation, 200)
  },

  async releaseReservation(id: string): Promise<WarehouseReservation> {
    if (apiEnabled) return api.patch<WarehouseReservation>(`/reservations/${id}/release`)
    const r = warehouseReservations.find((x) => x.id === id)
    if (r) {
      r.status = 'released'
      r.releasedAt = new Date().toISOString().slice(0, 16)
    }
    return latency(r as WarehouseReservation, 200)
  },

  // --- price book ---
  async getPriceBook(): Promise<PriceBook> {
    if (apiEnabled) return api.get<PriceBook>('/pricebook')
    return latency(defaultPriceBook())
  },

  async adminUpdatePriceBook(pb: PriceBook): Promise<PriceBook> {
    if (apiEnabled) return api.patch<PriceBook>('/admin/pricebook', pb)
    return latency(pb, 200)
  },

  // --- audit trail ---
  async adminActivity(): Promise<ActivityEvent[]> {
    if (apiEnabled) return api.get<ActivityEvent[]>('/admin/activity')
    return latency([...activityEvents].sort((a, b) => b.createdAt.localeCompare(a.createdAt)))
  },

  // --- valuation intelligence ---
  async predictValuation(ctx: ValuationContext): Promise<ValuationPrediction> {
    if (apiEnabled) return api.post<ValuationPrediction>('/valuation/predict', ctx)
    return latency(fallbackPredict(ctx), 120)
  },

  async getModelCard(): Promise<ModelCard> {
    if (apiEnabled) return api.get<ModelCard>('/valuation/model-card')
    return latency(fallbackModelCard())
  },

  async getListingRisk(listingId: string): Promise<RiskScore> {
    if (apiEnabled) return api.get<RiskScore>(`/listings/${listingId}/risk`)
    return latency(fallbackRisk(listingId))
  },

  async adminRetrainModel(): Promise<ModelCard> {
    if (apiEnabled) return api.post<ModelCard>('/admin/valuation/retrain')
    return latency(fallbackModelCard())
  },

  // --- architect validation (Studio Stage Two) ---
  async requestArchitectReview(listingId: string, mlSnapshot: MlSnapshot): Promise<ArchitectReview> {
    if (apiEnabled) return api.post<ArchitectReview>('/architect-reviews', { listingId, mlSnapshot })
    const review: ArchitectReview = {
      id: `ar_local_${reviewLog.length + 1}`,
      listingId,
      builderId: 'you',
      builderName: 'You',
      status: 'requested',
      fee: 250000,
      mlSnapshot,
      requestedAt: new Date().toISOString().slice(0, 19) + '+00:00',
    }
    reviewLog.unshift(review)
    return latency(review, 300)
  },

  async myArchitectReviews(): Promise<ArchitectReview[]> {
    if (apiEnabled) return api.get<ArchitectReview[]>('/me/architect-reviews')
    return latency([...reviewLog])
  },

  async adminArchitectReviews(): Promise<ArchitectReview[]> {
    if (apiEnabled) return api.get<ArchitectReview[]>('/admin/architect-reviews')
    return latency([...reviewLog])
  },

  async adminDeliverArchitectReview(
    id: string,
    payload: { architectName: string; architectGdv: number; architectNotes: string },
  ): Promise<ArchitectReview> {
    if (apiEnabled) return api.patch<ArchitectReview>(`/admin/architect-reviews/${id}`, payload)
    const r = reviewLog.find((x) => x.id === id)
    if (r) {
      r.status = 'delivered'
      r.architectName = payload.architectName
      r.architectGdv = payload.architectGdv
      r.architectNotes = payload.architectNotes
      r.deliveredAt = new Date().toISOString().slice(0, 19) + '+00:00'
    }
    return latency(r as ArchitectReview, 300)
  },
}

export type Repository = typeof repo
