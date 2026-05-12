import type { ChatProvider, ChatMessage } from "./types";
import { parseSSEStream } from "./mimo";

const MINIMAX_BASE = "https://api.minimaxi.com/v1/chat/completions";

const MINIMAX_MODELS = [
  { id: "MiniMax-M2.7", name: "MiniMax M2.7", description: "最新旗舰" },
  { id: "MiniMax-M2.5", name: "MiniMax M2.5", description: "均衡性能" },
];

async function stream(
  messages: ChatMessage[],
  model: string,
  systemPrompt: string,
): Promise<ReadableStream<string>> {
  const apiKey = process.env.MINIMAX_API_KEY;
  if (!apiKey) {
    throw new Error("MINIMAX_API_KEY not configured");
  }

  const body = {
    model,
    messages: [
      { role: "system", content: systemPrompt },
      ...messages,
    ],
    stream: true,
  };

  const res = await fetch(MINIMAX_BASE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`MiniMax API error: ${res.status} - ${text}`);
  }

  if (!res.body) {
    throw new Error("MiniMax returned no body");
  }

  return parseSSEStream(res.body);
}

export const minimaxChatProvider: ChatProvider = {
  id: "minimax",
  name: "MiniMax",
  icon: "🔵",
  models: MINIMAX_MODELS,
  defaultModel: "MiniMax-M2.5",
  stream,
};
