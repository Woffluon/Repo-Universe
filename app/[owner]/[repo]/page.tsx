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
import { t } from '@/lib/i18n'
import { getLocale } from '@/lib/locale'

export const instant = false

export type RepositoryPageProps = {
  params: Promise<{ owner: string; repo: string }>
}

export async function generateMetadata({ params }: RepositoryPageProps): Promise<Metadata> {
  const locale = await getLocale()
  const { owner, repo } = await params
  const parsed = parseRepositoryInput(`${owner}/${repo}`)
  if (!parsed.ok) return { title: t(locale, 'failure.eyebrow') }

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

async function Failure({ kind }: { kind: GithubDataError['kind'] }) {
  const locale = await getLocale()
  const copy =
    kind === 'configuration'
      ? t(locale, 'failure.configuration')
      : kind === 'rate-limit'
        ? t(locale, 'failure.rateLimit')
        : t(locale, 'failure.unavailable')

  return (
    <main className="status-page">
      <WarningCircle size={32} aria-hidden="true" />
      <p className="eyebrow">{t(locale, 'failure.eyebrow')}</p>
      <h1>{t(locale, 'failure.title')}</h1>
      <p>{copy}</p>
      <Link href="/" className="button-secondary"><ArrowLeft size={18} aria-hidden="true" /> {t(locale, 'failure.back')}</Link>
    </main>
  )
}

export default async function RepositoryPage({ params }: RepositoryPageProps) {
  const locale = await getLocale()
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

  return <UniverseExperience data={data} locale={locale} />
}
