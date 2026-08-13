'use client'

import { useRouter } from 'next/navigation'
import { type Locale, locales, t } from '@/lib/i18n'

export function LanguageSwitcher({ locale }: { locale: Locale }) {
  const router = useRouter()

  async function select(nextLocale: Locale) {
    if (nextLocale === locale) return
    await fetch('/api/locale', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ locale: nextLocale }),
    })
    router.refresh()
  }

  return (
    <div className="language-switcher" role="group" aria-label={t(locale, 'nav.language')}>
      {locales.map((value) => (
        <button key={value} type="button" className={locale === value ? 'active' : undefined} onClick={() => void select(value)} aria-pressed={locale === value}>
          {t(locale, value === 'tr' ? 'language.turkish' : 'language.english')}
        </button>
      ))}
    </div>
  )
}
