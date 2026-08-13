'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, MagnifyingGlass } from '@phosphor-icons/react'
import { parseRepositoryInput } from '@/lib/repository-input'

export function RepositorySearch({ compact = false, autoFocus = false }: { compact?: boolean; autoFocus?: boolean }) {
  const router = useRouter()
  const [input, setInput] = useState('')
  const [error, setError] = useState<string | null>(null)

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const parsed = parseRepositoryInput(input)
    if (!parsed.ok) {
      setError(parsed.reason)
      return
    }
    setError(null)
    router.push(`/${encodeURIComponent(parsed.value.owner)}/${encodeURIComponent(parsed.value.repo)}`)
  }

  return (
    <form className={compact ? 'repo-search repo-search-compact' : 'repo-search'} onSubmit={submit} noValidate>
      <div className="repo-search-control">
        <MagnifyingGlass size={compact ? 18 : 22} aria-hidden="true" />
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="owner/repository or GitHub URL"
          aria-label="GitHub repository"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? 'repository-search-error' : undefined}
          autoFocus={autoFocus}
          spellCheck={false}
          autoCapitalize="none"
          autoCorrect="off"
        />
        <button type="submit" className="repo-search-submit">
          <span>{compact ? 'Go' : 'Explore Universe'}</span>
          <ArrowRight size={18} aria-hidden="true" />
        </button>
      </div>
      {error && (
        <p id="repository-search-error" className="field-error" role="alert">
          {error}
        </p>
      )}
    </form>
  )
}
