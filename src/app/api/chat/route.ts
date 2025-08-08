import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/app/lib/supabaseServer'

export async function POST(request: NextRequest) {
  try {
    const email = request.cookies.get('pm_user_email')?.value
    if (!email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { messages: clientMessages } = await request.json()

    // Load last N messages for this user to construct context
    const { data: storedMessages, error } = await supabaseServer
      .from('messages')
      .select('role, content')
      .eq('user_email', email)
      .order('id', { ascending: true })
      .limit(50)

    if (error) {
      return NextResponse.json({ error: error.message || 'Database error' }, { status: 500 })
    }

    const contextMessages = (storedMessages ?? []) as { role: 'user' | 'assistant'; content: string }[]
    const finalMessages = Array.isArray(clientMessages) && clientMessages.length > 0
      ? clientMessages
      : contextMessages

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: finalMessages,
        max_tokens: 500,
      }),
    })

    if (!response.ok) {
      const errorJson = await response.json()
      return NextResponse.json({ error: errorJson }, { status: response.status })
    }

    const data = await response.json()
    const reply = data.choices[0].message

    return NextResponse.json({ reply })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
