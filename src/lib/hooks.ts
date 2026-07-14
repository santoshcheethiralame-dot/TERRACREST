import { useEffect, useRef, useState } from 'react'

/**
 * Smoothly tweens a displayed number toward a target whenever it changes.
 * Uses rAF for a smooth count in a foreground tab, but a timer safety-net
 * guarantees the value always converges to the target even when rAF is
 * throttled (e.g. a backgrounded tab) — so the number is never stale.
 */
export function useCountUp(target: number, durationMs = 700): number {
  const [value, setValue] = useState(target)
  const fromRef = useRef(target)
  const rafRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    const from = fromRef.current
    if (from === target) return

    let start = 0
    let settled = false
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)

    const settle = () => {
      if (settled) return
      settled = true
      fromRef.current = target
      setValue(target)
    }

    const step = (ts: number) => {
      if (!start) start = ts
      const p = Math.min(1, (ts - start) / durationMs)
      const next = from + (target - from) * easeOutCubic(p)
      fromRef.current = next
      setValue(next)
      if (p < 1) rafRef.current = requestAnimationFrame(step)
      else settle()
    }

    rafRef.current = requestAnimationFrame(step)
    const fallback = window.setTimeout(settle, durationMs + 120)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      clearTimeout(fallback)
    }
  }, [target, durationMs])

  return value
}
