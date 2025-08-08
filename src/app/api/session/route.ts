import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  // In Next.js app router, request headers are not used for cookies here; use the Web API
  // But we can read cookies via the Request object only in middleware/edge. Simpler: return 200 and let middleware protect pages.
  // However, in route handlers, Next provides request headers. We'll read from the incoming cookie header.
  const cookieHeader = (request.headers as any).get?.('cookie') as string | null
  const loggedIn = !!cookieHeader && cookieHeader.includes('pm_user_email=')
  const emailMatch = loggedIn ? cookieHeader.match(/pm_user_email=([^;]+)/) : null
  const email = emailMatch ? decodeURIComponent(emailMatch[1]) : null
  return NextResponse.json({ loggedIn, email })
}
