'use client'

import { useState } from 'react'
import Chat from './components/Chat';

export default function Home() {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([])

  const sendMessage = async () => {
    if (!input.trim()) return
  
    setMessages([...messages, { role: 'user', content: input }])
    setInput('')
  
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, { role: 'user', content: input }] }),
      })
  
      const data = await res.json()
  
      if (data.reply) {
        setMessages((prev) => [...prev, data.reply])
      } else {
        setMessages((prev) => [...prev, { role: 'assistant', content: 'Greška u API pozivu' }])
      }
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Greška u konekciji' }])
    }
  }

  return (
    <main className="max-w-xl mx-auto p-4">
      <div className="mb-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`mb-2 p-3 rounded ${
              msg.role === 'user' ? 'bg-indigo-600 text-white self-end' : 'bg-indigo-200 text-black self-start'
            }`}
          >
            {msg.content}
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          className="flex-grow rounded px-3 py-2 text-black bg-white border border-gray-300"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Napiši poruku..."
          onKeyDown={(e) => {
            if (e.key === 'Enter') sendMessage()
          }}
        />
        <button
          onClick={sendMessage}
          className="bg-indigo-700 text-white px-4 py-2 rounded hover:bg-indigo-800 transition"
        >
          Pošalji
        </button>
      </div>
    </main>
  )
}
