import 'server-only'

import { cacheLife } from 'next/cache'
import { GithubDataError } from './errors'
import type { GithubRepositoryGraphql } from './types'

const REPOSITORY_QUERY = `
  query RepositoryUniverse($owner: String!, $repo: String!) {
    repository(owner: $owner, name: $repo) {
      name
      nameWithOwner
      description
      url
      stargazerCount
      forkCount
      createdAt
      updatedAt
      pushedAt
      diskUsage
      isArchived
      isFork
      owner {
        login
        avatarUrl
      }
      issues(states: OPEN) { totalCount }
      pullRequests(states: OPEN) { totalCount }
      defaultBranchRef { name }
      licenseInfo { name spdxId }
      repositoryTopics(first: 20) {
        nodes { topic { name } }
      }
      latestRelease {
        name
        tagName
        publishedAt
        url
      }
      languages(first: 8, orderBy: { field: SIZE, direction: DESC }) {
        totalSize
        edges {
          size
          node { name color }
        }
      }
      parent { nameWithOwner url }
    }
  }
`

function token(): string {
  const value = process.env.GITHUB_TOKEN?.trim()
  if (!value) {
    throw new GithubDataError(
      'configuration',
      'Repo Universe needs a server-side GITHUB_TOKEN to query the GitHub GraphQL API.',
    )
  }
  return value
}

export async function fetchRepositoryCore(owner: string, repo: string): Promise<GithubRepositoryGraphql> {
  'use cache'
  cacheLife('githubCore')

  const response = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token()}`,
      'Content-Type': 'application/json',
      'User-Agent': 'repo-universe',
    },
    body: JSON.stringify({ query: REPOSITORY_QUERY, variables: { owner, repo } }),
  })

  if (response.status === 401 || response.status === 403) {
    const remaining = response.headers.get('x-ratelimit-remaining')
    if (remaining === '0') {
      throw new GithubDataError('rate-limit', 'GitHub API rate limit reached. Try again later.', response.status)
    }
    throw new GithubDataError('unavailable', 'GitHub rejected the repository request.', response.status)
  }

  if (!response.ok) {
    throw new GithubDataError('unavailable', 'GitHub is temporarily unavailable.', response.status)
  }

  const payload: unknown = await response.json()
  if (!payload || typeof payload !== 'object') {
    throw new GithubDataError('invalid-response', 'GitHub returned an invalid response.')
  }

  const typed = payload as { data?: GithubRepositoryGraphql; errors?: Array<{ message?: string; type?: string }> }
  if (typed.errors?.length) {
    const normalizedErrors = typed.errors.map((error) =>
      `${error.type ?? ''} ${error.message ?? ''}`.toLowerCase(),
    )
    const notFound = normalizedErrors.some(
      (value) => value.includes('not_found') || value.includes('not found') || value.includes('could not resolve'),
    )
    const rateLimited = normalizedErrors.some(
      (value) => value.includes('rate_limit') || value.includes('rate limit') || value.includes('rate-limited'),
    )
    throw new GithubDataError(
      notFound ? 'not-found' : rateLimited ? 'rate-limit' : 'unavailable',
      notFound
        ? 'Repository not found or inaccessible.'
        : rateLimited
          ? 'GitHub API rate limit reached. Try again later.'
          : 'GitHub could not return repository data.',
    )
  }

  if (!typed.data?.repository) {
    throw new GithubDataError('not-found', 'Repository not found or inaccessible.', 404)
  }

  return typed.data
}
