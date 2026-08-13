import 'server-only'

import { fetchContributors } from './contributors'
import { fetchRepositoryCore } from './graphql'
import { normalizeRepositoryData } from './normalize'
import type { RepositoryUniverseData } from '@/lib/universe/types'

export async function getRepositoryUniverseData(owner: string, repo: string): Promise<RepositoryUniverseData> {
  const normalizedOwner = owner.trim().toLowerCase()
  const normalizedRepo = repo.trim().toLowerCase()
  const [core, contributors] = await Promise.all([
    fetchRepositoryCore(normalizedOwner, normalizedRepo),
    fetchContributors(normalizedOwner, normalizedRepo),
  ])
  return normalizeRepositoryData(core, contributors)
}
