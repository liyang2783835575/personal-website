"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { listChatProviders, type ChatProvider } from "@/lib/chat-providers";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export default function ChatTool() {
  const providers = useMemo(() => listChatProviders(), []);
  const [selectedProviderId, setSelectedProviderId] = useState(providers[0]?.id ?? "minimax");
  const [selectedModel, setSelectedModel] = useState(providers[0]?.defaultModel ?? "");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const prevLengthRef = useRef(0);

  const currentProvider = useMemo(
    () => providers.find((p) => p.id === selectedProviderId) ?? providers[0],
    [providers, selectedProviderId],
  );

  const models = useMemo(() => currentProvider?.models ?? [], [currentProvider]);

  const handleProviderChange = useCallback(
    (providerId: string) => {
      const provider = providers.find((p) => p.id === providerId);
      if (provider) {
        setSelectedProviderId(providerId);
        setSelectedModel(provider.defaultModel);
      }
    },
    [providers],
  );

  useEffect(() => {
    if (messages.length !== prevLengthRef.current) {
      prevLengthRef.current = messages.length;
      const container = scrollContainerRef.current;
      if (container) {
        container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
      }
    }
  }, [messages]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMessage: Message = { id: crypto.randomUUID(), role: "user", content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

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
          provider: selectedProviderId,
          model: selectedModel,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        const errorMsg =
          res.status === 429
            ? "请求太频繁，请稍后再试。"
            : body?.error === "Service unavailable"
              ? "AI 服务未配置，请联系站长。"
              : `请求失败 (${res.status})`;
        throw new Error(errorMsg);
      }

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
            updated[lastIndex] = { ...updated[lastIndex], content: assistantContent };
          }
          return updated;
        });
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "抱歉，出了点问题，请稍后再试。";
      setMessages((prev) => {
        const lastIndex = prev.length - 1;
        if (lastIndex >= 0 && prev[lastIndex].id === assistantId && prev[lastIndex].content) {
          return [
            ...prev.slice(0, -1),
            { ...prev[lastIndex], content: prev[lastIndex].content + `\n\n[${errorMsg}]` },
          ];
        }
        return [...prev, { id: crypto.randomUUID(), role: "assistant", content: errorMsg }];
      });
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages, selectedProviderId, selectedModel]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickQuestions = ["你是做什么的？", "你的技术栈是什么？", "怎么联系你？"];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[40%_60%] h-[550px]">
      {/* Left Column */}
      <div className="overflow-y-auto p-4 border-r border-white/5 flex flex-col chat-scroll">
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

        {/* Provider + Model Selector */}
        <div className="mb-6 space-y-3">
          <div>
            <label className="block text-xs font-mono text-text-secondary mb-1.5 uppercase tracking-wider">
              模型提供商
            </label>
            <select
              value={selectedProviderId}
              onChange={(e) => handleProviderChange(e.target.value)}
              disabled={loading}
              className="w-full rounded-lg bg-bg-primary border border-white/10 px-3 py-2 text-sm text-text-primary focus:border-neon-cyan/50 focus:outline-none transition-all font-mono cursor-pointer appearance-none disabled:opacity-50"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%238888aa' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 12px center",
                paddingRight: "2rem",
              }}
            >
              {providers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.icon} {p.name}
                </option>
              ))}
            </select>
          </div>

          {models.length > 1 && (
            <div>
              <label className="block text-xs font-mono text-text-secondary mb-1.5 uppercase tracking-wider">
                模型
              </label>
              <div className="flex gap-1.5 flex-wrap">
                {models.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setSelectedModel(m.id)}
                    disabled={loading}
                    className={`px-2.5 py-1.5 rounded-lg text-[11px] border transition-all disabled:opacity-50 ${
                      selectedModel === m.id
                        ? "border-neon-cyan/60 bg-neon-cyan/10 text-neon-cyan"
                        : "border-white/10 text-text-secondary hover:border-white/20"
                    }`}
                    title={m.description}
                  >
                    {m.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="neon-line mb-6" />

        {/* Quick Questions */}
        <div className="mb-6">
          <h4 className="text-xs font-mono text-text-secondary mb-3 uppercase tracking-wider">
            快捷问题
          </h4>
          <div className="space-y-2">
            {quickQuestions.map((q) => (
              <button
                key={q}
                onClick={() => setInput(q)}
                disabled={loading}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-mono text-text-secondary bg-bg-card border border-white/5 hover:border-neon-cyan/20 hover:text-neon-cyan transition-all disabled:opacity-30"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {messages.length === 0 && (
          <div className="mt-auto">
            <p className="text-[10px] text-text-muted text-center font-mono">
              点击上方问题或输入你的问题开始对话
            </p>
          </div>
        )}
      </div>

      {/* Right Column — Chat */}
      <div className="flex flex-col overflow-hidden p-4">
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1 chat-scroll">
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
