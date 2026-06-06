"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { listChatProviders } from "@/lib/chat-providers";
import { AlertTriangle } from "@/components/icons";
import ProviderModelPicker from "./ProviderModelPicker";

interface Message {
  id: string;
  role: "user" | "assistant" | "error";
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
        // If the last message is an empty assistant placeholder, replace it with an error bubble
        if (
          lastIndex >= 0 &&
          prev[lastIndex].id === assistantId &&
          !prev[lastIndex].content
        ) {
          return [
            ...prev.slice(0, -1),
            { id: crypto.randomUUID(), role: "error", content: errorMsg } as Message,
          ];
        }
        return [
          ...prev,
          { id: crypto.randomUUID(), role: "error", content: errorMsg } as Message,
        ];
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
    <div className="grid grid-cols-1 lg:grid-cols-[40%_60%] min-h-[60dvh] md:h-[550px]">
      {/* Left Column */}
      <div className="overflow-y-auto p-4 border-r border-white/5 flex flex-col chat-scroll">
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">🤖</div>
          <h3 className="text-lg font-bold text-text-primary font-mono mb-1">
            Li Yang 的数字分身
          </h3>
          <p className="text-sm text-text-secondary">
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
        <div className="mb-6">
          <ProviderModelPicker
            providers={providers}
            selectedProviderId={selectedProviderId}
            onProviderChange={handleProviderChange}
            models={models}
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
            providerLabel="模型提供商"
            modelLabel="模型"
            showProviderIcon
            disabled={loading}
          />
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
            <p className="text-[10px] text-text-muted text-center">
              点击上方问题或输入你的问题开始对话
            </p>
          </div>
        )}
      </div>

      {/* Right Column — Chat */}
      <div className="flex flex-col overflow-hidden p-4">
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1 chat-scroll">
          {messages.map((msg) => {
            const isUser = msg.role === "user";
            const isError = msg.role === "error";
            return (
              <div
                key={msg.id}
                className={`flex ${isUser ? "justify-end" : "justify-start"}`}
              >
                <div
                  role={isError ? "alert" : undefined}
                  className={`max-w-[85%] rounded-xl px-4 py-2.5 text-sm leading-relaxed flex items-start gap-2 ${
                    isUser
                      ? "bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/20"
                      : isError
                        ? "bg-neon-magenta/10 text-neon-magenta border border-neon-magenta/40"
                        : "bg-bg-card text-text-primary border border-white/5"
                  }`}
                >
                  {isError && (
                    <AlertTriangle
                      width={16}
                      height={16}
                      className="shrink-0 mt-0.5"
                    />
                  )}
                  {msg.content || (
                    <span className="inline-flex gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-neon-cyan animate-bounce" />
                      <span className="w-1.5 h-1.5 rounded-full bg-neon-cyan animate-bounce [animation-delay:0.1s]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-neon-cyan animate-bounce [animation-delay:0.2s]" />
                    </span>
                  )}
                  {isError && (
                    <button
                      type="button"
                      onClick={() => {
                        // Re-send the last user message
                        const lastUser = [...messages].reverse().find((m) => m.role === "user");
                        if (lastUser) setInput(lastUser.content);
                      }}
                      className="ml-1 text-xs font-mono underline underline-offset-2 hover:opacity-80"
                    >
                      重试
                    </button>
                  )}
                </div>
              </div>
            );
          })}

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
