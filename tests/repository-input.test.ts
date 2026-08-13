import { describe, expect, it } from 'vitest'
import { parseRepositoryInput } from '../lib/repository-input'

describe('parseRepositoryInput', () => {
  it.each([
    ['facebook/react', { owner: 'facebook', repo: 'react' }],
    [' https://github.com/facebook/react ', { owner: 'facebook', repo: 'react' }],
    ['https://github.com/facebook/react/', { owner: 'facebook', repo: 'react' }],
    ['https://github.com/facebook/react.git', { owner: 'facebook', repo: 'react' }],
  ])('parses %s', (input, expected) => {
    expect(parseRepositoryInput(input)).toEqual({ ok: true, value: expected })
  })

  it.each([
    'https://example.com/facebook/react',
    'https://github.com/facebook/react/issues',
    'facebook',
    '/facebook/react/extra',
    'https://github.com/facebook/react?tab=readme',
  ])('rejects unsafe or malformed input %s', (input) => {
    expect(parseRepositoryInput(input).ok).toBe(false)
  })
})
