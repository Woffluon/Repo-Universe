import { NextResponse } from 'next/server'
import { LOCALE_COOKIE, locales } from '@/lib/i18n'

export async function POST(request: Request): Promise<NextResponse> {
  const { locale } = await request.json() as { locale?: string }
  const selectedLocale = locales.find((value) => value === locale)
  if (!selectedLocale) return NextResponse.json({ error: 'Invalid locale' }, { status: 400 })

  const response = new NextResponse(null, { status: 204 })
  response.cookies.set(LOCALE_COOKIE, selectedLocale, { path: '/', maxAge: 31_536_000, sameSite: 'lax' })
  return response
}
