const assert = require('node:assert/strict')
const { parseRepositoryInput } = require('../.domain-dist/lib/repository-input.js')
const { createSeededRandom } = require('../.domain-dist/lib/universe/seed.js')
const { createUniverseModel } = require('../.domain-dist/lib/universe/model.js')

assert.deepEqual(parseRepositoryInput('https://github.com/facebook/react.git'), {
  ok: true,
  value: { owner: 'facebook', repo: 'react' },
})
assert.equal(parseRepositoryInput('https://example.com/facebook/react').ok, false)

const a = createSeededRandom(42)
const b = createSeededRandom(42)
assert.deepEqual([a(), a(), a()], [b(), b(), b()])

const data = {
  repository: {
    owner: 'acme', name: 'orbit', fullName: 'acme/orbit', description: null, url: 'https://github.com/acme/orbit', ownerAvatarUrl: null,
    stars: 1000, forks: 500, openIssues: 2, openPullRequests: 1, createdAt: '2020-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z', pushedAt: '2026-01-01T00:00:00Z', size: 200000,
    defaultBranch: 'main', archived: false, fork: false, parent: null, license: null, latestRelease: null, topics: [],
  },
  languages: [{ name: 'TypeScript', color: '#3178c6', bytes: 1000, percentage: 100 }],
  contributors: [], activity: { score: .5 }, fetchedAt: '2026-08-12T00:00:00Z',
}
assert.deepEqual(createUniverseModel(data), createUniverseModel(structuredClone(data)))
console.log('Domain smoke checks passed.')
