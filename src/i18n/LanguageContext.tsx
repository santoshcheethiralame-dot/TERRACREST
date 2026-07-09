import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { translations, type Lang } from './translations'

/* ============================================================
   Language — a light dictionary-lookup i18n, not a full library.
   The whole app is EN/KN; keys are namespaced by screen. Falls
   back to the English string (or the raw key) if a KN entry is
   ever missing, so a partial translation never breaks a screen.
   ============================================================ */

const STORAGE_KEY = 'tc_lang'

interface LanguageContextValue {
  lang: Lang
  setLang: (l: Lang) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined)

function readLang(): Lang {
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored === 'kn' ? 'kn' : 'en'
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(readLang)

  const setLang = useCallback((l: Lang) => {
    setLangState(l)
    localStorage.setItem(STORAGE_KEY, l)
  }, [])

  const t = useCallback(
    (key: string): string => {
      const row = translations[key]
      if (!row) return key
      return row[lang] ?? row.en ?? key
    },
    [lang],
  )

  return <LanguageContext.Provider value={{ lang, setLang, t }}>{children}</LanguageContext.Provider>
}

export function useLang(): LanguageContextValue {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLang must be used within LanguageProvider')
  return ctx
}
