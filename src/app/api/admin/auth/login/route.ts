import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/app/lib/supabaseServer'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    if (typeof email !== 'string' || !email.includes('@') || typeof password !== 'string' || password.length < 6) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 400 })
    }

    const { data, error } = await supabaseServer
      .from('Admins')
      .select('email, password_hash')
      .eq('email', email)
      .maybeSingle()

    if (error) return NextResponse.json({ error: 'Database error' }, { status: 500 })
    if (!data) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const ok = await bcrypt.compare(password, data.password_hash)
    if (!ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const res = NextResponse.json({ ok: true })
    const isProd = process.env.NODE_ENV === 'production'
    res.cookies.set('pm_admin', email, { httpOnly: true, sameSite: 'lax', secure: isProd, path: '/', maxAge: 60 * 60 * 24 * 30 })
    return res
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}


