import Link from 'next/link'
import { ArrowUpRight, GitFork, Planet, Star, UsersThree } from '@phosphor-icons/react/dist/ssr'
import { RepositorySearch } from '@/components/repository-search/repository-search'
import { SiteHeader } from '@/components/ui/site-header'
import { LandingPreview } from './landing-preview'

const EXAMPLES = [
  ['facebook/react', '/facebook/react'],
  ['vercel/next.js', '/vercel/next.js'],
  ['microsoft/typescript', '/microsoft/typescript'],
] as const

export function LandingPage() {
  return (
    <main className="landing-page">
      <SiteHeader />

      <section className="hero shell" id="explore">
        <div className="hero-copy">
          <p className="eyebrow">GitHub, mapped into space</p>
          <h1>Every repository has a universe.</h1>
          <p className="hero-lede">Turn a public GitHub repository into an explorable solar system built from its real code, people and activity.</p>
          <RepositorySearch />
          <div className="example-links" aria-label="Example repositories">
            <span>Try a known system</span>
            {EXAMPLES.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}
          </div>
        </div>
        <LandingPreview />
      </section>

      <section className="system-legend shell" aria-labelledby="system-legend-title">
        <div className="legend-intro">
          <h2 id="system-legend-title">Code becomes a place you can navigate.</h2>
          <p>The universe keeps the metaphor focused. Repository structure becomes spatial; precise metadata stays readable in the inspector.</p>
        </div>
        <div className="legend-grid">
          <article className="legend-primary">
            <Star size={24} weight="fill" aria-hidden="true" />
            <div><h3>Repository</h3><p>The central star. Popularity shapes scale and corona, while recent activity changes its energy.</p></div>
          </article>
          <article>
            <Planet size={23} aria-hidden="true" />
            <div><h3>Languages</h3><p>The dominant languages become distinct planets with deterministic surfaces and orbit geometry.</p></div>
          </article>
          <article>
            <UsersThree size={23} aria-hidden="true" />
            <div><h3>Contributors</h3><p>The strongest contributor signals live in the outer system. More remain available in the inspector.</p></div>
          </article>
          <article className="legend-wide">
            <GitFork size={23} aria-hidden="true" />
            <div><h3>Forks</h3><p>Fork count drives a procedural asteroid belt instead of generating one object per fork.</p></div>
          </article>
        </div>
      </section>

      <section className="landing-coda shell">
        <div>
          <h2>Paste another repository just to see what changes.</h2>
          <p>Same repository, same underlying universe. Different project, completely different system.</p>
        </div>
        <Link href="/#explore" className="text-link">Explore a repository <ArrowUpRight size={18} aria-hidden="true" /></Link>
      </section>

      <footer className="footer shell">
        <span>Repo Universe</span>
        <div>
          <Link href="/about">About</Link>
          <Link href="/privacy">Privacy</Link>
          <a href="https://docs.github.com" target="_blank" rel="noreferrer">GitHub API</a>
        </div>
      </footer>
    </main>
  )
}
