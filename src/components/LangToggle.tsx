import { useLang } from '@/i18n/LanguageContext'

/**
 * EN / ಕನ್ನಡ toggle — placed in every screen's persistent chrome.
 * `tone="inverted"` is for dark backgrounds (the footer's forest band);
 * default is for the paper canvas used everywhere else.
 */
export function LangToggle({ className = '', tone = 'default' }: { className?: string; tone?: 'default' | 'inverted' }) {
  const { lang, setLang, t } = useLang()
  const border = tone === 'inverted' ? 'border-paper/25' : 'border-line'
  const inactive = tone === 'inverted' ? 'text-paper/55 hover:text-paper' : 'text-ink-faint hover:text-ink'
  const active = tone === 'inverted' ? 'bg-gold text-ink' : 'bg-accent text-paper'
  return (
    <div className={`inline-flex shrink-0 overflow-hidden border ${border} ${className}`}>
      <button onClick={() => setLang('en')} className={`label px-2.5 py-1.5 transition-colors ${lang === 'en' ? active : inactive}`}>
        {t('lang.en')}
      </button>
      <button onClick={() => setLang('kn')} className={`label px-2.5 py-1.5 transition-colors ${lang === 'kn' ? active : inactive}`}>
        {t('lang.kn')}
      </button>
    </div>
  )
}
