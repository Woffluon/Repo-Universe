import Link from 'next/link'
import { ArrowLeft } from '@phosphor-icons/react/dist/ssr'
import { Brand } from '@/components/ui/logo'

export default function NotFound() {
  return (
    <main className="status-page">
      <Brand />
      <p className="eyebrow">404 / LOST IN SPACE</p>
      <h1>This universe could not be found.</h1>
      <p>The route does not point to a known Repo Universe page or accessible repository.</p>
      <Link href="/" className="button-secondary"><ArrowLeft size={18} aria-hidden="true" /> Return home</Link>
    </main>
  )
}
