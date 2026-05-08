"use client";

import { useState, useCallback, useRef, useEffect } from "react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export default function ChatTool() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevLengthRef = useRef(0);

  useEffect(() => {
    if (messages.length !== prevLengthRef.current) {
      prevLengthRef.current = messages.length;
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMessage: Message = { id: crypto.randomUUID(), role: "user", content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    // Use ref to avoid stale closure in async operations
    const currentMessages = messages;
    const assistantId = crypto.randomUUID();

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...currentMessages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!res.ok) throw new Error("Chat request failed");

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No reader");

      const decoder = new TextDecoder();
      let assistantContent = "";

      setMessages((prev) => [...prev, { id: assistantId, role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        assistantContent += chunk;

        setMessages((prev) => {
          const updated = [...prev];
          const lastIndex = updated.length - 1;
          if (lastIndex >= 0 && updated[lastIndex].id === assistantId) {
            updated[lastIndex] = {
              ...updated[lastIndex],
              content: assistantContent,
            };
          }
          return updated;
        });
      }
    } catch {
      // Keep partial content if any was received, otherwise show error
      setMessages((prev) => {
        const lastIndex = prev.length - 1;
        if (lastIndex >= 0 && prev[lastIndex].id === assistantId && prev[lastIndex].content) {
          return [
            ...prev.slice(0, -1),
            {
              ...prev[lastIndex],
              content: prev[lastIndex].content + "\n\n[连接出现问题，请稍后再试]",
            },
          ];
        }
        return [
          ...prev,
          { id: crypto.randomUUID(), role: "assistant", content: "抱歉，出了点问题，请稍后再试。" },
        ];
      });
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-[500px]">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">🤖</div>
            <p className="text-sm text-text-muted font-mono">
              你好！我是 Li Yang 的数字分身。
              <br />
              你可以问我任何关于他的事情。
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-xl px-4 py-2.5 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/20"
                  : "bg-bg-card text-text-primary border border-white/5"
              }`}
            >
              {msg.content || (
                <span className="inline-flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-neon-cyan animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-neon-cyan animate-bounce [animation-delay:0.1s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-neon-cyan animate-bounce [animation-delay:0.2s]" />
                </span>
              )}
            </div>
          </div>
        ))}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="输入消息..."
          disabled={loading}
          aria-label="输入消息"
          className="flex-1 rounded-lg bg-bg-primary border border-white/10 px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-neon-cyan/50 focus:outline-none focus:shadow-[var(--glow-xs)] transition-all font-mono"
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim() || loading}
          className="px-4 py-2.5 rounded-lg bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/30 hover:bg-neon-cyan/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all font-mono text-sm"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
