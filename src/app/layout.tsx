import './globals.css'
import Header from './components/Header'

export const metadata = {
  title: 'PlayMind',
  description: 'Your PlayMind Application',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gradient-to-r from-indigo-500 to-purple-600 min-h-screen text-white">
        <Header />
        {children}
      </body>
    </html>
  )
}
