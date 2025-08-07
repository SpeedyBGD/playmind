'use client';

import { useState } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Nešto nije u redu.');
      }

      const data = await res.json();
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.reply,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `Greška: ${err.message}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">🧠 PlayMind Chat</h1>
      
      <div className="space-y-2 border p-4 rounded-md h-[400px] overflow-y-auto bg-gray-50">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`p-2 rounded-md ${
              msg.role === 'user' ? 'bg-blue-100 text-right' : 'bg-green-100 text-left'
            }`}
          >
            <p>{msg.content}</p>
          </div>
        ))}
        {loading && <p className="text-sm text-gray-500 italic">AI piše odgovor...</p>}
      </div>

      <div className="flex gap-2">
        <textarea
          className="flex-1 p-2 border rounded-md resize-none"
          rows={2}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Postavi pitanje..."
        />
        <button
          onClick={sendMessage}
          className="bg-blue-600 text-white px-4 py-2 rounded-md disabled:opacity-50"
          disabled={loading}
        >
          Pošalji
        </button>
      </div>
    </div>
  );
}
