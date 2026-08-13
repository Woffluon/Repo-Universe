export type GraphicsQuality = 'auto' | 'high' | 'low'

export type RepositoryUniverseData = {
  repository: {
    owner: string
    name: string
    fullName: string
    description: string | null
    url: string
    ownerAvatarUrl: string | null
    stars: number
    forks: number
    openIssues: number
    openPullRequests: number
    createdAt: string
    updatedAt: string
    pushedAt: string | null
    size: number | null
    defaultBranch: string | null
    archived: boolean
    fork: boolean
    parent: { fullName: string; url: string } | null
    license: { name: string; spdxId: string | null } | null
    latestRelease: {
      name: string | null
      tagName: string
      publishedAt: string | null
      url: string
    } | null
    topics: string[]
  }
  languages: Array<{
    name: string
    color: string | null
    bytes: number
    percentage: number
  }>
  contributors: Array<{
    username: string
    avatarUrl: string
    profileUrl: string
    contributions: number
  }>
  activity: {
    score: number
    recentCommitCount?: number
  }
  fetchedAt: string
}

export type Vector3Tuple = [number, number, number]

export type StarModel = {
  id: 'repository'
  label: string
  radius: number
  brightness: number
  activity: number
  color: string
}

export type PlanetModel = {
  id: string
  language: string
  color: string
  percentage: number
  bytes: number
  radius: number
  orbitRadius: number
  orbitInclination: number
  orbitLongitude: number
  startAngle: number
  orbitSpeed: number
  axialTilt: number
  surfaceSeed: number
}

export type ContributorBodyModel = {
  id: string
  username: string
  contributions: number
  intensity: number
  radius: number
  position: Vector3Tuple
}

export type UniverseModel = {
  seed: number
  star: StarModel
  planets: PlanetModel[]
  contributors: ContributorBodyModel[]
  asteroidBelt: {
    count: number
    innerRadius: number
    outerRadius: number
    seed: number
  }
  background: {
    seed: number
  }
  boundsRadius: number
}
