import type { User, Listing, Nda, Engagement, Offer, Deal, Role, Document } from '@/domain/types'
import { users, listings, ndas as seedNdas, engagements, offers, deals, documents } from '@/data/seed'
import { api, apiEnabled, ApiError, getBlobUrl } from '@/data/api'

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

// In-memory NDA log — only used in fallback (no-backend) mode.
const ndaLog: Nda[] = [...seedNdas]

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

  async isUnlocked(listingId: string, builderId: string): Promise<boolean> {
    if (apiEnabled) return (await api.get<{ unlocked: boolean }>(`/listings/${listingId}/unlocked`)).unlocked
    return latency(ndaLog.some((n) => n.listingId === listingId && n.builderId === builderId))
  },

  /**
   * Logs an executed NDA — the only gate that unseals a parcel. In API mode the
   * server enforces this and only then serves the sealed fields on the next fetch.
   */
  async logNda(listingId: string, builderId: string): Promise<Nda> {
    if (apiEnabled) return api.post<Nda>(`/listings/${listingId}/nda`)
    const listing = listings.find((l) => l.id === listingId)
    const nda: Nda = {
      id: `NDA-${listingId}-${builderId}`,
      builderId,
      landownerId: listing?.sealed?.ownerId ?? 'unknown',
      listingId,
      signedOn: new Date().toISOString().slice(0, 10),
      witnessedBy: 'Adv. Meera Krishnan',
      scanRef: `/deals/${listingId}/nda/`,
    }
    if (!ndaLog.some((n) => n.id === nda.id)) ndaLog.push(nda)
    return latency(nda, 420)
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

  async ndasForBuilder(builderId: string): Promise<Nda[]> {
    if (apiEnabled) return api.get<Nda[]>('/me/ndas')
    return latency(ndaLog.filter((n) => n.builderId === builderId))
  },

  async ndasForListing(listingId: string): Promise<Nda[]> {
    if (apiEnabled) return api.get<Nda[]>(`/listings/${listingId}/ndas`)
    return latency(ndaLog.filter((n) => n.listingId === listingId))
  },

  async listingsForOwner(ownerId: string): Promise<Listing[]> {
    if (apiEnabled) return api.get<Listing[]>('/me/properties')
    return latency(listings.filter((l) => l.sealed?.ownerId === ownerId))
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

  async adminListNdas(): Promise<Nda[]> {
    if (apiEnabled) return api.get<Nda[]>('/admin/ndas')
    return latency([...ndaLog])
  },

  async adminLogNda(builderId: string, listingId: string): Promise<Nda> {
    if (apiEnabled) return api.post<Nda>('/admin/ndas', { builderId, listingId })
    const listing = listings.find((l) => l.id === listingId)
    const nda: Nda = {
      id: `NDA-${listingId}-${builderId}`,
      builderId,
      landownerId: listing?.sealed?.ownerId ?? 'unknown',
      listingId,
      signedOn: new Date().toISOString().slice(0, 10),
      witnessedBy: 'Adv. Meera Krishnan',
      scanRef: `/deals/${listingId}/nda/`,
    }
    if (!ndaLog.some((n) => n.id === nda.id)) ndaLog.push(nda)
    return latency(nda, 300)
  },

  async adminListDeals(): Promise<Deal[]> {
    if (apiEnabled) return api.get<Deal[]>('/admin/deals')
    return latency([...deals])
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
}

export type Repository = typeof repo
