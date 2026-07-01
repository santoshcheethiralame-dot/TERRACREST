/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: 'var(--ink)',
          raise: 'var(--ink-raise)',
          card: 'var(--ink-card)',
        },
        navy: 'var(--navy)',
        ivory: {
          DEFAULT: 'var(--ivory)',
          dim: 'var(--ivory-dim)',
          faint: 'var(--ivory-faint)',
        },
        gold: {
          DEFAULT: 'var(--gold)',
          bright: 'var(--gold-bright)',
          deep: 'var(--gold-deep)',
        },
        emerald: {
          DEFAULT: 'var(--emerald)',
          bright: 'var(--emerald-bright)',
        },
        oxblood: {
          DEFAULT: 'var(--oxblood)',
          bright: 'var(--oxblood-bright)',
        },
      },
      fontFamily: {
        display: ['Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['Satoshi', 'system-ui', 'sans-serif'],
        mono: ['IBM Plex Mono', 'ui-monospace', 'monospace'],
      },
      letterSpacing: {
        label: '0.24em',
        wide2: '0.14em',
      },
      maxWidth: {
        shell: '1320px',
      },
      boxShadow: {
        deep: '0 30px 80px -30px rgba(0,0,0,0.85)',
        lift: '0 12px 40px -20px rgba(0,0,0,0.7)',
      },
    },
  },
  plugins: [],
}
