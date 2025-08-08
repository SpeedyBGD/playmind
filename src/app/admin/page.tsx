"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '../components/ToastProvider'

export default function AdminPage() {
  const router = useRouter()
  const [emails, setEmails] = useState<string[]>([])
  const [newEmail, setNewEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [adminLoggedIn, setAdminLoggedIn] = useState<boolean>(false)
  const [adminEmail, setAdminEmail] = useState('')
  const [adminPassword, setAdminPassword] = useState('')
  const { addToast } = useToast()

  const checkAdmin = async () => {
    // Attempt to access protected endpoint; only 200 means logged in
    const res = await fetch('/api/admin/users', { cache: 'no-store' })
    if (!res.ok) {
      setAdminLoggedIn(false)
      return false
    }
    setAdminLoggedIn(true)
    return true
  }

  const load = async () => {
    setLoading(true)
    try {
      const ok = await checkAdmin()
      if (!ok) return
      const res = await fetch('/api/admin/users')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Greška')
      setEmails(data.emails || [])
    } catch {
      addToast({ type: 'error', message: 'Greška pri učitavanju korisnika.' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const adminLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: adminEmail, password: adminPassword }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Neuspešna prijava')
      addToast({ type: 'success', message: 'Admin prijava uspešna.' })
      setAdminPassword('')
      load()
    } catch (err) {
      addToast({ type: 'error', message: err instanceof Error ? err.message : 'Greška pri prijavi' })
    }
  }

  const adminLogout = async () => {
    try {
      await fetch('/api/admin/auth/logout', { method: 'POST' })
      addToast({ type: 'success', message: 'Admin odjavljen.' })
      setAdminLoggedIn(false)
      setEmails([])
      router.replace('/admin')
    } catch {}
  }

  const add = async () => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newEmail }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Greška dodavanja')
      addToast({ type: 'success', message: 'Korisnik dodat.' })
      setNewEmail('')
      load()
    } catch {
      addToast({ type: 'error', message: 'Greška pri dodavanju.' })
    }
  }

  const remove = async (email: string) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Greška brisanja')
      addToast({ type: 'success', message: 'Korisnik obrisan.' })
      load()
    } catch {
      addToast({ type: 'error', message: 'Greška pri brisanju.' })
    }
  }

  return (
    <main className="max-w-3xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
      <section className="backdrop-blur-lg bg-white/80 dark:bg-white/10 border border-emerald-900/10 dark:border-white/20 rounded-2xl shadow-xl p-5 sm:p-6 space-y-5 sm:space-y-6">
        {!adminLoggedIn ? (
          <form onSubmit={adminLogin} className="space-y-4">
            <h1 className="text-xl font-semibold">Admin prijava</h1>
            <input
              type="email"
              placeholder="admin@example.com"
              className="w-full rounded-xl px-4 py-2 text-emerald-900 bg-white border border-emerald-900/10 dark:border-white/30"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Lozinka"
              className="w-full rounded-xl px-4 py-2 text-emerald-900 bg-white border border-emerald-900/10 dark:border-white/30"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
            />
            <button type="submit" className="w-full px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white">Prijavi se</button>
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => router.push('/')}
                className="inline-block text-xs md:text-sm px-3 py-2 rounded-md border border-emerald-900/10 dark:border-white/30 bg-white/40 dark:bg-white/10 hover:bg-white/60 dark:hover:bg-white/20 transition"
              >
                Home
              </button>
            </div>
          </form>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-semibold">Admin - Users</h1>
              <div className="flex gap-2">
                <button onClick={load} className="text-xs px-2 py-1 rounded-md border border-emerald-900/10 dark:border-white/30 bg-white/40 dark:bg-white/10 hover:bg-white/60 dark:hover:bg-white/20">Refresh</button>
                <button onClick={adminLogout} className="text-xs px-2 py-1 rounded-md border border-white/30 bg-white/10 hover:bg-white/20">Logout</button>
              </div>
            </div>
            <div className="flex gap-2 flex-col sm:flex-row">
              <input
                type="email"
                placeholder="email@example.com"
                className="flex-1 rounded-xl px-3 sm:px-4 py-2 text-emerald-900 bg-white border border-emerald-900/10 dark:border-white/30"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
              <button onClick={add} className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white">Add</button>
            </div>

            {loading ? (
              <p className="text-sm text-emerald-800/70 dark:text-white/70">Učitavanje...</p>
            ) : (
              <ul className="divide-y divide-emerald-900/10 dark:divide-white/20 text-sm sm:text-base">
                {emails.map((email) => (
                  <li key={email} className="py-3 flex items-center justify-between">
                    <span>{email}</span>
                    <button
                      onClick={() => remove(email)}
                      className="text-xs md:text-sm px-3 py-2 rounded-full font-semibold border border-red-600 bg-red-500 text-white shadow hover:bg-red-600 transition focus:outline-none focus:ring-2 focus:ring-red-400 dark:border-red-600 dark:bg-red-600/80 dark:text-white dark:hover:bg-red-600"
                    >
                      Remove
                    </button>
                  </li>
                ))}
                {emails.length === 0 && <li className="py-3 text-sm text-emerald-800/70 dark:text-white/70">Nema korisnika.</li>}
              </ul>
            )}
          </>
        )}
      </section>
    </main>
  )
}
