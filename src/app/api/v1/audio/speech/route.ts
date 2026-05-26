/**
 * OpenAI-compatible TTS proxy → MiMo V2.5 TTS
 *
 * Accepts POST /api/v1/audio/speech (OpenAI TTS protocol)
 * Translates to MiMo /v1/chat/completions and returns raw audio bytes.
 *
 * Self-contained — no project imports, zero intrusion.
 * Will be migrated to a standalone service later.
 */

export const runtime = "edge";

// ── Hardcoded config ────────────────────────────────────────────────
const MIMO_API_URL = "https://token-plan-cn.xiaomimimo.com/v1/chat/completions";
const MIMO_API_KEY = "tp-cssd6u3dff2co5yjh6mrmxz0dds6zguxaxnmm1hflw32r8sl";

// ── Voice mapping: OpenAI → MiMo ───────────────────────────────────
const VOICE_MAP: Record<string, string> = {
  alloy: "冰糖",
  echo: "苏打",
  fable: "茉莉",
  onyx: "白桦",
  nova: "Mia",
  shimmer: "Chloe",
};

// Known MiMo voice IDs — pass through directly
const MIMO_VOICES = new Set([
  "mimo_default",
  "冰糖",
  "茉莉",
  "苏打",
  "白桦",
  "Mia",
  "Chloe",
  "Milo",
  "Dean",
]);

function resolveVoice(voice: string | undefined): string {
  if (!voice) return "mimo_default";
  if (MIMO_VOICES.has(voice)) return voice;
  return VOICE_MAP[voice] ?? "mimo_default";
}

// ── Speed → natural language instruction ────────────────────────────
function speedToInstruction(speed: number | undefined): string | null {
  if (speed == null || speed === 1) return null;
  if (speed < 0.8) return "请用非常慢的语速朗读";
  if (speed < 1) return "请用稍慢的语速朗读";
  if (speed <= 1.2) return "请用稍快的语速朗读";
  if (speed <= 1.5) return "请用较快的语速朗读";
  return "请用非常快的语速朗读";
}

// ── Request handler ─────────────────────────────────────────────────
export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const input = typeof body.input === "string" ? body.input.trim() : "";
  if (!input) {
    return new Response(JSON.stringify({ error: "Missing 'input' field" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const voice = resolveVoice(body.voice as string | undefined);
  const speedInstruction = speedToInstruction(body.speed as number | undefined);

  // Build MiMo messages
  const messages: Array<{ role: string; content: string }> = [];

  // Style/speed instructions in user message
  const userContent = [speedInstruction].filter(Boolean).join("；");
  if (userContent) {
    messages.push({ role: "user", content: userContent });
  }

  // Target text in assistant message
  messages.push({ role: "assistant", content: input });

  const mimoBody = {
    model: "mimo-v2.5-tts",
    messages,
    audio: {
      format: "wav",
      voice,
    },
  };

  try {
    const upstream = await fetch(MIMO_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": MIMO_API_KEY,
      },
      body: JSON.stringify(mimoBody),
    });

    if (!upstream.ok) {
      const text = await upstream.text();
      console.error("[Tavo TTS Proxy] MiMo error:", upstream.status, text);
      return new Response(
        JSON.stringify({ error: "Upstream TTS service error" }),
        { status: 502, headers: { "Content-Type": "application/json" } }
      );
    }

    const data = await upstream.json();
    const audioBase64: string | undefined =
      data.choices?.[0]?.message?.audio?.data;

    if (!audioBase64) {
      console.error("[Tavo TTS Proxy] No audio data in MiMo response");
      return new Response(
        JSON.stringify({ error: "No audio generated" }),
        { status: 502, headers: { "Content-Type": "application/json" } }
      );
    }

    // Decode Base64 → raw bytes
    const binary = atob(audioBase64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }

    return new Response(bytes, {
      headers: {
        "Content-Type": "audio/wav",
        "Content-Length": String(bytes.length),
      },
    });
  } catch (err) {
    console.error("[Tavo TTS Proxy] Fetch error:", err);
    return new Response(
      JSON.stringify({ error: "TTS proxy internal error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
