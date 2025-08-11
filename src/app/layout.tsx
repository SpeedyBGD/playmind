import './globals.css'
import Header from './components/Header'
import ToastProvider from './components/ToastProvider'

export const metadata = {
  title: 'PlayMind',
  description: 'Your PlayMind Application',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(() => { try { const t = localStorage.getItem('theme'); const d = document.documentElement; if (t === 'light') { d.classList.remove('dark'); d.setAttribute('data-theme','light'); } else { d.classList.add('dark'); d.setAttribute('data-theme','dark'); } } catch (_) { document.documentElement.classList.add('dark'); } })();`,
          }}
        />
      </head>
      <body suppressHydrationWarning className="min-h-screen bg-neutral-200 text-slate-900 dark:bg-neutral-950 dark:text-emerald-50">
        <ToastProvider>
          <Header />
          {children}
        </ToastProvider>
      </body>
    </html>
  )
}
