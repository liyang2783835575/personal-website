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

  const quickQuestions = [
    "你是做什么的？",
    "你的技术栈是什么？",
    "怎么联系你？",
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[40%_60%] h-[550px]">
      {/* Left Column — Profile Card */}
      <div className="overflow-y-auto p-4 border-r border-white/5 flex flex-col">
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">🤖</div>
          <h3 className="text-lg font-bold text-text-primary font-mono mb-1">
            Li Yang 的数字分身
          </h3>
          <p className="text-sm text-text-secondary font-mono">
            AI 驱动的个人助手，了解 Li Yang 的一切
          </p>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-6 justify-center">
          {["全栈工程师", "AI 爱好者", "开源贡献者", "创业者"].map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-1 rounded-full text-xs font-mono bg-neon-cyan/5 border border-neon-cyan/20 text-neon-cyan/80"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Divider */}
        <div className="neon-line mb-6" />

        {/* Quick Questions */}
        <div>
          <h4 className="text-xs font-mono text-text-secondary mb-3 uppercase tracking-wider">
            快捷问题
          </h4>
          <div className="space-y-2">
            {quickQuestions.map((q) => (
              <button
                key={q}
                onClick={() => {
                  setInput(q);
                }}
                disabled={loading}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-mono text-text-secondary bg-bg-card border border-white/5 hover:border-neon-cyan/20 hover:text-neon-cyan transition-all disabled:opacity-30"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Empty state hint (only when no messages) */}
        {messages.length === 0 && (
          <div className="mt-auto pt-6">
            <p className="text-[10px] text-text-muted text-center font-mono">
              点击上方问题或输入你的问题开始对话
            </p>
          </div>
        )}
      </div>

      {/* Right Column — Chat */}
      <div className="flex flex-col overflow-hidden p-4">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1">
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
    </div>
  );
}
