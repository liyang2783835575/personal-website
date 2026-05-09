import type { TtsProvider, TtsRequest, TtsResponse } from "./types";

const MIMO_BASE = "https://token-plan-cn.xiaomimimo.com/v1/chat/completions";

const MIMO_VOICES = [
  { id: "mimo_default", name: "MiMo 默认", lang: "自动", gender: "", demoText: "你好，我是 MiMo 默认音色。" },
  { id: "冰糖", name: "冰糖", lang: "中文", gender: "女", demoText: "你好呀，我是冰糖，一个温柔的女声。" },
  { id: "茉莉", name: "茉莉", lang: "中文", gender: "女", demoText: "嗨，我是茉莉，很高兴认识你。" },
  { id: "苏打", name: "苏打", lang: "中文", gender: "男", demoText: "你好，我是苏打，一个清爽的男声。" },
  { id: "白桦", name: "白桦", lang: "中文", gender: "男", demoText: "你好，我是白桦，一个沉稳的男声。" },
  { id: "Mia", name: "Mia", lang: "英文", gender: "女", demoText: "Hello, I'm Mia. Nice to meet you!" },
  { id: "Chloe", name: "Chloe", lang: "英文", gender: "女", demoText: "Hi there, I'm Chloe. How are you today?" },
  { id: "Milo", name: "Milo", lang: "英文", gender: "男", demoText: "Hey, I'm Milo. Glad to be here." },
  { id: "Dean", name: "Dean", lang: "英文", gender: "男", demoText: "Hello, I'm Dean. Let's get started." },
];

const MIMO_MODELS = [
  { id: "mimo-v2.5-tts", name: "MiMo TTS v2.5", description: "标准语音合成" },
  { id: "mimo-v2.5-tts-voicedesign", name: "音色设计", description: "通过文本描述生成新音色" },
  { id: "mimo-v2.5-tts-voiceclone", name: "音色复刻", description: "通过音频样本复刻音色" },
];

async function generate(req: TtsRequest): Promise<TtsResponse> {
  const apiKey = process.env.MIMO_API_KEY;
  if (!apiKey) {
    throw new Error("MIMO_API_KEY not configured");
  }

  const messages: Array<{ role: string; content: string }> = [];

  // Style control via natural language in user message
  if (req.style && req.style.trim()) {
    messages.push({ role: "user", content: req.style.trim() });
  }

  // TTS text in assistant message
  messages.push({ role: "assistant", content: req.text });

  const body: Record<string, unknown> = {
    model: req.model,
    messages,
    audio: {
      format: req.format,
      voice: req.voiceData || req.voice,
    },
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25000);
  try {
    const res = await fetch(MIMO_BASE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!res.ok) {
      const upstreamBody = await res.text();
      const err = new Error(`MiMo API error: ${res.status}`) as Error & { upstreamBody?: string };
      err.upstreamBody = upstreamBody;
      throw err;
    }

  const data = await res.json();
  const audioContent = data.choices?.[0]?.message?.audio?.data;
  if (!audioContent) {
    throw new Error("MiMo returned no audio data");
  }

  return { audioBase64: audioContent, format: req.format };
  } finally {
    clearTimeout(timeout);
  }
}

export const mimoProvider: TtsProvider = {
  id: "mimo",
  name: "MiMo",
  models: MIMO_MODELS,
  defaultModel: "mimo-v2.5-tts",
  defaultVoiceId: "冰糖",
  voices: MIMO_VOICES,
  generate,
};
