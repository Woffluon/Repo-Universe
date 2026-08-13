import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from '@phosphor-icons/react/dist/ssr'
import { SiteHeader } from '@/components/ui/site-header'

export const metadata: Metadata = {
  title: 'Privacy',
  description: 'Repo Universe privacy and data handling notes.',
}

export default function PrivacyPage() {
  return (
    <main className="document-page">
      <SiteHeader />
      <article className="prose-shell">
        <p className="eyebrow">PRIVACY</p>
        <h1>Minimal data by default.</h1>
        <p className="prose-lede">Repo Universe is designed to work without user accounts or persistent user-generated data.</p>
        <h2>Repository requests</h2>
        <p>
          When you explore a repository, its public owner/name pair is used by the server to request public metadata from GitHub. Arbitrary user-provided URLs are never fetched.
        </p>
        <h2>Local preferences</h2>
        <p>
          An explicit graphics-quality preference may be stored in your browser&apos;s localStorage. It stays on your device and is not used for tracking.
        </p>
        <h2>Analytics and advertising</h2>
        <p>Repo Universe includes no analytics, advertising, payments, registration, or authentication by default.</p>
        <h2>GitHub</h2>
        <p>
          Public repository and contributor information comes from GitHub&apos;s API and is subject to GitHub&apos;s own terms and privacy practices.
        </p>
        <Link href="/" className="text-link"><ArrowLeft size={18} aria-hidden="true" /> Back to exploration</Link>
      </article>
    </main>
  )
}
