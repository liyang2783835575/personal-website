import type { TtsProvider, TtsRequest, TtsResponse, TtsAudioFormat } from "./types";

const MINIMAX_BASE = "https://api.minimaxi.com/v1/t2a_v2";

const MINIMAX_VOICES = [
  { id: "male-qn-qingse", name: "青涩", lang: "中文", gender: "男", demoText: "你好，我是青涩，一个阳光的男声。" },
  { id: "female-shaonv", name: "少女", lang: "中文", gender: "女", demoText: "嗨，我是一个活泼的少女音色。" },
  { id: "cute_boy", name: "可爱男童", lang: "中文", gender: "男", demoText: "你好呀，我是可爱男孩！" },
  { id: "Charming_Lady", name: "魅力女士", lang: "中文", gender: "女", demoText: "你好，我是魅力女士，很高兴认识你。" },
  { id: "Chinese (Mandarin)_Gentleman", name: "温润男声", lang: "中文", gender: "男", demoText: "你好，我是温润男声，声音温和而有磁性。" },
  { id: "Chinese (Mandarin)_Warm_Bestie", name: "温暖闺蜜", lang: "中文", gender: "女", demoText: "嗨，我是你的温暖闺蜜，今天有什么想聊的？" },
  { id: "Chinese (Mandarin)_Radio_Host", name: "电台男主播", lang: "中文", gender: "男", demoText: "各位听众朋友们大家好，欢迎收听今天的节目。" },
  { id: "Chinese (Mandarin)_Sweet_Lady", name: "甜美女声", lang: "中文", gender: "女", demoText: "你好呀，我是甜美女声，很高兴为你服务。" },
  { id: "Chinese (Mandarin)_Gentle_Senior", name: "温柔学姐", lang: "中文", gender: "女", demoText: "你好，我是温柔学姐，有什么我可以帮你的吗？" },
  { id: "Chinese (Mandarin)_Crisp_Girl", name: "清脆少女", lang: "中文", gender: "女", demoText: "嗨！我是清脆少女，声音清澈明亮。" },
  { id: "Chinese (Mandarin)_Lyrical_Voice", name: "抒情男声", lang: "中文", gender: "男", demoText: "你好，我是抒情男声，适合娓娓道来的讲述。" },
  { id: "Chinese (Mandarin)_Reliable_Executive", name: "沉稳高管", lang: "中文", gender: "男", demoText: "你好，我是沉稳高管，声音沉稳而专业。" },
];

const MINIMAX_MODELS = [
  { id: "speech-2.8-hd", name: "Speech 2.8 HD", description: "最新高质量语音合成" },
  { id: "speech-02-hd", name: "Speech 02 HD", description: "高清语音合成" },
  { id: "speech-02-turbo", name: "Speech 02 Turbo", description: "快速语音合成" },
  { id: "speech-01-hd", name: "Speech 01 HD", description: "高清语音合成 v1" },
  { id: "speech-01-turbo", name: "Speech 01 Turbo", description: "快速语音合成 v1" },
];

const FORMAT_MAP: Record<TtsAudioFormat, string> = {
  mp3: "mp3",
  wav: "wav",
  pcm16: "pcm",
};

async function generate(req: TtsRequest): Promise<TtsResponse> {
  const apiKey = process.env.MINIMAX_API_KEY;
  if (!apiKey) {
    throw new Error("MINIMAX_API_KEY not configured");
  }

  const voiceSetting: Record<string, unknown> = {
    voice_id: req.voice,
    speed: req.speed ?? 1,
    vol: req.volume ?? 1,
    pitch: req.pitch ?? 0,
  };

  if (req.style && req.style.trim()) {
    voiceSetting.emotion = req.style.trim();
  }

  const audioFormat = FORMAT_MAP[req.format] || "mp3";

  const body = {
    model: req.model,
    text: req.text,
    voice_setting: voiceSetting,
    audio_setting: {
      format: audioFormat,
      sample_rate: 32000,
      bitrate: 128000,
      channel: 1,
    },
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25000);
  try {
    const res = await fetch(MINIMAX_BASE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!res.ok) {
      const upstreamBody = await res.text();
      const err = new Error(`MiniMax API error: ${res.status}`) as Error & { upstreamBody?: string };
      err.upstreamBody = upstreamBody;
      throw err;
    }

  const data = await res.json();

  // MiniMax returns audio in data.audio or data.extra_info.audio
  const audioContent =
    data.data?.audio ||
    data.audio ||
    data.data?.extra_info?.audio;
  if (!audioContent) {
    throw new Error("MiniMax returned no audio data");
  }

  // MiniMax returns hex-encoded audio by default - convert to binary then base64
  let audioBase64: string;
  if (/^[0-9a-fA-F]+$/.test(audioContent) && audioContent.length > 100) {
    const bytes = new Uint8Array(audioContent.length / 2);
    for (let i = 0; i < audioContent.length; i += 2) {
      bytes[i / 2] = parseInt(audioContent.substring(i, i + 2), 16);
    }
    let binary = "";
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    audioBase64 = btoa(binary);
  } else {
    audioBase64 = audioContent;
  }

  const actualFormat = data.extra_info?.audio_format || audioFormat;

  return { audioBase64, format: actualFormat };
  } finally {
    clearTimeout(timeout);
  }
}

export const minimaxProvider: TtsProvider = {
  id: "minimax",
  name: "MiniMax",
  models: MINIMAX_MODELS,
  defaultModel: "speech-2.8-hd",
  defaultVoiceId: "male-qn-qingse",
  voices: MINIMAX_VOICES,
  generate,
};
