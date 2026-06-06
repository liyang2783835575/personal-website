import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the provider module
const mockGenerate = vi.fn();
vi.mock("@/lib/tts-providers/types", () => ({
  TTS_AUDIO_FORMATS: ["mp3", "wav", "pcm16"] as const,
}));

vi.mock("@/lib/tts-providers", () => ({
  PROVIDER_IDS: ["mimo", "minimax"] as const,
  getProvider: vi.fn((id: string) => {
    if (id === "mimo" || id === "minimax") {
      return {
        id,
        name: id === "mimo" ? "MiMo" : "MiniMax",
        models: [{ id: "test-model", name: "Test Model", description: "Test" }],
        defaultModel: "test-model",
        defaultVoiceId: "voice-1",
        voices: [],
        generate: mockGenerate,
      };
    }
    return undefined;
  }),
  listProviders: vi.fn(() => []),
  mimoProvider: {} as unknown as never,
  minimaxProvider: {} as unknown as never,
}));

const { POST } = await import("./route");

function createRequest(body: unknown, origin: string = "http://localhost:3000"): Request {
  const headers = new Headers({ "Content-Type": "application/json" });
  if (origin) {
    headers.set("Origin", origin);
  }
  const req = new Request("http://localhost:3000/api/tts", {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  // Mock nextUrl for Next.js Edge Runtime
  Object.defineProperty(req, "nextUrl", {
    value: { origin: "http://localhost:3000" },
    writable: true,
  });
  return req;
}

describe("POST /api/tts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGenerate.mockResolvedValue({ audioBase64: "dGVzdA==", format: "mp3" });
  });

  it("rejects non-JSON body", async () => {
    const req = new Request("http://localhost:3000/api/tts", {
      method: "POST",
      headers: {
        "Content-Type": "text/plain",
        Origin: "http://localhost:3000",
      },
      body: "not json",
    });
    Object.defineProperty(req, "nextUrl", {
      value: { origin: "http://localhost:3000" },
      writable: true,
    });
    const res = await POST(req as unknown as never);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("Invalid JSON");
  });

  it("rejects empty text", async () => {
    const req = createRequest({ text: "", voice: "test" });
    const res = await POST(req as unknown as never);
    expect(res.status).toBe(400);
  });

  it("rejects cross-origin requests", async () => {
    const req = createRequest({ text: "hello" }, "https://evil.example.com");
    const res = await POST(req as unknown as never);
    expect(res.status).toBe(403);
    const data = await res.json();
    expect(data.error).toContain("Forbidden");
  });

  it("rejects requests with no Origin header", async () => {
    const headers = new Headers({ "Content-Type": "application/json" });
    // No Origin set — simulates curl / server-to-server / non-browser caller
    const req = new Request("http://localhost:3000/api/tts", {
      method: "POST",
      headers,
      body: JSON.stringify({ text: "hello", voice: "test" }),
    });
    Object.defineProperty(req, "nextUrl", {
      value: { origin: "http://localhost:3000" },
      writable: true,
    });
    const res = await POST(req as unknown as never);
    expect(res.status).toBe(403);
    const data = await res.json();
    expect(data.error).toContain("Forbidden");
  });

  it("allows optional voice (for voice design mode)", async () => {
    const req = createRequest({ text: "hello" });
    const res = await POST(req as unknown as never);
    expect(res.status).toBe(200);
    // Provider's defaultVoiceId used as fallback
    expect(mockGenerate).toHaveBeenCalledWith(
      expect.objectContaining({ voice: "voice-1" })
    );
  });

  it("passes voiceData for voice clone", async () => {
    const req = createRequest({
      text: "hello",
      voiceData: "base64audiodata",
    });
    const res = await POST(req as unknown as never);
    expect(res.status).toBe(200);
    expect(mockGenerate).toHaveBeenCalledWith(
      expect.objectContaining({ voiceData: "base64audiodata" })
    );
  });

  it("rejects invalid provider", async () => {
    const req = createRequest({ provider: "unknown", text: "hello", voice: "test" });
    const res = await POST(req as unknown as never);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("Invalid request");
  });

  it("routes to mimo provider", async () => {
    const req = createRequest({ text: "hello", voice: "冰糖" });
    const res = await POST(req as unknown as never);

    expect(res.status).toBe(200);
    expect(mockGenerate).toHaveBeenCalledWith(
      expect.objectContaining({
        text: "hello",
        voice: "冰糖",
        format: "mp3",
        model: "test-model",
      })
    );

    const data = await res.json();
    expect(data.audio).toBe("dGVzdA==");
    expect(data.format).toBe("mp3");
  });

  it("routes to minimax provider", async () => {
    const req = createRequest({ provider: "minimax", text: "hello", voice: "male-qn-qingse", model: "speech-2.8-hd" });
    const res = await POST(req as unknown as never);

    expect(res.status).toBe(200);
    expect(mockGenerate).toHaveBeenCalledWith(
      expect.objectContaining({
        text: "hello",
        voice: "male-qn-qingse",
        model: "speech-2.8-hd",
      })
    );
  });

  it("returns 503 when provider throws not-configured error", async () => {
    mockGenerate.mockRejectedValueOnce(new Error("MINIMAX_API_KEY not configured"));
    const req = createRequest({ provider: "minimax", text: "hello", voice: "test" });
    const res = await POST(req as unknown as never);
    expect(res.status).toBe(503);
    const data = await res.json();
    // Must not leak upstream error details
    expect(data.error).not.toContain("MINIMAX_API_KEY");
    expect(data.error).toBe("Service temporarily unavailable");
  });

  it("returns 502 on provider API error", async () => {
    mockGenerate.mockRejectedValueOnce(new Error("MiMo API error: 500 Internal Server Error"));
    const req = createRequest({ text: "hello", voice: "test" });
    const res = await POST(req as unknown as never);
    expect(res.status).toBe(502);
    const data = await res.json();
    // Must not leak upstream error body
    expect(data.error).not.toContain("MiMo API error");
    expect(data.error).not.toContain("Internal Server Error");
    expect(data.error).toBe("Speech synthesis failed");
  });

  it("passes optional parameters to provider", async () => {
    const req = createRequest({
      text: "hello",
      voice: "test",
      style: "happy",
      format: "wav",
      speed: 1.5,
      pitch: 2,
      volume: 0.5,
    });
    const res = await POST(req as unknown as never);

    expect(res.status).toBe(200);
    expect(mockGenerate).toHaveBeenCalledWith(
      expect.objectContaining({
        style: "happy",
        format: "wav",
        speed: 1.5,
        pitch: 2,
        volume: 0.5,
      })
    );
  });

  it("rejects text exceeding 2000 characters", async () => {
    const req = createRequest({ text: "a".repeat(2001), voice: "test" });
    const res = await POST(req as unknown as never);
    expect(res.status).toBe(400);
  });

  it("accepts text at exactly 2000 characters", async () => {
    const req = createRequest({ text: "a".repeat(2000), voice: "test" });
    const res = await POST(req as unknown as never);
    expect(res.status).toBe(200);
  });

  it("rejects voiceData exceeding 7_000_000 characters", async () => {
    const req = createRequest({ text: "hello", voiceData: "a".repeat(7_000_001) });
    const res = await POST(req as unknown as never);
    expect(res.status).toBe(400);
  });

  it("rejects style exceeding 2000 characters", async () => {
    const req = createRequest({ text: "hello", style: "a".repeat(2001) });
    const res = await POST(req as unknown as never);
    expect(res.status).toBe(400);
  });

  it("accepts speed at boundary 0.5", async () => {
    const req = createRequest({ text: "hello", voice: "test", speed: 0.5 });
    const res = await POST(req as unknown as never);
    expect(res.status).toBe(200);
  });

  it("rejects speed below 0.5", async () => {
    const req = createRequest({ text: "hello", voice: "test", speed: 0.49 });
    const res = await POST(req as unknown as never);
    expect(res.status).toBe(400);
  });

  it("rejects invalid format enum value", async () => {
    const req = createRequest({ text: "hello", voice: "test", format: "ogg" });
    const res = await POST(req as unknown as never);
    expect(res.status).toBe(400);
  });
});
