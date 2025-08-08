"use client"

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useToast } from '../components/ToastProvider'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const search = useSearchParams()
  const { addToast } = useToast()

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!email.includes('@')) {
      addToast({ type: 'error', message: 'Unesite validan email.' })
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) {
        addToast({ type: 'error', message: data.error || 'Nije dozvoljeno.' })
        return
      }
      addToast({ type: 'success', message: 'Uspešna prijava.' })
      const redirect = search.get('redirect') || '/'
      router.replace(redirect)
    } catch (e) {
      addToast({ type: 'error', message: 'Greška pri prijavi.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-[80vh] flex items-center justify-center px-4">
      <section className="w-full max-w-md backdrop-blur-lg bg-white/80 dark:bg-white/10 border border-emerald-900/10 dark:border-white/20 rounded-2xl shadow-xl p-6 md:p-8 space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-semibold">PlayMind</h1>
          <p className="text-sm text-emerald-800/70 dark:text-white/70">Prijavite se putem email adrese</p>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <input
            type="email"
            inputMode="email"
            placeholder="email@example.com"
            className="w-full rounded-xl px-4 py-3 text-emerald-900 bg-white placeholder-emerald-400/70 border border-emerald-900/10 dark:border-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-300/60 shadow-sm"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 disabled:opacity-60 text-white px-5 py-3 rounded-xl font-medium shadow-sm transition"
          >
            {loading ? 'Prijava…' : 'Prijavi se'}
          </button>
        </form>
        
      </section>
    </main>
  )
}
