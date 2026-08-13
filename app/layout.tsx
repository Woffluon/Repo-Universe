import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { t } from '@/lib/i18n'
import { getLocale } from '@/lib/locale'
import { SITE_NAME, getSiteUrl } from '@/lib/site'
import './globals.css'

export const instant = false

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  const title = `${SITE_NAME} - ${t(locale, 'landing.title')}`
  const description = t(locale, 'landing.lede')
  return {
    metadataBase: getSiteUrl(),
    title: { default: title, template: `%s - ${SITE_NAME}` },
    description,
    applicationName: SITE_NAME,
    openGraph: { title, description, type: 'website', siteName: SITE_NAME },
    twitter: { card: 'summary_large_image', title, description },
  }
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const locale = await getLocale()
  return (
    <html lang={locale === 'tr' ? 'tr-TR' : 'en'} className="dark">
      <body>{children}</body>
    </html>
  )
}
