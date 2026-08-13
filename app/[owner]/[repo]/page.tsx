import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ArrowLeft, WarningCircle } from '@phosphor-icons/react/dist/ssr'
import Link from 'next/link'
import { UniverseExperience } from '@/components/universe/universe-experience'
import { getRepositoryUniverseData } from '@/lib/github/client'
import type { RepositoryUniverseData } from '@/lib/universe/types'
import { GithubDataError } from '@/lib/github/errors'
import { parseRepositoryInput } from '@/lib/repository-input'
import { canonicalRepositoryPath, getSiteUrl } from '@/lib/site'

export type RepositoryPageProps = {
  params: Promise<{ owner: string; repo: string }>
}

export async function generateMetadata({ params }: RepositoryPageProps): Promise<Metadata> {
  const { owner, repo } = await params
  const parsed = parseRepositoryInput(`${owner}/${repo}`)
  if (!parsed.ok) return { title: 'Repository unavailable' }

  try {
    const data = await getRepositoryUniverseData(parsed.value.owner, parsed.value.repo)
    const title = `${data.repository.fullName} - Repo Universe`
    const description = data.repository.description
      ? `Explore ${data.repository.fullName} as a deterministic 3D repository universe. ${data.repository.description}`
      : `Explore ${data.repository.fullName} as a deterministic 3D repository universe.`
    const canonical = new URL(canonicalRepositoryPath(data.repository.owner, data.repository.name), getSiteUrl())
    return {
      title: data.repository.fullName,
      description,
      alternates: { canonical },
      openGraph: { title, description, url: canonical, type: 'website' },
      twitter: { card: 'summary_large_image', title, description },
    }
  } catch {
    return { title: `${owner}/${repo}` }
  }
}

function Failure({ kind }: { kind: GithubDataError['kind'] }) {
  const copy =
    kind === 'configuration'
      ? 'The server is missing its GitHub API configuration.'
      : kind === 'rate-limit'
        ? 'GitHub API capacity is temporarily exhausted. Cached universes remain available when present.'
        : 'GitHub could not return this repository right now.'

  return (
    <main className="status-page">
      <WarningCircle size={32} aria-hidden="true" />
      <p className="eyebrow">UNIVERSE UNAVAILABLE</p>
      <h1>Mapping interrupted.</h1>
      <p>{copy}</p>
      <Link href="/" className="button-secondary"><ArrowLeft size={18} aria-hidden="true" /> Try another repository</Link>
    </main>
  )
}

export default async function RepositoryPage({ params }: RepositoryPageProps) {
  const { owner, repo } = await params
  const parsed = parseRepositoryInput(`${owner}/${repo}`)
  if (!parsed.ok) notFound()

  let data: RepositoryUniverseData
  try {
    data = await getRepositoryUniverseData(parsed.value.owner, parsed.value.repo)
  } catch (error) {
    if (error instanceof GithubDataError) {
      if (error.kind === 'not-found') notFound()
      return <Failure kind={error.kind} />
    }
    return <Failure kind="unavailable" />
  }

  return <UniverseExperience data={data} />
}
