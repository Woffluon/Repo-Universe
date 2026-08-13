import { describe, expect, it } from 'vitest'
import { createUniverseModel } from '../lib/universe/model'
import { createSeededRandom, hashString } from '../lib/universe/seed'
import { asteroidCountFromForks, logScale, sqrtScale } from '../lib/universe/scaling'
import type { RepositoryUniverseData } from '../lib/universe/types'

const fixture: RepositoryUniverseData = {
  repository: {
    owner: 'acme', name: 'nebula', fullName: 'acme/nebula', description: 'Test', url: 'https://github.com/acme/nebula', ownerAvatarUrl: null,
    stars: 12000, forks: 2400, openIssues: 40, openPullRequests: 12,
    createdAt: '2020-01-01T00:00:00Z', updatedAt: '2026-08-01T00:00:00Z', pushedAt: '2026-08-01T00:00:00Z', size: 42_000_000,
    defaultBranch: 'main', archived: false, fork: false, parent: null, license: { name: 'MIT License', spdxId: 'MIT' }, latestRelease: null, topics: ['threejs'],
  },
  languages: [
    { name: 'TypeScript', color: '#3178c6', bytes: 800, percentage: 80 },
    { name: 'Rust', color: '#dea584', bytes: 200, percentage: 20 },
  ],
  contributors: [
    { username: 'octo', avatarUrl: 'https://github.com/octo.png', profileUrl: 'https://github.com/octo', contributions: 300 },
  ],
  activity: { score: 0.7 },
  fetchedAt: '2026-08-12T00:00:00Z',
}

describe('deterministic universe utilities', () => {
  it('hashes and PRNGs deterministically', () => {
    expect(hashString('acme/nebula')).toBe(hashString('acme/nebula'))
    const a = createSeededRandom(123)
    const b = createSeededRandom(123)
    expect([a(), a(), a()]).toEqual([b(), b(), b()])
  })

  it('creates exactly the same structural model for the same repository data', () => {
    expect(createUniverseModel(fixture)).toEqual(createUniverseModel(structuredClone(fixture)))
  })

  it('uses bounded nonlinear scaling', () => {
    expect(logScale(100, 1_000_000, 1, 10)).toBeGreaterThan(1)
    expect(sqrtScale(25, 100, 1, 3)).toBe(2)
    expect(asteroidCountFromForks(10_000_000)).toBeLessThanOrEqual(120)
  })
})
