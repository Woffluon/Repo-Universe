import type { SVGProps } from 'react'

export function RepoUniverseMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true" {...props}>
      <circle cx="20" cy="20" r="4.25" fill="currentColor" />
      <ellipse cx="20" cy="20" rx="15" ry="7.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <ellipse
        cx="20"
        cy="20"
        rx="15"
        ry="7.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        transform="rotate(60 20 20)"
        opacity=".7"
      />
      <circle cx="34" cy="18" r="2.3" fill="currentColor" />
      <circle cx="12" cy="7.7" r="2" fill="currentColor" />
      <path d="M20 15.75v-6.5M20 9.25l-4-3M20 9.25l4-3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <span className="brand">
      <RepoUniverseMark className="brand-mark" />
      {!compact && <span>Repo Universe</span>}
    </span>
  )
}
