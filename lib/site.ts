export const SITE_NAME = 'Repo Universe'
export const SITE_TAGLINE = 'Every repository has a universe.'
export const SITE_DESCRIPTION =
  'Turn any public GitHub repository into an explorable 3D solar system generated from real repository data.'

export function getSiteUrl(): URL {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (configured) {
    try {
      return new URL(configured)
    } catch {
      // Invalid deployment configuration falls back safely instead of breaking metadata rendering.
    }
  }
  return new URL('http://localhost:3000')
}

export function canonicalRepositoryPath(owner: string, repo: string): string {
  return `/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`
}
