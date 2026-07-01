import type { ReactNode } from 'react'

type RedactionProps = {
  children: ReactNode
  /** When true, the true value is shown. When false, it is masked. */
  unlocked?: boolean
  className?: string
}

/**
 * The signature masked-data motif. Wraps any value that is confidential until
 * a physical NDA is executed and logged. Unlocked, it simply renders the child.
 */
export function Redaction({ children, unlocked = false, className = '' }: RedactionProps) {
  if (unlocked) return <span className={className}>{children}</span>
  return (
    <span className={`redaction ${className}`} title="Sealed — unlocks on executed NDA" aria-label="Redacted">
      {children}
    </span>
  )
}
