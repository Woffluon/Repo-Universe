'use client'

import Image from 'next/image'
import {
  ArrowSquareOut,
  CalendarBlank,
  Code,
  GitBranch,
  GitFork,
  GitPullRequest,
  MagnifyingGlass,
  Star,
  UsersThree,
  WarningCircle,
} from '@phosphor-icons/react'
import { useMemo, useState } from 'react'
import { formatBytes, formatCompactNumber, formatDate } from '@/lib/universe/format'
import type { RepositoryUniverseData } from '@/lib/universe/types'

export type InspectorTab = 'overview' | 'languages' | 'contributors'

function repositoryAge(createdAt: string, fetchedAt: string): string {
  const years = Math.max(0, (new Date(fetchedAt).getTime() - new Date(createdAt).getTime()) / 31_557_600_000)
  return years < 1 ? '< 1 year' : `${years.toFixed(years >= 10 ? 0 : 1)} years`
}

export function RepositoryInspector({
  data,
  tab,
  onTabChange,
  selectedId,
  onFocus,
  sceneContributorCount,
}: {
  data: RepositoryUniverseData
  tab: InspectorTab
  onTabChange: (tab: InspectorTab) => void
  selectedId: string | null
  onFocus: (id: string) => void
  sceneContributorCount: number
}) {
  const repo = data.repository
  const [showAllContributors, setShowAllContributors] = useState(false)
  const [contributorQuery, setContributorQuery] = useState('')

  const selectedContributor = selectedId?.startsWith('contributor:')
    ? data.contributors.find((entry) => `contributor:${entry.username}` === selectedId)
    : undefined

  const filteredContributors = useMemo(() => {
    const query = contributorQuery.trim().toLowerCase()
    if (!query) return data.contributors
    return data.contributors.filter((contributor) => contributor.username.toLowerCase().includes(query))
  }, [contributorQuery, data.contributors])

  const visibleContributors = showAllContributors ? filteredContributors : filteredContributors.slice(0, 24)
  const hiddenContributorCount = Math.max(0, filteredContributors.length - visibleContributors.length)

  return (
    <div className="inspector-content">
      <div className="inspector-tabs" role="tablist" aria-label="Repository details">
        {(['overview', 'languages', 'contributors'] as const).map((value) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={tab === value}
            className={tab === value ? 'active' : undefined}
            onClick={() => onTabChange(value)}
          >
            {value[0].toUpperCase() + value.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="inspector-panel" role="tabpanel">
          {repo.archived && (
            <div className="archived-note">
              <WarningCircle size={16} /> Archived repository
            </div>
          )}

          <button type="button" className="repository-focus-card" onClick={() => onFocus('repository')}>
            <span>Repository star</span>
            <strong>{repo.fullName}</strong>
            <p>{repo.description || 'GitHub does not provide a repository description.'}</p>
          </button>

          <div className="overview-metrics" aria-label="Repository metrics">
            <div>
              <span><Star size={15} weight="fill" /> Stars</span>
              <strong>{formatCompactNumber(repo.stars)}</strong>
            </div>
            <div>
              <span><GitFork size={15} /> Forks</span>
              <strong>{formatCompactNumber(repo.forks)}</strong>
            </div>
            <div>
              <span>Issues</span>
              <strong>{formatCompactNumber(repo.openIssues)}</strong>
            </div>
            <div>
              <span><GitPullRequest size={15} /> Pull requests</span>
              <strong>{formatCompactNumber(repo.openPullRequests)}</strong>
            </div>
          </div>

          <div className="repository-facts">
            <div className="fact-group">
              <div className="fact-heading"><GitBranch size={15} /> Source</div>
              <dl>
                <div><dt>Default branch</dt><dd>{repo.defaultBranch || 'Not reported'}</dd></div>
                <div><dt>License</dt><dd>{repo.license?.spdxId || repo.license?.name || 'Not reported'}</dd></div>
                <div><dt>Repository size</dt><dd>{repo.size == null ? 'Not reported' : formatBytes(repo.size)}</dd></div>
              </dl>
            </div>
            <div className="fact-group">
              <div className="fact-heading"><CalendarBlank size={15} /> Timeline</div>
              <dl>
                <div><dt>Created</dt><dd>{formatDate(repo.createdAt)}</dd></div>
                <div><dt>Age</dt><dd>{repositoryAge(repo.createdAt, data.fetchedAt)}</dd></div>
                <div><dt>Last push</dt><dd>{formatDate(repo.pushedAt)}</dd></div>
              </dl>
            </div>
          </div>

          {repo.parent && (
            <div className="inspector-inline-note">
              Forked from <a href={repo.parent.url} target="_blank" rel="noreferrer">{repo.parent.fullName}</a>
            </div>
          )}
          {repo.latestRelease && (
            <div className="inspector-inline-note">
              Latest release <a href={repo.latestRelease.url} target="_blank" rel="noreferrer">{repo.latestRelease.tagName}</a>
            </div>
          )}

          {repo.topics.length > 0 && (
            <div className="topic-list" aria-label="Repository topics">
              {repo.topics.map((topic) => <span key={topic}>{topic}</span>)}
            </div>
          )}

          <a className="inspector-link" href={repo.url} target="_blank" rel="noreferrer">
            Open on GitHub <ArrowSquareOut size={16} />
          </a>
        </div>
      )}

      {tab === 'languages' && (
        <div className="inspector-panel" role="tabpanel">
          <div className="panel-intro">
            <Code size={17} />
            <div>
              <strong>Language system</strong>
              <span>Up to 8 dominant languages are loaded and visualized. Smaller languages may not appear.</span>
            </div>
          </div>

          {data.languages.length === 0 ? (
            <p className="empty-detail">GitHub reports no language data for this repository.</p>
          ) : (
            <div className="object-list language-list">
              {data.languages.map((language, index) => {
                const id = `language:${language.name}`
                return (
                  <button
                    type="button"
                    key={language.name}
                    className={selectedId === id ? 'object-row selected' : 'object-row'}
                    onClick={() => onFocus(id)}
                  >
                    <span className="object-index">{String(index + 1).padStart(2, '0')}</span>
                    <span className="language-dot" style={{ backgroundColor: language.color || '#8ecae6' }} />
                    <span className="object-copy">
                      <strong>{language.name}</strong>
                      <small>{formatBytes(language.bytes)}</small>
                    </span>
                    <strong className="object-value">{language.percentage.toFixed(1)}%</strong>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}

      {tab === 'contributors' && (
        <div className="inspector-panel" role="tabpanel">
          <div className="panel-intro contributors-intro">
            <UsersThree size={17} />
            <div>
              <strong>Contributor signals</strong>
              <span>
                Partial dataset: up to 100 non-anonymous contributors are loaded from GitHub, and only the first {sceneContributorCount} are rendered as 3D signals. Large repositories may have additional contributors that are not shown here.
              </span>
            </div>
          </div>

          {selectedContributor && (
            <div className="selected-contributor-card">
              <Image src={selectedContributor.avatarUrl} alt="" width={42} height={42} className="contributor-avatar" unoptimized />
              <div>
                <strong>{selectedContributor.username}</strong>
                <span>{formatCompactNumber(selectedContributor.contributions)} contributions</span>
              </div>
              <a href={selectedContributor.profileUrl} target="_blank" rel="noreferrer" aria-label={`Open ${selectedContributor.username} on GitHub`}>
                <ArrowSquareOut size={16} />
              </a>
            </div>
          )}

          {data.contributors.length === 0 ? (
            <p className="empty-detail">No contributor signals are available for this repository.</p>
          ) : (
            <>
              <label className="contributor-search">
                <MagnifyingGlass size={15} />
                <span className="sr-only">Filter contributors</span>
                <input
                  value={contributorQuery}
                  onChange={(event) => setContributorQuery(event.target.value)}
                  placeholder="Filter loaded contributors"
                />
              </label>

              <div className="object-list contributor-list">
                {visibleContributors.map((contributor) => {
                  const id = `contributor:${contributor.username}`
                  const renderedInScene = data.contributors.indexOf(contributor) < sceneContributorCount
                  return (
                    <button
                      type="button"
                      key={contributor.username}
                      className={selectedId === id ? 'object-row selected' : 'object-row'}
                      onClick={() => onFocus(id)}
                      title={renderedInScene ? 'Focus contributor signal' : 'Loaded in inspector, not rendered as a scene signal'}
                    >
                      <span className="object-index">{String(data.contributors.indexOf(contributor) + 1).padStart(2, '0')}</span>
                      <Image src={contributor.avatarUrl} alt="" width={32} height={32} className="contributor-avatar" unoptimized />
                      <span className="object-copy">
                        <strong>{contributor.username}</strong>
                        <small>{formatCompactNumber(contributor.contributions)} contributions</small>
                      </span>
                      <span className={renderedInScene ? 'scene-presence active' : 'scene-presence'}>
                        {renderedInScene ? 'Signal' : 'Data'}
                      </span>
                    </button>
                  )
                })}
              </div>

              {hiddenContributorCount > 0 && (
                <button type="button" className="show-more-button" onClick={() => setShowAllContributors(true)}>
                  Show {hiddenContributorCount} more
                </button>
              )}
              {showAllContributors && filteredContributors.length > 24 && (
                <button type="button" className="show-more-button" onClick={() => setShowAllContributors(false)}>
                  Show top 24
                </button>
              )}
            </>
          )}
        </div>
      )}

      <details className="data-coverage">
        <summary>Data coverage</summary>
        <p>
          Repo Universe intentionally uses a bounded GitHub dataset instead of mirroring every record. It loads up to 8 dominant languages, up to 20 topics, and up to 100 non-anonymous contributors. The 3D scene renders at most 18 contributor signals, so large repositories can contain additional languages, topics, or contributors that are not shown in the visualization.
        </p>
      </details>
    </div>
  )
}
