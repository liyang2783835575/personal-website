import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { resume } from "@/data/resume";
import { z } from "zod";

export const runtime = "edge";

// Zod schema for message validation
const messageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(4000),
});

const requestSchema = z.object({
  messages: z
    .array(messageSchema)
    .min(1)
    .max(20),
});

// In-memory rate limiting: 10 requests/minute per IP
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60 * 1000;

function getClientIP(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return req.headers.get("x-real-ip") ?? "unknown";
}

function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now >= entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return { allowed: true, remaining: RATE_LIMIT - 1, resetIn: RATE_WINDOW_MS };
  }

  if (entry.count >= RATE_LIMIT) {
    return { allowed: false, remaining: 0, resetIn: entry.resetAt - now };
  }

  entry.count++;
  return { allowed: true, remaining: RATE_LIMIT - entry.count, resetIn: entry.resetAt - now };
}

const SYSTEM_PROMPT = `你是 ${resume.name} 的数字分身。你正在他的个人网站上与访客聊天。

关于 ${resume.name}：
- 身份：${resume.title}
- 简介：${resume.bio}
- 技能：${resume.skills.map((s) => `${s.name} (${s.level}%)`).join("、")}
- 项目经验：${resume.experience.map((e) => `${e.company} - ${e.role} (${e.period})`).join("；")}

你需要以第一人称回答问题，就像 ${resume.name} 本人在说话。
保持友好、专业、简洁。如果被问到简历中没有的信息，坦诚说不太确定。
用中文回答，除非用户用英文提问。`;

export async function POST(req: NextRequest) {
  // CORS: same-origin only
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  if (origin && origin !== `https://${host}` && origin !== `http://${host}`) {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Rate limiting
  const clientIP = getClientIP(req);
  const rateLimit = checkRateLimit(clientIP);
  const rateLimitHeaders = {
    "X-RateLimit-Limit": String(RATE_LIMIT),
    "X-RateLimit-Remaining": String(rateLimit.remaining),
    "X-RateLimit-Reset": String(Math.ceil(rateLimit.resetIn / 1000)),
  };

  if (!rateLimit.allowed) {
    return new Response(
      JSON.stringify({ error: "Too many requests. Please try again later." }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          ...rateLimitHeaders,
        },
      }
    );
  }

  // API key check
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("[Chat API] ANTHROPIC_API_KEY not configured");
    return new Response(JSON.stringify({ error: "Service unavailable" }), {
      status: 503,
      headers: { "Content-Type": "application/json", ...rateLimitHeaders },
    });
  }

  // Input validation
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...rateLimitHeaders },
    });
  }

  const parseResult = requestSchema.safeParse(body);
  if (!parseResult.success) {
    return new Response(
      JSON.stringify({ error: "Invalid request", details: parseResult.error.issues }),
      {
        status: 400,
        headers: { "Content-Type": "application/json", ...rateLimitHeaders },
      }
    );
  }

  const { messages } = parseResult.data;

  try {
    const client = new Anthropic({ apiKey });

    const stream = await client.messages.stream({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              controller.enqueue(encoder.encode(event.delta.text));
            }
          }
          controller.close();
        } catch (streamError) {
          console.error("[Chat API] Stream error:", streamError);
          controller.error(streamError);
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        ...rateLimitHeaders,
      },
    });
  } catch (error) {
    console.error("[Chat API] Error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...rateLimitHeaders },
    });
  }
}