import { describe, expect, it } from 'vitest'
import { normalizeRepositoryData } from '../lib/github/normalize'
import type { GithubRepositoryGraphql } from '../lib/github/types'

const response: GithubRepositoryGraphql = {
  repository: {
    name: 'react', nameWithOwner: 'facebook/react', description: 'UI library', url: 'https://github.com/facebook/react', stargazerCount: 100, forkCount: 20,
    createdAt: '2013-05-24T00:00:00Z', updatedAt: '2026-08-01T00:00:00Z', pushedAt: '2026-08-01T00:00:00Z', diskUsage: 1000,
    isArchived: false, isFork: false, owner: { login: 'facebook', avatarUrl: 'https://github.com/facebook.png' }, issues: { totalCount: 5 }, pullRequests: { totalCount: 3 },
    defaultBranchRef: { name: 'main' }, licenseInfo: { name: 'MIT License', spdxId: 'MIT' }, repositoryTopics: { nodes: [{ topic: { name: 'react' } }] }, latestRelease: null,
    languages: { totalSize: 1000, edges: [{ size: 750, node: { name: 'JavaScript', color: '#f1e05a' } }, { size: 250, node: { name: 'TypeScript', color: '#3178c6' } }] }, parent: null,
  },
}

describe('normalizeRepositoryData', () => {
  it('normalizes bytes, percentages and contributor records', () => {
    const normalized = normalizeRepositoryData(response, [{ login: 'octocat', avatar_url: 'https://github.com/o.png', html_url: 'https://github.com/octocat', contributions: 50 }], '2026-08-12T00:00:00Z')
    expect(normalized.repository.size).toBe(1_024_000)
    expect(normalized.languages[0].percentage).toBe(75)
    expect(normalized.contributors[0].username).toBe('octocat')
    expect(normalized.activity.score).toBeGreaterThan(0)
  })
})
