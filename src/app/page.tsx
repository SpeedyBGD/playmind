"use client";
import { useEffect, useState } from "react";

export default function ChatPage() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Kada se stranica učita — uzmi PRVI POZDRAV
  useEffect(() => {
    const fetchGreeting = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: [] })
        });
        const data = await res.json();
        setMessages([data.reply]);
      } catch (err) {
        console.error("Greška pri učitavanju pozdrava:", err);
      }
      setLoading(false);
    };

    fetchGreeting();
  }, []);

  // Slanje korisničke poruke
  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages })
      });

      const data = await res.json();
      setMessages([...newMessages, data.reply]);
    } catch (err) {
      console.error("Greška pri slanju poruke:", err);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col px-3 sm:px-4 py-6 sm:py-8 bg-transparent text-slate-900">
      <div className="flex-1 space-y-2 mb-4 overflow-y-auto">
        {messages.map((m, i) => (
          <div
            key={i}
            className={m.role === "user" ? "!text-slate-900 dark:!text-emerald-300" : "!text-slate-900 dark:!text-emerald-100"}
          >
            <strong>{m.role === "user" ? "Ti" : "PlayMind"}:</strong> {m.content}
          </div>
        ))}

        {loading && (
          <div className="text-emerald-700/70 dark:text-emerald-300/80 italic">PlayMind razmišlja...</div>
        )}
      </div>

      <div className="flex gap-2 sm:gap-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 p-3 text-emerald-900 bg-white placeholder-emerald-400/70 border border-emerald-900/10 dark:text-emerald-900 dark:bg-white dark:placeholder-emerald-400/70 dark:border-white/20 rounded"
          placeholder="Type your message..."
          disabled={loading}
        />
        <button
          onClick={sendMessage}
          className="bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white px-4 py-2 rounded disabled:opacity-50"
          disabled={loading}
        >
          Send
        </button>
      </div>
    </div>
  );
}
