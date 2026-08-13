import { LandingPage } from '@/components/landing/landing-page'
import { getLocale } from '@/lib/locale'

export const instant = false

export default async function HomePage() {
  return <LandingPage locale={await getLocale()} />
}
