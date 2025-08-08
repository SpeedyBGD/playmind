import { NextResponse, type NextRequest } from 'next/server'

// Public routes that do not require user session
const PUBLIC_PATHS = [
  '/login',
  '/admin',
  '/favicon.ico',
  '/_next',
  '/api/login',
  '/api/admin/auth/login',
  '/api/admin/auth/logout',
  '/api/admin/users',
  '/api/session',
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p))
  if (isPublic) return NextResponse.next()

  const loggedIn = request.cookies.get('pm_user_email')?.value
  if (!loggedIn) {
    const url = new URL('/login', request.url)
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|images).*)'],
}
