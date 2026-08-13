import 'server-only'

import { cacheLife } from 'next/cache'
import { GithubDataError } from './errors'
import type { GithubRestContributor } from './types'

const GITHUB_API_VERSION = '2026-03-10'

export async function fetchContributors(owner: string, repo: string): Promise<GithubRestContributor[]> {
  'use cache'
  cacheLife('githubContributors')

  const token = process.env.GITHUB_TOKEN?.trim()
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': GITHUB_API_VERSION,
    'User-Agent': 'repo-universe',
  }
  if (token) headers.Authorization = `Bearer ${token}`

  const response = await fetch(
    `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contributors?per_page=100&anon=0`,
    { headers },
  )

  if (response.status === 204) return []
  if (response.status === 404) return []
  if (response.status === 403 && response.headers.get('x-ratelimit-remaining') === '0') {
    throw new GithubDataError('rate-limit', 'GitHub contributor rate limit reached.', 403)
  }
  if (!response.ok) return []

  const payload: unknown = await response.json()
  return Array.isArray(payload) ? (payload as GithubRestContributor[]) : []
}
