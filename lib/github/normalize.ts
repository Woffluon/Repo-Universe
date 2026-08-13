import type { RepositoryUniverseData } from '@/lib/universe/types'
import type { GithubRepositoryGraphql, GithubRestContributor } from './types'

function activityScore(pushedAt: string | null, updatedAt: string, fetchedAt: string): number {
  const reference = new Date(fetchedAt).getTime()
  const relevant = new Date(pushedAt || updatedAt).getTime()
  const days = Math.max(0, (reference - relevant) / 86_400_000)
  // Smooth exponential decay: ~0.72 at 30d, ~0.27 at 120d, nearly dormant after a year.
  return Math.max(0, Math.min(1, Math.exp(-days / 90)))
}

export function normalizeRepositoryData(
  graphql: GithubRepositoryGraphql,
  contributorResponse: GithubRestContributor[],
  fetchedAt = new Date().toISOString(),
): RepositoryUniverseData {
  const repository = graphql.repository
  if (!repository) throw new Error('Cannot normalize a missing repository.')

  const languageTotal = repository.languages.totalSize || repository.languages.edges.reduce((sum, edge) => sum + edge.size, 0)
  const languages = repository.languages.edges.map((edge) => ({
    name: edge.node.name,
    color: edge.node.color,
    bytes: edge.size,
    percentage: languageTotal > 0 ? (edge.size / languageTotal) * 100 : 0,
  }))

  const contributors = contributorResponse
    .filter((entry): entry is GithubRestContributor & { login: string } => Boolean(entry.login))
    .map((entry) => ({
      username: entry.login,
      avatarUrl: entry.avatar_url || `https://github.com/${encodeURIComponent(entry.login)}.png`,
      profileUrl: entry.html_url || `https://github.com/${encodeURIComponent(entry.login)}`,
      contributions: Math.max(0, entry.contributions || 0),
    }))

  return {
    repository: {
      owner: repository.owner.login,
      name: repository.name,
      fullName: repository.nameWithOwner,
      description: repository.description,
      url: repository.url,
      ownerAvatarUrl: repository.owner.avatarUrl || null,
      stars: repository.stargazerCount,
      forks: repository.forkCount,
      openIssues: repository.issues.totalCount,
      openPullRequests: repository.pullRequests.totalCount,
      createdAt: repository.createdAt,
      updatedAt: repository.updatedAt,
      pushedAt: repository.pushedAt,
      size: repository.diskUsage == null ? null : repository.diskUsage * 1024,
      defaultBranch: repository.defaultBranchRef?.name || null,
      archived: repository.isArchived,
      fork: repository.isFork,
      parent: repository.parent ? { fullName: repository.parent.nameWithOwner, url: repository.parent.url } : null,
      license: repository.licenseInfo
        ? { name: repository.licenseInfo.name, spdxId: repository.licenseInfo.spdxId }
        : null,
      latestRelease: repository.latestRelease
        ? {
            name: repository.latestRelease.name,
            tagName: repository.latestRelease.tagName,
            publishedAt: repository.latestRelease.publishedAt,
            url: repository.latestRelease.url,
          }
        : null,
      topics: repository.repositoryTopics.nodes.map((node) => node.topic.name),
    },
    languages,
    contributors,
    activity: {
      score: repository.isArchived ? 0.08 : activityScore(repository.pushedAt, repository.updatedAt, fetchedAt),
    },
    fetchedAt,
  }
}
