import { useRef, useState } from 'react'
import { apiEnabled, ApiError, postForm } from '@/data/api'
import { useLang } from '@/i18n/LanguageContext'

const MAX_BYTES = 8 * 1024 * 1024

interface OcrResult {
  text: string
  confidence: number
  engine: string
}

/* Kannada document scanner. Uploads a scan/photo to /api/ocr, which reads it
   with Tesseract (kan+eng). The empanelled CRNN model becomes "Pass 1" server-
   side once it is trained on Kannada — no change needed here. */
export function OcrScanner({ className = '' }: { className?: string }) {
  const { t } = useLang()
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState<OcrResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (inputRef.current) inputRef.current.value = ''
    if (!file) return
    if (file.size > MAX_BYTES) {
      setResult(null)
      setError(t('ocr.tooLarge'))
      return
    }

    setScanning(true)
    setError(null)
    setResult(null)
    try {
      const form = new FormData()
      form.append('file', file)
      const data = await postForm<OcrResult>('/api/ocr', form)
      if (!data.text.trim()) setError(t('ocr.noText'))
      else setResult(data)
    } catch (err) {
      const status = err instanceof ApiError ? err.status : 0
      setError(status === 503 ? t('ocr.unavailable') : status === 413 ? t('ocr.tooLarge') : t('ocr.failed'))
    } finally {
      setScanning(false)
    }
  }

  return (
    <div className={`border border-line bg-paper-raise/40 p-5 ${className}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="label text-accent">{t('ocr.title')}</p>
          <p className="mt-2 text-[0.82rem] leading-relaxed text-ink-faint">{t('ocr.hint')}</p>
        </div>
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onFile} disabled={!apiEnabled || scanning} />
        <button
          onClick={() => inputRef.current?.click()}
          disabled={!apiEnabled || scanning}
          className="label shrink-0 bg-accent px-4 py-2.5 text-paper transition-colors hover:bg-accent-bright disabled:opacity-50"
        >
          {scanning ? t('ocr.scanning') : t('ocr.upload')}
        </button>
      </div>

      {!apiEnabled && <p className="mt-4 text-[0.8rem] text-ink-faint">{t('ocr.demoOnly')}</p>}

      {error && <p className="mt-4 border-l-2 border-oxblood-bright pl-3 text-[0.85rem] text-oxblood-bright">{error}</p>}

      {result && (
        <div className="mt-4 border-t border-line pt-4">
          <div className="flex items-baseline justify-between gap-3">
            <p className="label text-ink-faint">{t('ocr.extracted')}</p>
            <span className="mono text-[0.68rem] text-ink-faint">
              {Math.round(result.confidence * 100)}% {t('ocr.confidence')} · {result.engine}
            </span>
          </div>
          <p className="mt-2 whitespace-pre-wrap text-[0.9rem] leading-relaxed text-ink">{result.text}</p>
        </div>
      )}
    </div>
  )
}
