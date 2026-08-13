import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from '@phosphor-icons/react/dist/ssr'
import { SiteHeader } from '@/components/ui/site-header'

export const metadata: Metadata = {
  title: 'About',
  description: 'How Repo Universe turns public GitHub repository data into a deterministic 3D solar system.',
}

export default function AboutPage() {
  return (
    <main className="document-page">
      <SiteHeader />
      <article className="prose-shell">
        <p className="eyebrow">ABOUT</p>
        <h1>Code has structure. Repo Universe gives it space.</h1>
        <p className="prose-lede">
          Repo Universe is an interactive visualization experiment that maps public repository metadata into a deterministic solar system.
        </p>
        <h2>What becomes what</h2>
        <p>
          The repository is the central star, languages become planets, top contributors appear as outer-system signals, and fork volume shapes an asteroid belt. Metrics that would become misleading metaphors remain normal data in the inspector.
        </p>
        <h2>Deterministic by design</h2>
        <p>
          Permanent layout comes from a stable hash of the repository identity and a seeded pseudo-random generator. Reloading the same repository does not create a completely different solar system.
        </p>
        <h2>Built around public data</h2>
        <p>
          Repo Universe has no account system, database, payments, private-repository access, analytics by default, or AI feature. Repository data is requested server-side from GitHub and cached to reduce API usage.
        </p>
        <Link href="/" className="text-link"><ArrowLeft size={18} aria-hidden="true" /> Back to exploration</Link>
      </article>
    </main>
  )
}
