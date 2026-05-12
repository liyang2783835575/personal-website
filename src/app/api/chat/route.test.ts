import { describe, it, expect, vi, beforeEach } from "vitest";

const mockStream = vi.fn();

vi.mock("@/lib/chat-providers", () => ({
  getChatProvider: vi.fn((id: string) => {
    if (id === "mimo" || id === "minimax") {
      return {
        id,
        name: id === "mimo" ? "MiMo" : "MiniMax",
        icon: id === "mimo" ? "🟠" : "🔵",
        models: [
          { id: "model-a", name: "Model A", description: "Test" },
          { id: "model-b", name: "Model B", description: "Test" },
        ],
        defaultModel: "model-a",
        stream: mockStream,
      };
    }
    return undefined;
  }),
  listChatProviders: vi.fn(() => [
    {
      id: "mimo",
      name: "MiMo",
      icon: "🟠",
      models: [{ id: "model-a", name: "Model A", description: "Test" }],
      defaultModel: "model-a",
      stream: vi.fn(),
    },
    {
      id: "minimax",
      name: "MiniMax",
      icon: "🔵",
      models: [{ id: "model-a", name: "Model A", description: "Test" }],
      defaultModel: "model-a",
      stream: vi.fn(),
    },
  ]),
}));

const { POST } = await import("./route");

function createRequest(body: unknown, origin?: string): Request {
  const headers = new Headers({ "Content-Type": "application/json" });
  if (origin) {
    headers.set("Origin", origin);
  }
  const req = new Request("http://localhost:3000/api/chat", {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  return req;
}

describe("POST /api/chat", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const encoder = new TextEncoder();
    mockStream.mockResolvedValue(
      new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode("Hello"));
          controller.close();
        },
      }),
    );
  });

  it("rejects non-JSON body", async () => {
    const req = new Request("http://localhost:3000/api/chat", {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: "not json",
    });
    const res = await POST(req as unknown as never);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("Invalid JSON");
  });

  it("rejects empty messages array", async () => {
    const req = createRequest({ messages: [] });
    const res = await POST(req as unknown as never);
    expect(res.status).toBe(400);
  });

  it("rejects cross-origin requests", async () => {
    const req = createRequest(
      { messages: [{ role: "user", content: "hi" }] },
      "https://evil.example.com",
    );
    const res = await POST(req as unknown as never);
    expect(res.status).toBe(403);
  });

  it("uses default provider (minimax) when not specified", async () => {
    const req = createRequest({ messages: [{ role: "user", content: "hi" }] });
    const res = await POST(req as unknown as never);
    expect(res.status).toBe(200);
    expect(mockStream).toHaveBeenCalledWith(
      [{ role: "user", content: "hi" }],
      "model-a",
      expect.any(String),
    );
  });

  it("uses specified provider", async () => {
    const req = createRequest({
      messages: [{ role: "user", content: "hi" }],
      provider: "mimo",
    });
    const res = await POST(req as unknown as never);
    expect(res.status).toBe(200);
  });

  it("uses specified model", async () => {
    const req = createRequest({
      messages: [{ role: "user", content: "hi" }],
      provider: "mimo",
      model: "model-b",
    });
    await POST(req as unknown as never);
    expect(mockStream).toHaveBeenCalledWith(
      expect.any(Array),
      "model-b",
      expect.any(String),
    );
  });

  it("returns 503 when provider key is missing", async () => {
    mockStream.mockRejectedValue(new Error("MIMO_API_KEY not configured"));
    const req = createRequest({
      messages: [{ role: "user", content: "hi" }],
      provider: "mimo",
    });
    const res = await POST(req as unknown as never);
    expect(res.status).toBe(503);
  });

  it("returns 500 on provider error", async () => {
    mockStream.mockRejectedValue(new Error("API down"));
    const req = createRequest({ messages: [{ role: "user", content: "hi" }] });
    const res = await POST(req as unknown as never);
    expect(res.status).toBe(500);
  });

  it("streams response body", async () => {
    const req = createRequest({ messages: [{ role: "user", content: "hi" }] });
    const res = await POST(req as unknown as never);
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toContain("text/plain");
    const text = await res.text();
    expect(text).toBe("Hello");
  });
});
