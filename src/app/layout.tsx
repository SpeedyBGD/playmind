import './globals.css'
import Header from './components/Header'
import { cookies } from 'next/headers'
import ToastProvider from './components/ToastProvider'

export const metadata = {
  title: 'PlayMind',
  description: 'Your PlayMind Application',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  await cookies() // Keep await to avoid sync dynamic API warnings, but ignore value
  const htmlClass = 'dark'

  return (
    <html lang="en" className={htmlClass} suppressHydrationWarning>
      <body className="min-h-screen bg-neutral-200 text-slate-900 dark:bg-neutral-950 dark:text-emerald-50">
        <ToastProvider>
          <Header />
          {children}
        </ToastProvider>
      </body>
    </html>
  )
}
