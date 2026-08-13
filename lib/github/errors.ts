export type GithubErrorKind =
  | 'configuration'
  | 'not-found'
  | 'rate-limit'
  | 'unavailable'
  | 'invalid-response'

export class GithubDataError extends Error {
  readonly kind: GithubErrorKind
  readonly status: number | null

  constructor(kind: GithubErrorKind, message: string, status: number | null = null) {
    super(message)
    this.name = 'GithubDataError'
    this.kind = kind
    this.status = status
  }
}
