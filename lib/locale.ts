import 'server-only'

import { cookies } from 'next/headers'
import { LOCALE_COOKIE, type Locale, locales } from './i18n'

export async function getLocale(): Promise<Locale> {
  const value = (await cookies()).get(LOCALE_COOKIE)?.value
  return locales.includes(value as Locale) ? (value as Locale) : 'en'
}
