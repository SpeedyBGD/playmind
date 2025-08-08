import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/app/lib/supabaseServer'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
    }

    const { data, error } = await supabaseServer
      .from('Users')
      .select('email')
      .eq('email', email)
      .maybeSingle()

    if (error) {
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const res = NextResponse.json({ ok: true })
    const isProd = process.env.NODE_ENV === 'production'
    res.cookies.set('pm_user_email', email, {
      httpOnly: true,
      sameSite: 'lax',
      secure: isProd,
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    })
    return res
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
