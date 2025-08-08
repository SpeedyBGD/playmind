"use client"

import ThemeToggle from "./ThemeToggle"
import Link from "next/link"
import { useEffect, useState } from "react"

export default function Header() {
  const [hasSession, setHasSession] = useState(false)

  useEffect(() => {
    let active = true
    const check = async () => {
      try {
        const res = await fetch('/api/session', { cache: 'no-store' })
        const data = await res.json().catch(() => ({}))
        if (!active) return
        setHasSession(!!data.loggedIn)
      } catch {
        if (!active) return
        setHasSession(false)
      }
    }
    check()
    return () => { active = false }
  }, [])

  const logout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' })
      document.cookie = 'pm_user_email=; path=/; max-age=0'
      window.location.href = '/login'
    } catch {}
  }

  return (
    <header className="sticky top-0 z-30 bg-white text-slate-900 dark:bg-white/5 dark:text-white border-b border-black/10 dark:border-white/20 shadow-sm">
      <div className="mx-auto max-w-5xl px-4 py-4 grid grid-cols-3 items-center relative z-10">
        <div className="justify-self-start" />
        <div className="justify-self-center">
          <span className="inline-block px-4 py-1 rounded-lg bg-emerald-600 text-white text-xl md:text-2xl font-extrabold tracking-tight shadow">
            PlayMind
          </span>
        </div>
        <div className="justify-self-end flex items-center gap-2">
          <Link
            href="/admin"
            className="shrink-0 inline-flex items-center justify-center min-w-[80px] text-xs md:text-sm px-4 py-2 rounded-full font-semibold border border-emerald-600 bg-emerald-500 text-white shadow hover:bg-emerald-600 transition focus:outline-none focus:ring-2 focus:ring-emerald-400 dark:border-emerald-600 dark:bg-emerald-500 dark:text-white dark:hover:bg-emerald-600"
          >
            Admin
          </Link>
          {hasSession && (
            <button
              onClick={logout}
              className="shrink-0 inline-flex items-center justify-center min-w-[88px] text-xs md:text-sm px-4 py-2 rounded-full font-semibold border border-emerald-600 bg-emerald-500 text-white shadow hover:bg-emerald-600 transition focus:outline-none focus:ring-2 focus:ring-emerald-400 dark:border-emerald-600 dark:bg-emerald-500 dark:text-white dark:hover:bg-emerald-600"
            >
              Logout
            </button>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
  