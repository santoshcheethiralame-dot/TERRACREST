type SliderProps = {
  label: string
  value: number
  min: number
  max: number
  step?: number
  onChange: (v: number) => void
  format?: (v: number) => string
  hint?: string
}

export function Slider({ label, value, min, max, step = 1, onChange, format, hint }: SliderProps) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <label className="label text-ink-faint">{label}</label>
        <span className="mono text-sm text-accent">{format ? format(value) : value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        aria-label={label}
        className="mt-2.5 h-1 w-full cursor-pointer appearance-none rounded-full bg-[color:var(--line-strong)] accent-[#1E4D3B]"
      />
      {hint && <p className="mt-1.5 text-[0.7rem] leading-snug text-ink-faint">{hint}</p>}
    </div>
  )
}
