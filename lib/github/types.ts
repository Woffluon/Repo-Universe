export type GithubGraphqlLanguageEdge = {
  size: number
  node: { name: string; color: string | null }
}

export type GithubRepositoryGraphql = {
  repository: {
    name: string
    nameWithOwner: string
    description: string | null
    url: string
    stargazerCount: number
    forkCount: number
    createdAt: string
    updatedAt: string
    pushedAt: string | null
    diskUsage: number | null
    isArchived: boolean
    isFork: boolean
    owner: { login: string; avatarUrl: string }
    issues: { totalCount: number }
    pullRequests: { totalCount: number }
    defaultBranchRef: { name: string } | null
    licenseInfo: { name: string; spdxId: string | null } | null
    repositoryTopics: { nodes: Array<{ topic: { name: string } }> }
    latestRelease: {
      name: string | null
      tagName: string
      publishedAt: string | null
      url: string
    } | null
    languages: {
      totalSize: number
      edges: GithubGraphqlLanguageEdge[]
    }
    parent: { nameWithOwner: string; url: string } | null
  } | null
}

export type GithubRestContributor = {
  login?: string | null
  avatar_url?: string | null
  html_url?: string | null
  contributions?: number
}
