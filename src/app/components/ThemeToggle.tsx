"use client"

import { useEffect, useState } from "react"

function getInitialTheme(): "light" | "dark" {
  if (typeof document === 'undefined') return 'dark'
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
}

export default function ThemeToggle(): JSX.Element {
  const [theme, setTheme] = useState<"light" | "dark">(getInitialTheme())

  useEffect(() => {
    const root = document.documentElement
    const body = document.body
    if (theme === "dark") { root.classList.add("dark"); body.classList.add("dark") }
    else { root.classList.remove("dark"); body.classList.remove("dark") }
    root.setAttribute('data-theme', theme)
    body.setAttribute('data-theme', theme)
    try { window.localStorage.setItem("theme", theme) } catch {}
    try { document.cookie = `theme=${theme}; path=/; max-age=${60*60*24*180}` } catch {}
  }, [theme])

  const toggle = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"))
  }

  const lightClasses = "inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold border border-emerald-600 bg-emerald-500 text-white shadow hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-400"
  const darkClasses = "inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold border border-white/30 bg-white/10 text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/40"
  const btnClass = theme === 'dark' ? darkClasses : lightClasses

  return (
    <button aria-label="Toggle theme" onClick={toggle} className={btnClass}>
      {theme === "dark" ? (
        <span className="inline-flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
            <path d="M21.752 15.002A9.718 9.718 0 0 1 12 21.75 9.75 9.75 0 0 1 12 2.25c.28 0 .558.012.833.035a.75.75 0 0 1 .28 1.393 7.5 7.5 0 0 0 8.306 11.324.75.75 0 0 1 .333 1.416z" />
          </svg>
          Dark
        </span>
      ) : (
        <span className="inline-flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
            <path d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12z" />
            <path fillRule="evenodd" d="M12 1.5a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0V2.25A.75.75 0 0 1 12 1.5zm0 15a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0V17.25a.75.75 0 0 1 .75-.75zM3.22 3.22a.75.75 0 0 1 1.06 0l1.59 1.59a.75.75 0 1 1-1.06 1.06L3.22 4.28a.75.75 0 0 1 0-1.06zm13.25 13.25a.75.75 0 0 1 1.06 0l1.59 1.59a.75.75 0 0 1-1.06 1.06l-1.59-1.59a.75.75 0 0 1 0-1.06zM1.5 12a.75.75 0 0 1 .75-.75h2.25a.75.75 0 0 1 0 1.5H2.25A.75.75 0 0 1 1.5 12zm15 0a.75.75 0 0 1 .75-.75h2.25a.75.75 0 0 1 0 1.5H17.25a.75.75 0 0 1-.75-.75z" clipRule="evenodd" />
          </svg>
          Light
        </span>
      )}
    </button>
  )
}
