import { useId } from 'react'

type SealProps = {
  size?: number
  /** Optional text set around the ring (uppercased, tracked). */
  text?: string
  className?: string
}

/**
 * The house verification seal — a brushed-accent ring with optional circular
 * legend and a surveyor's star at center. Used as crest, favicon echo, and
 * the "physically verified" stamp on listings.
 */
export function Seal({ size = 84, text, className = '' }: SealProps) {
  const raw = useId().replace(/[:]/g, '')
  const ringId = `seal-ring-${raw}`
  return (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label={text ? text : 'Verified by Terracrest'}
    >
      <defs>
        {/* clockwise circle for the legend text */}
        <path id={ringId} fill="none" d="M60,60 m-45,0 a45,45 0 1,1 90,0 a45,45 0 1,1 -90,0" />
      </defs>
      <circle cx="60" cy="60" r="57" fill="none" stroke="#A8842C" strokeWidth="0.75" opacity="0.9" />
      <circle cx="60" cy="60" r="52" fill="none" stroke="#A8842C" strokeWidth="0.5" strokeDasharray="1 3.5" opacity="0.65" />
      {text && (
        <text fill="#A8842C" fontFamily="'IBM Plex Mono', monospace" fontSize="6.4" letterSpacing="2.4">
          <textPath href={`#${ringId}`} startOffset="0">
            {text}
          </textPath>
        </text>
      )}
      <path
        d="M60 41 L63.1 52.6 L75.1 52.6 L65.4 59.8 L69 71.4 L60 64.3 L51 71.4 L54.6 59.8 L44.9 52.6 L56.9 52.6 Z"
        fill="#A8842C"
        opacity="0.92"
      />
    </svg>
  )
}
