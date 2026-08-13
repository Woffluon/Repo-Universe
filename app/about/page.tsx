import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from '@phosphor-icons/react/dist/ssr'
import { SiteHeader } from '@/components/ui/site-header'
import { t } from '@/lib/i18n'
import { getLocale } from '@/lib/locale'

export const instant = false

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  return { title: t(locale, 'nav.about'), description: t(locale, 'about.lede') }
}

export default async function AboutPage() {
  const locale = await getLocale()
  return (
    <main className="document-page">
      <SiteHeader locale={locale} />
      <article className="prose-shell">
        <p className="eyebrow">{t(locale, 'about.eyebrow')}</p>
        <h1>{t(locale, 'about.title')}</h1>
        <p className="prose-lede">{t(locale, 'about.lede')}</p>
        <h2>{t(locale, 'about.mappingTitle')}</h2>
        <p>{t(locale, 'about.mappingText')}</p>
        <h2>{t(locale, 'about.deterministicTitle')}</h2>
        <p>{t(locale, 'about.deterministicText')}</p>
        <h2>{t(locale, 'about.dataTitle')}</h2>
        <p>{t(locale, 'about.dataText')}</p>
        <Link href="/" className="text-link"><ArrowLeft size={18} aria-hidden="true" /> {t(locale, 'about.back')}</Link>
      </article>
    </main>
  )
}
