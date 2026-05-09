import { describe, it, expect, vi, beforeEach } from "vitest";
import { mimoProvider } from "./mimo";

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("mimoProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.MIMO_API_KEY = "test-key";

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{ message: { audio: { data: "dGVzdA==" } } }],
      }),
    });
  });

  it("throws when MIMO_API_KEY is not configured", async () => {
    delete process.env.MIMO_API_KEY;
    await expect(
      mimoProvider.generate({ text: "hello", voice: "冰糖", format: "mp3", model: "mimo-v2.5-tts" })
    ).rejects.toThrow("MIMO_API_KEY not configured");
  });

  it("calls the correct API endpoint", async () => {
    await mimoProvider.generate({ text: "hello", voice: "冰糖", format: "mp3", model: "mimo-v2.5-tts" });
    const url = mockFetch.mock.calls[0][0];
    expect(url).toContain("token-plan-cn.xiaomimimo.com");
    expect(url).toContain("/v1/chat/completions");
  });

  it("sends api-key header", async () => {
    await mimoProvider.generate({ text: "hello", voice: "冰糖", format: "mp3", model: "mimo-v2.5-tts" });
    const headers = mockFetch.mock.calls[0][1]?.headers;
    expect(headers["api-key"]).toBe("test-key");
    expect(headers["Content-Type"]).toBe("application/json");
  });

  it("sends text in assistant message and voice in audio object", async () => {
    await mimoProvider.generate({ text: "hello world", voice: "冰糖", format: "wav", model: "mimo-v2.5-tts" });
    const body = JSON.parse(mockFetch.mock.calls[0][1]?.body as string);
    expect(body.model).toBe("mimo-v2.5-tts");
    expect(body.messages).toHaveLength(1);
    expect(body.messages[0]).toEqual({ role: "assistant", content: "hello world" });
    expect(body.audio.format).toBe("wav");
    expect(body.audio.voice).toBe("冰糖");
  });

  it("includes style as user message before assistant message", async () => {
    await mimoProvider.generate({
      text: "hello",
      voice: "冰糖",
      format: "mp3",
      model: "mimo-v2.5-tts",
      style: "speak slowly",
    });
    const body = JSON.parse(mockFetch.mock.calls[0][1]?.body as string);
    expect(body.messages).toHaveLength(2);
    expect(body.messages[0]).toEqual({ role: "user", content: "speak slowly" });
    expect(body.messages[1]).toEqual({ role: "assistant", content: "hello" });
  });

  it("uses voiceData as voice when provided (voice clone)", async () => {
    await mimoProvider.generate({
      text: "hello",
      voice: "冰糖",
      format: "mp3",
      model: "mimo-v2.5-tts-voiceclone",
      voiceData: "base64audiodata",
    });
    const body = JSON.parse(mockFetch.mock.calls[0][1]?.body as string);
    expect(body.audio.voice).toBe("base64audiodata");
  });

  it("returns audio base64 and format on success", async () => {
    const result = await mimoProvider.generate({
      text: "hello", voice: "冰糖", format: "mp3", model: "mimo-v2.5-tts",
    });
    expect(result.audioBase64).toBe("dGVzdA==");
    expect(result.format).toBe("mp3");
  });

  it("throws when upstream returns non-ok status", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      text: async () => "Internal Server Error",
    });
    await expect(
      mimoProvider.generate({ text: "hello", voice: "冰糖", format: "mp3", model: "mimo-v2.5-tts" })
    ).rejects.toThrow("MiMo API error: 500");
  });

  it("throws when response has no audio data", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ choices: [{ message: { audio: null } }] }),
    });
    await expect(
      mimoProvider.generate({ text: "hello", voice: "冰糖", format: "mp3", model: "mimo-v2.5-tts" })
    ).rejects.toThrow("no audio data");
  });

  it("throws when choices array is empty", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ choices: [] }),
    });
    await expect(
      mimoProvider.generate({ text: "hello", voice: "冰糖", format: "mp3", model: "mimo-v2.5-tts" })
    ).rejects.toThrow("no audio data");
  });
});
