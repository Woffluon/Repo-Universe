import Link from 'next/link'
import { GithubLogo } from '@phosphor-icons/react/dist/ssr'
import { type Locale, t } from '@/lib/i18n'
import { LanguageSwitcher } from './language-switcher'
import { Brand } from './logo'

export function SiteHeader({ locale }: { locale: Locale }) {
  return (
    <header className="site-header shell">
      <Link href="/" className="site-brand-island" aria-label={t(locale, 'nav.home')}>
        <Brand />
      </Link>
      <nav className="site-nav-island" aria-label={t(locale, 'nav.primary')}>
        <Link href="/#explore">{t(locale, 'nav.explore')}</Link>
        <Link href="/about">{t(locale, 'nav.about')}</Link>
        <a href="https://github.com" target="_blank" rel="noreferrer" aria-label={t(locale, 'nav.githubDataLabel')}>
          <GithubLogo size={17} aria-hidden="true" />
          <span className="desktop-only">{t(locale, 'nav.githubData')}</span>
        </a>
        <LanguageSwitcher locale={locale} />
      </nav>
    </header>
  )
}
