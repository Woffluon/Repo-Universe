import { Brand } from '@/components/ui/logo'

export default function RepositoryLoading() {
  return (
    <main className="universe-loading-page">
      <div className="loading-stars" aria-hidden="true" />
      <Brand />
      <div className="loading-orbit" aria-hidden="true"><span /></div>
      <p className="eyebrow">MAPPING REPOSITORY SYSTEM</p>
      <h1>Constructing universe…</h1>
      <p>Resolving repository data, orbital structure, and visual scale.</p>
    </main>
  )
}
