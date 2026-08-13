'use client'

import * as Dialog from '@radix-ui/react-dialog'
import * as Tooltip from '@radix-ui/react-tooltip'
import {
  ArrowSquareOut,
  Code,
  GearSix,
  GitFork,
  MagnifyingGlass,
  Pause,
  Play,
  ShareNetwork,
  SidebarSimple,
  Star,
  Target,
  X,
} from '@phosphor-icons/react'
import { useCallback, useEffect, useMemo, useState, type CSSProperties } from 'react'
import { useRouter } from 'next/navigation'
import { Brand } from '@/components/ui/logo'
import { RepositorySearch } from '@/components/repository-search/repository-search'
import { RepositoryInspector, type InspectorTab } from '@/components/inspector/repository-inspector'
import { createUniverseModel } from '@/lib/universe/model'
import { formatBytes, formatCompactNumber, formatDate } from '@/lib/universe/format'
import type { GraphicsQuality, RepositoryUniverseData } from '@/lib/universe/types'
import { UniverseCanvas, type UniverseCanvasApi } from './universe-canvas'
import { UniverseFallback } from './universe-fallback'
import type { UniverseHover } from './engine/UniverseEngine'

function useReducedMotion(): boolean {
  const [value, setValue] = useState(false)
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setValue(query.matches)
    update()
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])
  return value
}

function initialQuality(): GraphicsQuality {
  if (typeof window === 'undefined') return 'auto'
  try {
    const stored = window.localStorage.getItem('repo-universe-quality')
    return stored === 'high' || stored === 'low' || stored === 'auto' ? stored : 'auto'
  } catch {
    return 'auto'
  }
}

async function copyText(value: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value)
    return
  }
  const textarea = document.createElement('textarea')
  textarea.value = value
  textarea.setAttribute('readonly', '')
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  textarea.select()
  const copied = document.execCommand('copy')
  textarea.remove()
  if (!copied) throw new Error('Clipboard unavailable')
}

function resolveAutoQuality(reducedMotion: boolean): GraphicsQuality {
  if (reducedMotion) return 'low'
  if (typeof window === 'undefined') return 'auto'
  const mobile = window.matchMedia('(max-width: 700px)').matches
  const dpr = window.devicePixelRatio || 1
  const cores = navigator.hardwareConcurrency || 4
  return mobile || dpr > 2.2 || cores <= 4 ? 'low' : 'auto'
}

export function UniverseExperience({ data }: { data: RepositoryUniverseData }) {
  const model = useMemo(() => createUniverseModel(data), [data])
  const reducedMotion = useReducedMotion()
  const [qualityPreference, setQualityPreference] = useState<GraphicsQuality>(initialQuality)
  const resolvedAutoQuality = useMemo(() => resolveAutoQuality(reducedMotion), [reducedMotion])
  const [api, setApi] = useState<UniverseCanvasApi | null>(null)
  const [paused, setPaused] = useState(false)
  const [inspectorOpen, setInspectorOpen] = useState(() =>
    typeof window !== 'undefined' ? !window.matchMedia('(max-width: 700px)').matches : false
  )
  const [tab, setTab] = useState<InspectorTab>('overview')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [hover, setHover] = useState<UniverseHover>(null)
  const [fallback, setFallback] = useState(false)
  const [shared, setShared] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || document.querySelector('[role="dialog"]')) return
      setSelectedId(null)
      api?.reset()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [api])

  const actualQuality = qualityPreference === 'auto' ? resolvedAutoQuality : qualityPreference
  const primaryLanguage = data.languages[0]
  const pageStyle = {
    '--repo-accent': primaryLanguage?.color || '#7cb9e8',
  } as CSSProperties

  const onReady = useCallback((nextApi: UniverseCanvasApi | null) => setApi(nextApi), [])
  const onHover = useCallback((value: UniverseHover) => setHover(value), [])
  const onUnavailable = useCallback(() => setFallback(true), [])
  const onSelect = useCallback((id: string) => {
    setSelectedId(id)
    setInspectorOpen(true)
    if (id.startsWith('language:')) setTab('languages')
    else if (id.startsWith('contributor:')) setTab('contributors')
    else setTab('overview')
  }, [])

  function focus(id: string) {
    setSelectedId(id)
    api?.focus(id)
  }

  function updateQuality(value: GraphicsQuality) {
    setPaused(false)
    api?.setPaused(false)
    setQualityPreference(value)
    try {
      window.localStorage.setItem('repo-universe-quality', value)
    } catch {
      // Browser privacy settings may disable storage. The current session still keeps the choice.
    }
  }

  async function share() {
    const url = new URL(
      `/${encodeURIComponent(data.repository.owner)}/${encodeURIComponent(data.repository.name)}`,
      window.location.origin,
    ).toString()
    try {
      if (navigator.share) await navigator.share({ title: `${data.repository.fullName} - Repo Universe`, url })
      else await copyText(url)
      setShared(true)
      window.setTimeout(() => setShared(false), 1800)
    } catch {
      // Share cancellation is not an application error.
    }
  }

  function tooltipLabel(id: string): string {
    if (id === 'repository') return `${data.repository.fullName} / ${formatCompactNumber(data.repository.stars)} stars`
    if (id.startsWith('language:')) {
      const language = data.languages.find((entry) => `language:${entry.name}` === id)
      return language ? `${language.name} / ${language.percentage.toFixed(1)}% / ${formatBytes(language.bytes)}` : id
    }
    const contributor = data.contributors.find((entry) => `contributor:${entry.username}` === id)
    return contributor ? `${contributor.username} / ${formatCompactNumber(contributor.contributions)} contributions` : id
  }

  return (
    <Tooltip.Provider delayDuration={280}>
      <main className="universe-page" style={pageStyle}>
        <div className="universe-scene">
          {fallback ? (
            <UniverseFallback data={data} model={model} />
          ) : (
            <UniverseCanvas
              model={model}
              quality={actualQuality}
              reducedMotion={reducedMotion}
              onHover={onHover}
              onSelect={onSelect}
              onReady={onReady}
              onUnavailable={onUnavailable}
            />
          )}
        </div>

        <header className="universe-navigation">
          <div className="nav-island nav-repository-island">
            <button type="button" className="brand-button" onClick={() => router.push('/')} aria-label="Repo Universe home">
              <Brand compact />
            </button>
            <span className="nav-separator" />
            <button type="button" className="repo-identity" onClick={() => focus('repository')}>
              <span>{data.repository.owner}</span>
              <strong>{data.repository.name}</strong>
            </button>
            {data.repository.archived && <span className="archived-badge">Archived</span>}
          </div>

          <div className="nav-island nav-action-island">
            <Dialog.Root>
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <Dialog.Trigger asChild>
                    <button type="button" className="icon-button" aria-label="Search repositories"><MagnifyingGlass size={18} /></button>
                  </Dialog.Trigger>
                </Tooltip.Trigger>
                <Tooltip.Portal><Tooltip.Content className="radix-tooltip" sideOffset={8}>Search repository</Tooltip.Content></Tooltip.Portal>
              </Tooltip.Root>
              <Dialog.Portal>
                <Dialog.Overlay className="dialog-overlay" />
                <Dialog.Content className="search-dialog">
                  <div className="dialog-heading">
                    <div><span>Explore repository</span><Dialog.Title>Map another universe</Dialog.Title></div>
                    <Dialog.Close className="icon-button"><X size={18} /><span className="sr-only">Close</span></Dialog.Close>
                  </div>
                  <Dialog.Description>Enter a public GitHub repository name or URL.</Dialog.Description>
                  <RepositorySearch compact autoFocus />
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>

            <Tooltip.Root>
              <Tooltip.Trigger asChild><button type="button" className="icon-button" onClick={() => void share()} aria-label="Share universe"><ShareNetwork size={18} /></button></Tooltip.Trigger>
              <Tooltip.Portal><Tooltip.Content className="radix-tooltip" sideOffset={8}>{shared ? 'Copied' : 'Share'}</Tooltip.Content></Tooltip.Portal>
            </Tooltip.Root>

            <a className="icon-button desktop-github" href={data.repository.url} target="_blank" rel="noreferrer" aria-label="Open on GitHub">
              <ArrowSquareOut size={18} />
            </a>
            <button type="button" className="icon-button" onClick={() => setInspectorOpen((value) => !value)} aria-label="Toggle repository inspector">
              <SidebarSimple size={18} />
            </button>
          </div>
        </header>

        <section className="system-brief" aria-label="Repository summary">
          <div className="system-brief-heading">
            <span>Repository star</span>
            <h1>{data.repository.fullName}</h1>
          </div>
          <p>{data.repository.description || 'GitHub does not provide a description for this repository.'}</p>
          <div className="system-brief-metrics">
            <div><span><Star size={14} weight="fill" /> Stars</span><strong>{formatCompactNumber(data.repository.stars)}</strong></div>
            <div><span><GitFork size={14} /> Forks</span><strong>{formatCompactNumber(data.repository.forks)}</strong></div>
            <div><span>Activity</span><strong>{Math.round(data.activity.score * 100)}%</strong></div>
          </div>
          <div className="system-brief-foot">
            <span><Code size={14} /> {primaryLanguage ? `${primaryLanguage.name} ${primaryLanguage.percentage.toFixed(1)}%` : 'No language data'}</span>
            <span>Last push {formatDate(data.repository.pushedAt)}</span>
          </div>
        </section>

        <div className="scene-control-stack" aria-label="Universe controls">
          <div className="control-island">
            <Tooltip.Root>
              <Tooltip.Trigger asChild><button type="button" className="icon-button" onClick={() => api?.reset()} aria-label="Reset camera"><Target size={18} /></button></Tooltip.Trigger>
              <Tooltip.Portal><Tooltip.Content className="radix-tooltip" sideOffset={8}>Reset camera</Tooltip.Content></Tooltip.Portal>
            </Tooltip.Root>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <button type="button" className="icon-button" onClick={() => { const next = !paused; setPaused(next); api?.setPaused(next) }} aria-label={paused ? 'Resume universe' : 'Pause universe'}>
                  {paused ? <Play size={18} /> : <Pause size={18} />}
                </button>
              </Tooltip.Trigger>
              <Tooltip.Portal><Tooltip.Content className="radix-tooltip" sideOffset={8}>{paused ? 'Resume' : 'Pause'}</Tooltip.Content></Tooltip.Portal>
            </Tooltip.Root>
            <Dialog.Root>
              <Tooltip.Root>
                <Tooltip.Trigger asChild><Dialog.Trigger asChild><button type="button" className="icon-button" aria-label="Graphics settings"><GearSix size={18} /></button></Dialog.Trigger></Tooltip.Trigger>
                <Tooltip.Portal><Tooltip.Content className="radix-tooltip" sideOffset={8}>Graphics</Tooltip.Content></Tooltip.Portal>
              </Tooltip.Root>
              <Dialog.Portal>
                <Dialog.Overlay className="dialog-overlay" />
                <Dialog.Content className="settings-dialog">
                  <div className="dialog-heading">
                    <div><span>Rendering</span><Dialog.Title>Graphics quality</Dialog.Title></div>
                    <Dialog.Close className="icon-button"><X size={18} /><span className="sr-only">Close</span></Dialog.Close>
                  </div>
                  <Dialog.Description>Choose how much GPU work Repo Universe may use.</Dialog.Description>
                  <div className="quality-options">
                    {(['auto', 'high', 'low'] as const).map((value) => (
                      <button type="button" key={value} className={qualityPreference === value ? 'selected' : undefined} onClick={() => updateQuality(value)}>
                        <strong>{value[0].toUpperCase() + value.slice(1)}</strong>
                        <span>{value === 'auto' ? 'Adapts to device and motion preference.' : value === 'high' ? 'Richer particles, bloom and a higher DPR cap.' : 'Lower DPR and reduced scene complexity.'}</span>
                      </button>
                    ))}
                  </div>
                  {reducedMotion && <p className="settings-note">Reduced motion is enabled by your operating system. Orbital animation is minimized.</p>}
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>
          </div>
          <div className="control-help desktop-only">Drag to orbit / wheel to zoom / select a body</div>
        </div>

        {inspectorOpen && (
          <aside className="repository-inspector" aria-label="Repository inspector">
            <div className="inspector-heading">
              <div><span>Repository inspector</span><strong>{data.repository.fullName}</strong></div>
              <button type="button" className="icon-button" onClick={() => setInspectorOpen(false)} aria-label="Close inspector"><X size={17} /></button>
            </div>
            <RepositoryInspector
              data={data}
              tab={tab}
              onTabChange={setTab}
              selectedId={selectedId}
              onFocus={focus}
              sceneContributorCount={model.contributors.length}
            />
          </aside>
        )}

        {!inspectorOpen && (
          <button type="button" className="mobile-inspector-trigger" onClick={() => setInspectorOpen(true)}>
            <SidebarSimple size={17} /> Inspector
          </button>
        )}

        <div className="scene-readout" aria-hidden="true">
          <span>{model.planets.length} planets</span>
          <span>{model.contributors.length} contributor signals</span>
          <span>{data.contributors.length} contributors loaded (max 100)</span>
          <span>{actualQuality.toUpperCase()} render</span>
        </div>

        {hover && !fallback && <div className="scene-tooltip" style={{ left: hover.x + 14, top: hover.y + 14 }}>{tooltipLabel(hover.id)}</div>}
        {shared && <div className="toast" role="status">Universe link copied.</div>}
      </main>
    </Tooltip.Provider>
  )
}
