import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/app/lib/supabaseServer'

export async function GET(request: NextRequest) {
  const email = request.cookies.get('pm_user_email')?.value
  if (!email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabaseServer
    .from('messages')
    .select('role, content, created_at, user_email')
    .eq('user_email', email)
    .order('id', { ascending: true })

  if (error) return NextResponse.json({ error: error.message || 'Database error' }, { status: 500 })
  return NextResponse.json({ messages: (data ?? []).map(({ role, content }) => ({ role, content })) })
}

export async function POST(request: NextRequest) {
  const email = request.cookies.get('pm_user_email')?.value
  if (!email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { role, content } = body ?? {}
  if (role !== 'user' && role !== 'assistant') {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
  }
  if (typeof content !== 'string' || !content.trim()) {
    return NextResponse.json({ error: 'Invalid content' }, { status: 400 })
  }

  const { error } = await supabaseServer.from('messages').insert({ role, content, user_email: email })
  if (error) return NextResponse.json({ error: error.message || 'Database error' }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(request: NextRequest) {
  const email = request.cookies.get('pm_user_email')?.value
  if (!email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { error } = await supabaseServer.from('messages').delete().eq('user_email', email)
  if (error) return NextResponse.json({ error: error.message || 'Database error' }, { status: 500 })
  return NextResponse.json({ ok: true })
}
