import { Brand } from '@/components/ui/logo'
import { t } from '@/lib/i18n'
import { getLocale } from '@/lib/locale'

export const instant = false

export default async function RepositoryLoading() {
  const locale = await getLocale()
  return (
    <main className="universe-loading-page">
      <div className="loading-stars" aria-hidden="true" />
      <Brand />
      <div className="loading-orbit" aria-hidden="true"><span /></div>
      <p className="eyebrow">{t(locale, 'loading.eyebrow')}</p>
      <h1>{t(locale, 'loading.title')}</h1>
      <p>{t(locale, 'loading.text')}</p>
    </main>
  )
}
