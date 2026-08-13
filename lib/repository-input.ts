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

export function parseRepositoryInput(rawInput: string, locale: Locale = 'en'): RepositoryParseResult {
  const input = rawInput.trim()
  if (!input) {
    return { ok: false, reason: t(locale, 'input.empty') }
  }

  let path = input

  if (/^https?:\/\//i.test(input)) {
    let url: URL
    try {
      url = new URL(input)
    } catch {
      return { ok: false, reason: t(locale, 'input.invalidUrl') }
    }

    if (url.protocol !== 'https:' && url.protocol !== 'http:') {
      return { ok: false, reason: t(locale, 'input.webUrlsOnly') }
    }

    if (url.hostname.toLowerCase() !== 'github.com') {
      return { ok: false, reason: t(locale, 'input.githubOnly') }
    }

    if (url.username || url.password || url.port || url.search || url.hash) {
      return { ok: false, reason: t(locale, 'input.directUrl') }
    }

    path = url.pathname
  } else if (input.includes('://')) {
    return { ok: false, reason: t(locale, 'input.webUrlsOnly') }
  }

  const clean = path.replace(/^\/+|\/+$/g, '').replace(/\.git$/i, '')
  const segments = clean.split('/')

  if (segments.length !== 2) {
    return {
      ok: false,
      reason: t(locale, 'input.ownerRepo'),
    }
  }

  const [owner, repo] = segments
  if (!validSegment(owner) || !validSegment(repo)) {
    return { ok: false, reason: t(locale, 'input.characters') }
  }

  if (owner === '.' || owner === '..' || repo === '.' || repo === '..') {
    return { ok: false, reason: t(locale, 'input.validOwnerRepo') }
  }

  return { ok: true, value: { owner, repo } }
}
import { type Locale, t } from './i18n'
