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
import { type Locale, t } from '@/lib/i18n'
import { formatBytes, formatCompactNumber, formatDate } from '@/lib/universe/format'
import type { RepositoryUniverseData } from '@/lib/universe/types'

export type InspectorTab = 'overview' | 'languages' | 'contributors'

function repositoryAge(createdAt: string, fetchedAt: string, locale: Locale): string {
  const years = Math.max(0, (new Date(fetchedAt).getTime() - new Date(createdAt).getTime()) / 31_557_600_000)
  return years < 1 ? t(locale, 'format.lessThanYear') : t(locale, 'format.years', { count: new Intl.NumberFormat(locale === 'tr' ? 'tr-TR' : 'en-US', { maximumFractionDigits: years >= 10 ? 0 : 1 }).format(years) })
}

export function RepositoryInspector({
  data,
  locale,
  tab,
  onTabChange,
  selectedId,
  onFocus,
  sceneContributorCount,
}: {
  data: RepositoryUniverseData
  locale: Locale
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
      <div className="inspector-tabs" role="tablist" aria-label={t(locale, 'inspector.details')}>
        {(['overview', 'languages', 'contributors'] as const).map((value) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={tab === value}
            className={tab === value ? 'active' : undefined}
            onClick={() => onTabChange(value)}
          >
            {t(locale, `inspector.${value}` as 'inspector.overview' | 'inspector.languages' | 'inspector.contributors')}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="inspector-panel" role="tabpanel">
          {repo.archived && (
            <div className="archived-note">
              <WarningCircle size={16} /> {t(locale, 'inspector.archived')}
            </div>
          )}

          <button type="button" className="repository-focus-card" onClick={() => onFocus('repository')}>
            <span>{t(locale, 'universe.repositoryStar')}</span>
            <strong>{repo.fullName}</strong>
            <p>{repo.description || t(locale, 'universe.noDescription')}</p>
          </button>

          <div className="overview-metrics" aria-label={t(locale, 'inspector.metrics')}>
            <div>
              <span><Star size={15} weight="fill" /> {t(locale, 'universe.stars')}</span>
              <strong>{formatCompactNumber(repo.stars, locale)}</strong>
            </div>
            <div>
              <span><GitFork size={15} /> {t(locale, 'universe.forks')}</span>
              <strong>{formatCompactNumber(repo.forks, locale)}</strong>
            </div>
            <div>
              <span>{t(locale, 'inspector.issues')}</span>
              <strong>{formatCompactNumber(repo.openIssues, locale)}</strong>
            </div>
            <div>
              <span><GitPullRequest size={15} /> {t(locale, 'inspector.pullRequests')}</span>
              <strong>{formatCompactNumber(repo.openPullRequests, locale)}</strong>
            </div>
          </div>

          <div className="repository-facts">
            <div className="fact-group">
              <div className="fact-heading"><GitBranch size={15} /> {t(locale, 'inspector.source')}</div>
              <dl>
                <div><dt>{t(locale, 'inspector.defaultBranch')}</dt><dd>{repo.defaultBranch || t(locale, 'inspector.notReported')}</dd></div>
                <div><dt>{t(locale, 'inspector.license')}</dt><dd>{repo.license?.spdxId || repo.license?.name || t(locale, 'inspector.notReported')}</dd></div>
                <div><dt>{t(locale, 'inspector.repositorySize')}</dt><dd>{repo.size == null ? t(locale, 'inspector.notReported') : formatBytes(repo.size)}</dd></div>
              </dl>
            </div>
            <div className="fact-group">
              <div className="fact-heading"><CalendarBlank size={15} /> {t(locale, 'inspector.timeline')}</div>
              <dl>
                <div><dt>{t(locale, 'inspector.created')}</dt><dd>{formatDate(repo.createdAt, locale)}</dd></div>
                <div><dt>{t(locale, 'inspector.age')}</dt><dd>{repositoryAge(repo.createdAt, data.fetchedAt, locale)}</dd></div>
                <div><dt>{t(locale, 'inspector.lastPush')}</dt><dd>{formatDate(repo.pushedAt, locale)}</dd></div>
              </dl>
            </div>
          </div>

          {repo.parent && (
            <div className="inspector-inline-note">
              {t(locale, 'inspector.forkedFrom')} <a href={repo.parent.url} target="_blank" rel="noreferrer">{repo.parent.fullName}</a>
            </div>
          )}
          {repo.latestRelease && (
            <div className="inspector-inline-note">
              {t(locale, 'inspector.latestRelease')} <a href={repo.latestRelease.url} target="_blank" rel="noreferrer">{repo.latestRelease.tagName}</a>
            </div>
          )}

          {repo.topics.length > 0 && (
            <div className="topic-list" aria-label={t(locale, 'inspector.topics')}>
              {repo.topics.map((topic) => <span key={topic}>{topic}</span>)}
            </div>
          )}

          <a className="inspector-link" href={repo.url} target="_blank" rel="noreferrer">
            {t(locale, 'universe.openGithub')} <ArrowSquareOut size={16} />
          </a>
        </div>
      )}

      {tab === 'languages' && (
        <div className="inspector-panel" role="tabpanel">
          <div className="panel-intro">
            <Code size={17} />
            <div>
              <strong>{t(locale, 'inspector.languageSystem')}</strong>
              <span>{t(locale, 'inspector.languageSystemText')}</span>
            </div>
          </div>

          {data.languages.length === 0 ? (
            <p className="empty-detail">{t(locale, 'inspector.noLanguages')}</p>
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
              <strong>{t(locale, 'inspector.contributorSignals')}</strong>
              <span>{t(locale, 'inspector.contributorSignalsText', { count: sceneContributorCount })}</span>
            </div>
          </div>

          {selectedContributor && (
            <div className="selected-contributor-card">
              <Image src={selectedContributor.avatarUrl} alt="" width={42} height={42} className="contributor-avatar" unoptimized />
              <div>
                <strong>{selectedContributor.username}</strong>
                <span>{t(locale, 'inspector.contributions', { count: formatCompactNumber(selectedContributor.contributions, locale) })}</span>
              </div>
              <a href={selectedContributor.profileUrl} target="_blank" rel="noreferrer" aria-label={t(locale, 'inspector.openContributor', { username: selectedContributor.username })}>
                <ArrowSquareOut size={16} />
              </a>
            </div>
          )}

          {data.contributors.length === 0 ? (
            <p className="empty-detail">{t(locale, 'inspector.noContributors')}</p>
          ) : (
            <>
              <label className="contributor-search">
                <MagnifyingGlass size={15} />
                <span className="sr-only">{t(locale, 'inspector.filterContributors')}</span>
                <input
                  value={contributorQuery}
                  onChange={(event) => setContributorQuery(event.target.value)}
                  placeholder={t(locale, 'inspector.filterPlaceholder')}
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
                      title={renderedInScene ? t(locale, 'inspector.focusSignal') : t(locale, 'inspector.loadedOnly')}
                    >
                      <span className="object-index">{String(data.contributors.indexOf(contributor) + 1).padStart(2, '0')}</span>
                      <Image src={contributor.avatarUrl} alt="" width={32} height={32} className="contributor-avatar" unoptimized />
                      <span className="object-copy">
                        <strong>{contributor.username}</strong>
                        <small>{t(locale, 'inspector.contributions', { count: formatCompactNumber(contributor.contributions, locale) })}</small>
                      </span>
                      <span className={renderedInScene ? 'scene-presence active' : 'scene-presence'}>
                        {renderedInScene ? t(locale, 'inspector.signal') : t(locale, 'inspector.data')}
                      </span>
                    </button>
                  )
                })}
              </div>

              {hiddenContributorCount > 0 && (
                <button type="button" className="show-more-button" onClick={() => setShowAllContributors(true)}>
                  {t(locale, 'inspector.more', { count: hiddenContributorCount })}
                </button>
              )}
              {showAllContributors && filteredContributors.length > 24 && (
                <button type="button" className="show-more-button" onClick={() => setShowAllContributors(false)}>
                  {t(locale, 'inspector.top24')}
                </button>
              )}
            </>
          )}
        </div>
      )}

      <details className="data-coverage">
        <summary>{t(locale, 'inspector.coverage')}</summary>
        <p>{t(locale, 'inspector.coverageText')}</p>
      </details>
    </div>
  )
}
