import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/app/lib/supabaseServer'

function isAdmin(request: NextRequest): string | null {
  // Use pm_admin cookie set by admin auth
  const email = request.cookies.get('pm_admin')?.value || null
  return email
}

export async function GET(request: NextRequest) {
  const admin = isAdmin(request)
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { data, error } = await supabaseServer.from('Users').select('email').order('email')
  if (error) return NextResponse.json({ error: error.message || 'Database error' }, { status: 500 })
  return NextResponse.json({ emails: (data ?? []).map((r) => r.email) })
}

export async function POST(request: NextRequest) {
  const admin = isAdmin(request)
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { email } = await request.json()
  if (typeof email !== 'string' || !email.includes('@')) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
  }
  const { error } = await supabaseServer.from('Users').insert({ email })
  if (error) return NextResponse.json({ error: error.message || 'Database error' }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(request: NextRequest) {
  const admin = isAdmin(request)
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { email } = await request.json()
  if (typeof email !== 'string' || !email.includes('@')) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
  }
  const { error } = await supabaseServer.from('Users').delete().eq('email', email)
  if (error) return NextResponse.json({ error: error.message || 'Database error' }, { status: 500 })
  return NextResponse.json({ ok: true })
}
