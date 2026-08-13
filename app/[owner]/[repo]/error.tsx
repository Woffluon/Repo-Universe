'use client'

import { ArrowCounterClockwise, House } from '@phosphor-icons/react'
import Link from 'next/link'

export default function RepositoryError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="status-page">
      <p className="eyebrow">RENDERING FAULT</p>
      <h1>The universe could not be initialized.</h1>
      <p>A recoverable application error interrupted this route. No credentials are exposed in this message.</p>
      <div className="status-actions">
        <button type="button" className="button-primary" onClick={reset}><ArrowCounterClockwise size={18} /> Retry</button>
        <Link href="/" className="button-secondary"><House size={18} /> Home</Link>
      </div>
    </main>
  )
}
