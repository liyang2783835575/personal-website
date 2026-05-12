import type { ChatProvider, ChatMessage } from "./types";

const MIMO_BASE = "https://token-plan-cn.xiaomimimo.com/v1/chat/completions";

const MIMO_MODELS = [
  { id: "mimo-v2.5-pro", name: "MiMo v2.5 Pro", description: "旗舰推理模型" },
  { id: "mimo-v2-flash", name: "MiMo v2 Flash", description: "极速响应" },
];

async function stream(
  messages: ChatMessage[],
  model: string,
  systemPrompt: string,
): Promise<ReadableStream<string>> {
  const apiKey = process.env.MIMO_API_KEY;
  if (!apiKey) {
    throw new Error("MIMO_API_KEY not configured");
  }

  const body = {
    model,
    messages: [
      { role: "system", content: systemPrompt },
      ...messages,
    ],
    stream: true,
  };

  const res = await fetch(MIMO_BASE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": apiKey,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`MiMo API error: ${res.status} - ${text}`);
  }

  if (!res.body) {
    throw new Error("MiMo returned no body");
  }

  return parseSSEStream(res.body);
}

export function parseSSEStream(
  upstream: ReadableStream<Uint8Array>,
): ReadableStream<string> {
  const reader = upstream.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  return new ReadableStream<string>({
    async pull(controller) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          controller.close();
          return;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith("data: ")) continue;
          const data = trimmed.slice(6);
          if (data === "[DONE]") {
            controller.close();
            return;
          }
          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (typeof content === "string" && content) {
              controller.enqueue(content);
            }
          } catch {
            // skip malformed JSON lines
          }
        }
      }
    },
    cancel() {
      reader.cancel();
    },
  });
}

export const mimoChatProvider: ChatProvider = {
  id: "mimo",
  name: "MiMo",
  icon: "🟠",
  models: MIMO_MODELS,
  defaultModel: "mimo-v2.5-pro",
  stream,
};
