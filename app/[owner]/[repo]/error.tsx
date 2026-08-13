'use client'

import { ArrowCounterClockwise, House } from '@phosphor-icons/react'
import Link from 'next/link'
import { LOCALE_COOKIE, type Locale, t } from '@/lib/i18n'

export default function RepositoryError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const locale: Locale = document.cookie.includes(`${LOCALE_COOKIE}=tr`) ? 'tr' : 'en'
  return (
    <main className="status-page">
      <p className="eyebrow">{t(locale, 'error.eyebrow')}</p>
      <h1>{t(locale, 'error.title')}</h1>
      <p>{t(locale, 'error.text')}</p>
      <div className="status-actions">
        <button type="button" className="button-primary" onClick={reset}><ArrowCounterClockwise size={18} /> {t(locale, 'error.retry')}</button>
        <Link href="/" className="button-secondary"><House size={18} /> {t(locale, 'error.home')}</Link>
      </div>
    </main>
  )
}
