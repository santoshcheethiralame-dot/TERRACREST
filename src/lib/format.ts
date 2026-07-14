/* Indian-format number helpers — lakh/crore grouping, ₹, sq ft, psf. */

const groupFmt = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 })

/** 1234567 -> "12,34,567" (Indian grouping) */
export const groupIN = (n: number): string => groupFmt.format(Math.round(n))

export const rupees = (n: number): string => `₹${groupIN(n)}`

export const sqft = (n: number): string => `${groupIN(n)} sq ft`

export const psf = (n: number): string => `₹${groupIN(n)}/sq ft`

/** rupees -> crore units */
export const toCrore = (rupeeValue: number): number => rupeeValue / 1e7

/** rupees -> lakh units */
export const toLakh = (rupeeValue: number): number => rupeeValue / 1e5

/** format a crore-denominated number, e.g. formatCr(87.4) -> "₹87.4 Cr" */
export const formatCr = (crValue: number, dp = 1): string => `₹${crValue.toFixed(dp)} Cr`

/** format a raw rupee amount as crore, e.g. crFromRupees(874000000) -> "₹87.4 Cr" */
export const crFromRupees = (rupeeValue: number, dp = 1): string => formatCr(toCrore(rupeeValue), dp)

export const pct = (fraction: number, dp = 0): string => `${(fraction * 100).toFixed(dp)}%`
