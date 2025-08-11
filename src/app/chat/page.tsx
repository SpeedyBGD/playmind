"use client";
import { useEffect, useState } from "react";

export default function ChatPage() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isDark, setIsDark] = useState(false);

  // Prvi pozdrav sa backend-a
  useEffect(() => {
    const fetchGreeting = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: [] }),
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

  // Track theme so we can force readable colors in light mode
  useEffect(() => {
    const update = () => setIsDark(document.documentElement.classList.contains("dark"));
    update();
    const obs = new MutationObserver(update);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  // Slanje poruke
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
        body: JSON.stringify({ messages: newMessages }),
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
            className={
              m.role === "user"
                ? (isDark ? "!text-emerald-300" : "!text-slate-900")
                : (isDark ? "!text-emerald-100" : "!text-slate-900")
            }
          >
            <strong>{m.role === "user" ? "Ti" : "PlayMind"}:</strong> {m.content}
          </div>
        ))}

        {loading && (
          <div className={isDark ? "text-emerald-300/80 italic" : "text-slate-600 italic"}>PlayMind razmišlja...</div>
        )}
      </div>

      <div className="sticky bottom-0 left-0 right-0 z-10 bg-white/80 dark:bg-neutral-900/70 backdrop-blur border-t border-emerald-900/10 dark:border-white/20 p-2 sm:p-3 rounded-xl">
        <div className="flex gap-2 sm:gap-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 p-3 text-slate-900 bg-white placeholder-slate-400 border border-emerald-900/10 dark:text-slate-900 dark:bg-white dark:placeholder-slate-400 dark:border-white/20 rounded"
            placeholder="Type your message..."
            disabled={loading}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
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
    </div>
  );
}
