export type ParsedRepository = {
  owner: string
  repo: string
}

export type RepositoryParseResult =
  | { ok: true; value: ParsedRepository }
  | { ok: false; reason: string }

const SEGMENT_PATTERN = /^[A-Za-z0-9_.-]+$/

function validSegment(value: string): boolean {
  return value.length > 0 && value.length <= 100 && SEGMENT_PATTERN.test(value)
}

export function parseRepositoryInput(rawInput: string): RepositoryParseResult {
  const input = rawInput.trim()
  if (!input) {
    return { ok: false, reason: 'Enter a repository.' }
  }

  let path = input

  if (/^https?:\/\//i.test(input)) {
    let url: URL
    try {
      url = new URL(input)
    } catch {
      return { ok: false, reason: 'Enter a valid GitHub URL.' }
    }

    if (url.protocol !== 'https:' && url.protocol !== 'http:') {
      return { ok: false, reason: 'Only GitHub web URLs are supported.' }
    }

    if (url.hostname.toLowerCase() !== 'github.com') {
      return { ok: false, reason: 'Only github.com repository URLs are supported.' }
    }

    if (url.username || url.password || url.port || url.search || url.hash) {
      return { ok: false, reason: 'Enter a direct GitHub repository URL.' }
    }

    path = url.pathname
  } else if (input.includes('://')) {
    return { ok: false, reason: 'Only GitHub web URLs are supported.' }
  }

  const clean = path.replace(/^\/+|\/+$/g, '').replace(/\.git$/i, '')
  const segments = clean.split('/')

  if (segments.length !== 2) {
    return {
      ok: false,
      reason: 'Enter a GitHub repository as owner/repository or paste its GitHub URL.',
    }
  }

  const [owner, repo] = segments
  if (!validSegment(owner) || !validSegment(repo)) {
    return { ok: false, reason: 'The repository owner or name contains unsupported characters.' }
  }

  if (owner === '.' || owner === '..' || repo === '.' || repo === '..') {
    return { ok: false, reason: 'Enter a valid repository owner and name.' }
  }

  return { ok: true, value: { owner, repo } }
}
