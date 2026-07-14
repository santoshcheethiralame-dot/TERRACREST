import type { Variants } from 'framer-motion'

// Deliberate, expensive easing — nothing snaps.
export const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

export const rise: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.95, ease: EASE } },
}

export const fade: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 1.2, ease: EASE } },
}

export const drawLine: Variants = {
  hidden: { scaleX: 0, opacity: 0 },
  show: { scaleX: 1, opacity: 1, transition: { duration: 1.1, ease: EASE } },
}

export const stagger = (delayChildren = 0.1, staggerChildren = 0.09): Variants => ({
  hidden: {},
  show: { transition: { delayChildren, staggerChildren } },
})

// Reveal-on-scroll viewport config, reused across sections.
export const inView = { once: true, amount: 0.4 } as const
