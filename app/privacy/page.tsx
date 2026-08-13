import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from '@phosphor-icons/react/dist/ssr'
import { SiteHeader } from '@/components/ui/site-header'
import { t } from '@/lib/i18n'
import { getLocale } from '@/lib/locale'

export const instant = false

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  return { title: t(locale, 'footer.privacy'), description: t(locale, 'privacy.lede') }
}

export default async function PrivacyPage() {
  const locale = await getLocale()
  return (
    <main className="document-page">
      <SiteHeader locale={locale} />
      <article className="prose-shell">
        <p className="eyebrow">{t(locale, 'privacy.eyebrow')}</p>
        <h1>{t(locale, 'privacy.title')}</h1>
        <p className="prose-lede">{t(locale, 'privacy.lede')}</p>
        <h2>{t(locale, 'privacy.requestsTitle')}</h2>
        <p>{t(locale, 'privacy.requestsText')}</p>
        <h2>{t(locale, 'privacy.preferencesTitle')}</h2>
        <p>{t(locale, 'privacy.preferencesText')}</p>
        <h2>{t(locale, 'privacy.analyticsTitle')}</h2>
        <p>{t(locale, 'privacy.analyticsText')}</p>
        <h2>{t(locale, 'privacy.githubTitle')}</h2>
        <p>{t(locale, 'privacy.githubText')}</p>
        <Link href="/" className="text-link"><ArrowLeft size={18} aria-hidden="true" /> {t(locale, 'about.back')}</Link>
      </article>
    </main>
  )
}
