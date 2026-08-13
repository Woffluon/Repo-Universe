import Link from 'next/link'
import { ArrowLeft } from '@phosphor-icons/react/dist/ssr'
import { Brand } from '@/components/ui/logo'
import { t } from '@/lib/i18n'
import { getLocale } from '@/lib/locale'

export const instant = false

export default async function NotFound() {
  const locale = await getLocale()
  return (
    <main className="status-page">
      <Brand />
      <p className="eyebrow">{t(locale, 'notFound.eyebrow')}</p>
      <h1>{t(locale, 'notFound.title')}</h1>
      <p>{t(locale, 'notFound.text')}</p>
      <Link href="/" className="button-secondary"><ArrowLeft size={18} aria-hidden="true" /> {t(locale, 'notFound.back')}</Link>
    </main>
  )
}
