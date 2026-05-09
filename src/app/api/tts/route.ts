import { NextRequest } from "next/server";
import { z } from "zod";
import { getProvider, PROVIDER_IDS } from "@/lib/tts-providers";
import { TTS_AUDIO_FORMATS } from "@/lib/tts-providers/types";

export const runtime = "edge";

const requestSchema = z.object({
  provider: z.enum(PROVIDER_IDS).default("mimo"),
  model: z.string().optional(),
  text: z.string().min(1).max(2000),
  voice: z.string().optional(),
  voiceData: z.string().max(7_000_000).optional(), // base64 audio for voiceclone (~5MB)
  style: z.string().max(2000).optional(),
  format: z.enum(TTS_AUDIO_FORMATS).default("mp3"),
  speed: z.number().min(0.5).max(2).optional(),
  pitch: z.number().min(-12).max(12).optional(),
  volume: z.number().min(0.1).max(10).optional(),
});

export async function POST(req: NextRequest) {
  // CORS: same-origin only
  const origin = req.headers.get("origin");
  if (origin) {
    const allowedOrigin = req.nextUrl.origin;
    if (origin !== allowedOrigin) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  // Input validation
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const parseResult = requestSchema.safeParse(body);
  if (!parseResult.success) {
    return new Response(
      JSON.stringify({ error: "Invalid request", details: parseResult.error.issues }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const { provider: providerId, model, text, voice, voiceData, style, format, speed, pitch, volume } = parseResult.data;

  const provider = getProvider(providerId);
  if (!provider) {
    return new Response(JSON.stringify({ error: `Unknown provider: ${providerId}` }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const result = await provider.generate({
      text,
      voice: voice ?? provider.defaultVoiceId,
      voiceData,
      format,
      model: model || provider.defaultModel,
      style,
      speed,
      pitch,
      volume,
    });

    return new Response(
      JSON.stringify({ audio: result.audioBase64, format: result.format }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("[TTS API] Error:", message);

    // Return generic error to client — never leak upstream API error bodies
    const status = message.includes("not configured") ? 503 : 502;
    const clientMessage = message.includes("not configured")
      ? "Service temporarily unavailable"
      : "Speech synthesis failed";
    return new Response(JSON.stringify({ error: clientMessage }), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  }
}
