import { useState, useRef } from 'react'
import { API_URL } from '@/data/api'

export function OcrScanner({ docId }: { docId: string }) {
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setScanning(true)
    setError(null)
    setResult(null)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch(`${API_URL}/api/ocr`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`OCR Server Error: ${response.status}`)
      }

      const data = await response.json()
      setResult(data.text)
    } catch (err: any) {
      setError(err.message || 'Failed to connect to OCR server.')
    } finally {
      setScanning(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <div className="mt-3 overflow-hidden rounded-md border border-[color:var(--line-strong)] bg-paper-raise/30 p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-ink">AI Document Scanner (Kannada)</p>
        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileChange}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={scanning}
          className="label bg-accent px-4 py-2 text-paper transition-colors hover:bg-accent-bright disabled:opacity-50"
        >
          {scanning ? 'Scanning...' : 'Upload & Scan'}
        </button>
      </div>

      {error && (
        <div className="mt-3 border-l-2 border-oxblood-bright pl-3 text-sm text-oxblood-bright">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-4 border-t border-[color:var(--line-strong)] pt-3">
          <p className="text-xs uppercase tracking-widest text-ink-dim">Extracted Text:</p>
          <p className="mt-2 text-sm leading-relaxed text-ink font-mono whitespace-pre-wrap">
            {result}
          </p>
        </div>
      )}
    </div>
  )
}
