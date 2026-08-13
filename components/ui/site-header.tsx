import Link from 'next/link'
import { GithubLogo } from '@phosphor-icons/react/dist/ssr'
import { Brand } from './logo'

export function SiteHeader() {
  return (
    <header className="site-header shell">
      <Link href="/" className="site-brand-island" aria-label="Repo Universe home">
        <Brand />
      </Link>
      <nav className="site-nav-island" aria-label="Primary navigation">
        <Link href="/#explore">Explore</Link>
        <Link href="/about">About</Link>
        <a href="https://github.com" target="_blank" rel="noreferrer" aria-label="Data provided by GitHub">
          <GithubLogo size={17} aria-hidden="true" />
          <span className="desktop-only">GitHub data</span>
        </a>
      </nav>
    </header>
  )
}
