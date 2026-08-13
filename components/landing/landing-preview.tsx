import { type Locale, t } from '@/lib/i18n'

export function LandingPreview({ locale }: { locale: Locale }) {
  return (
    <div className="landing-preview" aria-hidden="true">
      <div className="preview-stars" />
      <div className="preview-field-line preview-field-line-a" />
      <div className="preview-field-line preview-field-line-b" />

      <div className="preview-orbit preview-orbit-a">
        <span className="preview-planet preview-planet-a" />
      </div>
      <div className="preview-orbit preview-orbit-b">
        <span className="preview-planet preview-planet-b" />
      </div>
      <div className="preview-orbit preview-orbit-c">
        <span className="preview-planet preview-planet-c" />
      </div>

      <div className="preview-star"><span /></div>
      <div className="preview-signal preview-signal-a" />
      <div className="preview-signal preview-signal-b" />
      <div className="preview-signal preview-signal-c" />

      <div className="preview-object-label preview-repository-label">
        <span>{t(locale, 'preview.repositoryStar')}</span>
        <strong>facebook/react</strong>
      </div>
      <div className="preview-object-label preview-language-label preview-language-a">
        <strong>JavaScript</strong>
        <span>63.4%</span>
      </div>
      <div className="preview-object-label preview-language-label preview-language-b">
        <strong>TypeScript</strong>
        <span>29.8%</span>
      </div>

      <div className="preview-readout">
        <span>{t(locale, 'preview.planets', { count: 8 })}</span>
        <span>{t(locale, 'preview.contributorSignals', { count: 18 })}</span>
        <span>{t(locale, 'preview.deterministic')}</span>
      </div>
    </div>
  )
}
