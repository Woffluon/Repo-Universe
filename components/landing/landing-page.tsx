import Link from 'next/link'
import { ArrowUpRight, GitFork, Planet, Star, UsersThree } from '@phosphor-icons/react/dist/ssr'
import { RepositorySearch } from '@/components/repository-search/repository-search'
import { SiteHeader } from '@/components/ui/site-header'
import { type Locale, t } from '@/lib/i18n'
import { LandingPreview } from './landing-preview'

const EXAMPLES = [
  ['facebook/react', '/facebook/react'],
  ['vercel/next.js', '/vercel/next.js'],
  ['microsoft/typescript', '/microsoft/typescript'],
] as const

export function LandingPage({ locale }: { locale: Locale }) {
  return (
    <main className="landing-page">
      <SiteHeader locale={locale} />

      <section className="hero shell" id="explore">
        <div className="hero-copy">
          <p className="eyebrow">{t(locale, 'landing.eyebrow')}</p>
          <h1>{t(locale, 'landing.title')}</h1>
          <p className="hero-lede">{t(locale, 'landing.lede')}</p>
          <RepositorySearch locale={locale} />
          <div className="example-links" aria-label={t(locale, 'landing.examples')}>
            <span>{t(locale, 'landing.tryKnown')}</span>
            {EXAMPLES.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}
          </div>
        </div>
        <LandingPreview locale={locale} />
      </section>

      <section className="system-legend shell" aria-labelledby="system-legend-title">
        <div className="legend-intro">
          <h2 id="system-legend-title">{t(locale, 'landing.legendTitle')}</h2>
          <p>{t(locale, 'landing.legendText')}</p>
        </div>
        <div className="legend-grid">
          <article className="legend-primary">
            <Star size={24} weight="fill" aria-hidden="true" />
            <div><h3>{t(locale, 'landing.repository')}</h3><p>{t(locale, 'landing.repositoryText')}</p></div>
          </article>
          <article>
            <Planet size={23} aria-hidden="true" />
            <div><h3>{t(locale, 'landing.languages')}</h3><p>{t(locale, 'landing.languagesText')}</p></div>
          </article>
          <article>
            <UsersThree size={23} aria-hidden="true" />
            <div><h3>{t(locale, 'landing.contributors')}</h3><p>{t(locale, 'landing.contributorsText')}</p></div>
          </article>
          <article className="legend-wide">
            <GitFork size={23} aria-hidden="true" />
            <div><h3>{t(locale, 'landing.forks')}</h3><p>{t(locale, 'landing.forksText')}</p></div>
          </article>
        </div>
      </section>

      <section className="landing-coda shell">
        <div>
          <h2>{t(locale, 'landing.codaTitle')}</h2>
          <p>{t(locale, 'landing.codaText')}</p>
        </div>
        <Link href="/#explore" className="text-link">{t(locale, 'landing.exploreRepository')} <ArrowUpRight size={18} aria-hidden="true" /></Link>
      </section>

      <footer className="footer shell">
        <span>Repo Universe</span>
        <div>
          <Link href="/about">{t(locale, 'nav.about')}</Link>
          <Link href="/privacy">{t(locale, 'footer.privacy')}</Link>
          <a href="https://docs.github.com" target="_blank" rel="noreferrer">GitHub API</a>
        </div>
      </footer>
    </main>
  )
}
