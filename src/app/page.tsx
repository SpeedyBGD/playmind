"use client"

import { useEffect, useRef, useState } from 'react'
import { useToast } from './components/ToastProvider'

type Message = { role: 'user' | 'assistant'; content: string }

export default function Home() {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const endRef = useRef<HTMLDivElement | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const { addToast } = useToast()

  // Load messages from API on mount
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/messages', { cache: 'no-store' })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(data.error || 'Greška pri učitavanju poruka.')
        setMessages(data.messages ?? [])
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Greška pri učitavanju poruka.'
        addToast({ type: 'error', message: msg })
      }
    }
    load()
  }, [addToast, clearChat])

  // Auto-scroll to last message
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = '0px'
    el.style.height = Math.min(el.scrollHeight, 200) + 'px'
  }, [input])

  const saveMessage = async (msg: Message) => {
    const res = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(msg),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data.error || 'Greška pri čuvanju poruke')
  }

  const clearChat = async () => {
    try {
      const res = await fetch('/api/messages', { method: 'DELETE' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Greška pri brisanju')
      setMessages([])
      addToast({ type: 'success', message: 'Razgovor obrisan.' })
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Greška pri brisanju razgovora.'
      addToast({ type: 'error', message: msg })
    }
  }

  const sendMessage = async () => {
    if (!input.trim()) return

    const userMessage: Message = { role: 'user', content: input }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      await saveMessage(userMessage)

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      })

      const data = await res.json().catch(() => ({}))

      if (data.reply) {
        const assistantMessage: Message = data.reply
        setMessages((prev) => [...prev, assistantMessage])
        try { await saveMessage(assistantMessage) } catch {}
      } else {
        const errMessage: Message = { role: 'assistant', content: 'Greška u API pozivu' }
        setMessages((prev) => [...prev, errMessage])
        try { await saveMessage(errMessage) } catch {}
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Greška u konekciji'
      addToast({ type: 'error', message: msg })
      const errMessage: Message = { role: 'assistant', content: 'Greška u konekciji' }
      setMessages((prev) => [...prev, errMessage])
      try { await saveMessage(errMessage) } catch {}
    } finally {
      setLoading(false)
    }
  }

  // Clear chat action + Cmd/Ctrl+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().includes('MAC')
      const isMod = isMac ? e.metaKey : e.ctrlKey
      if (isMod && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault()
        clearChat()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <section className="backdrop-blur-lg bg-white/80 dark:bg-white/10 border border-emerald-900/10 dark:border-white/20 rounded-2xl shadow-xl p-6 md:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl md:text-2xl font-semibold tracking-tight">Chat</h2>
          <div className="flex items-center gap-2">
            <span className="text-xs md:text-sm text-emerald-600 dark:text-emerald-300">PlayMind Assistant</span>
            <button
              onClick={clearChat}
              className="text-xs md:text-sm px-2 py-1 rounded-md border border-emerald-900/10 dark:border-white/30 bg-white/40 dark:bg-white/10 hover:bg-white/60 dark:hover:bg-white/20 transition"
              title="Clear chat (Cmd/Ctrl+K)"
            >
              Clear
            </button>
          </div>
        </div>

        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1" aria-live="polite">
          {messages.length === 0 && (
            <p className="text-emerald-600 dark:text-emerald-300 text-sm">Započni razgovor ispod ✨</p>
          )}
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-message-in`}>
              <div
                className={`${
                  msg.role === 'user'
                    ? 'bg-emerald-500 text-white rounded-t-2xl rounded-bl-2xl'
                    : 'bg-white/90 dark:bg-white/80 text-emerald-900 rounded-t-2xl rounded-br-2xl'
                } px-4 py-2 max-w-[80%] shadow`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start animate-message-in">
              <div className="bg-white/90 dark:bg-white/80 text-emerald-900 px-4 py-2 rounded-t-2xl rounded-br-2xl shadow inline-flex items-center gap-1">
                {[0,1,2].map((d) => (
                  <span
                    key={d}
                    className="h-2 w-2 rounded-full bg-emerald-500/80 dark:bg-emerald-600/90 animate-typing"
                    style={{ animationDelay: `${d * 0.2}s` }}
                  />
                ))}
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        <div className="flex gap-3 items-end">
          <div className="relative flex-1">
            <textarea
              ref={textareaRef}
              rows={1}
              className="w-full rounded-xl px-4 py-3 text-emerald-900 bg-white placeholder-emerald-400/70 border border-emerald-900/10 dark:border-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-300/60 shadow-sm resize-none"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Napiši poruku..."
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  sendMessage()
                }
              }}
            />
          </div>
          <button
            onClick={sendMessage}
            disabled={loading}
            className="bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 disabled:opacity-60 text-white px-5 py-3 rounded-xl font-medium shadow-sm transition"
          >
            Pošalji
          </button>
        </div>
      </section>
    </main>
  )
}
