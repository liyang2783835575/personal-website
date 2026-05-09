import { describe, it, expect, vi, beforeEach } from "vitest";
import { minimaxProvider } from "./minimax";

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("minimaxProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.MINIMAX_API_KEY = "test-minimax-key";

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        data: { audio: "dGVzdA==" },
      }),
    });
  });

  it("throws when MINIMAX_API_KEY is not configured", async () => {
    delete process.env.MINIMAX_API_KEY;
    await expect(
      minimaxProvider.generate({ text: "hello", voice: "male-qn-qingse", format: "mp3", model: "speech-2.8-hd" })
    ).rejects.toThrow("MINIMAX_API_KEY not configured");
  });

  it("calls the correct API endpoint", async () => {
    await minimaxProvider.generate({ text: "hello", voice: "male-qn-qingse", format: "mp3", model: "speech-2.8-hd" });
    const url = mockFetch.mock.calls[0][0];
    expect(url).toContain("api.minimaxi.com");
    expect(url).toContain("/v1/t2a_v2");
  });

  it("sends Authorization Bearer header", async () => {
    await minimaxProvider.generate({ text: "hello", voice: "male-qn-qingse", format: "mp3", model: "speech-2.8-hd" });
    const headers = mockFetch.mock.calls[0][1]?.headers;
    expect(headers["Authorization"]).toBe("Bearer test-minimax-key");
    expect(headers["Content-Type"]).toBe("application/json");
  });

  it("sends text, model, and voice_setting in request body", async () => {
    await minimaxProvider.generate({ text: "hello world", voice: "male-qn-qingse", format: "mp3", model: "speech-2.8-hd" });
    const body = JSON.parse(mockFetch.mock.calls[0][1]?.body as string);
    expect(body.model).toBe("speech-2.8-hd");
    expect(body.text).toBe("hello world");
    expect(body.voice_setting.voice_id).toBe("male-qn-qingse");
  });

  it("maps pcm16 format to pcm in audio_setting", async () => {
    await minimaxProvider.generate({ text: "hello", voice: "male-qn-qingse", format: "pcm16", model: "speech-2.8-hd" });
    const body = JSON.parse(mockFetch.mock.calls[0][1]?.body as string);
    expect(body.audio_setting.format).toBe("pcm");
  });

  it("passes wav format unchanged", async () => {
    await minimaxProvider.generate({ text: "hello", voice: "male-qn-qingse", format: "wav", model: "speech-2.8-hd" });
    const body = JSON.parse(mockFetch.mock.calls[0][1]?.body as string);
    expect(body.audio_setting.format).toBe("wav");
  });

  it("includes speed, vol, pitch when provided", async () => {
    await minimaxProvider.generate({
      text: "hello", voice: "male-qn-qingse", format: "mp3", model: "speech-2.8-hd",
      speed: 1.5, volume: 0.5, pitch: 2,
    });
    const body = JSON.parse(mockFetch.mock.calls[0][1]?.body as string);
    expect(body.voice_setting.speed).toBe(1.5);
    expect(body.voice_setting.vol).toBe(0.5);
    expect(body.voice_setting.pitch).toBe(2);
  });

  it("uses style as emotion parameter", async () => {
    await minimaxProvider.generate({
      text: "hello", voice: "male-qn-qingse", format: "mp3", model: "speech-2.8-hd",
      style: "happy",
    });
    const body = JSON.parse(mockFetch.mock.calls[0][1]?.body as string);
    expect(body.voice_setting.emotion).toBe("happy");
  });

  it("returns audio base64 and format on success", async () => {
    const result = await minimaxProvider.generate({
      text: "hello", voice: "male-qn-qingse", format: "mp3", model: "speech-2.8-hd",
    });
    expect(result.audioBase64).toBe("dGVzdA==");
    expect(result.format).toBe("mp3");
  });

  it("throws when upstream returns non-ok status", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      text: async () => "Bad Request",
    });
    await expect(
      minimaxProvider.generate({ text: "hello", voice: "male-qn-qingse", format: "mp3", model: "speech-2.8-hd" })
    ).rejects.toThrow("MiniMax API error: 400");
  });

  it("throws when response has no audio data", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: null }),
    });
    await expect(
      minimaxProvider.generate({ text: "hello", voice: "male-qn-qingse", format: "mp3", model: "speech-2.8-hd" })
    ).rejects.toThrow("no audio data");
  });

  it("uses default voice_setting values when speed/vol/pitch not provided", async () => {
    await minimaxProvider.generate({ text: "hello", voice: "male-qn-qingse", format: "mp3", model: "speech-2.8-hd" });
    const body = JSON.parse(mockFetch.mock.calls[0][1]?.body as string);
    expect(body.voice_setting.speed).toBe(1);
    expect(body.voice_setting.vol).toBe(1);
    expect(body.voice_setting.pitch).toBe(0);
  });
});
