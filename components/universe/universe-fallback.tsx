import type { CSSProperties } from 'react'
import { formatPercentage } from '@/lib/universe/format'
import { type Locale, t } from '@/lib/i18n'
import type { RepositoryUniverseData, UniverseModel } from '@/lib/universe/types'

export function UniverseFallback({ data, locale, model }: { data: RepositoryUniverseData; locale: Locale; model: UniverseModel }) {
  return (
    <div className="universe-fallback" role="img" aria-label={t(locale, 'fallback.label', { repository: data.repository.fullName })}>
      <div className="fallback-grid" aria-hidden="true" />
      {model.planets.map((planet, index) => {
        const diameter = Math.min(82, 26 + planet.percentage * 0.7)
        const orbit = Math.min(82, 26 + index * 8.5)
        const angle = planet.startAngle
        const x = 50 + Math.cos(angle) * orbit * 0.42
        const y = 50 + Math.sin(angle) * orbit * 0.34
        return (
          <div
            key={planet.id}
            className="fallback-planet"
            style={{
              width: diameter,
              height: diameter,
              left: `${x}%`,
              top: `${y}%`,
              background: `radial-gradient(circle at 32% 28%, #fff8, ${planet.color} 36%, #091019 80%)`,
            }}
            title={`${planet.language} ${formatPercentage(planet.percentage, locale)}%`}
          />
        )
      })}
      <div className="fallback-star" style={{ '--fallback-accent': model.star.color } as CSSProperties} />
      <div className="fallback-message">
        <span>{t(locale, 'fallback.mode')}</span>
        <strong>{data.repository.fullName}</strong>
        <p>{t(locale, 'fallback.text')}</p>
      </div>
    </div>
  )
}
