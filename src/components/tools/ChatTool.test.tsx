import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ChatTool from "./ChatTool";

// Mock chat providers
const mockProviders = vi.hoisted(() => {
  const minimax = {
    id: "minimax",
    name: "MiniMax",
    icon: "🤖",
    models: [
      { id: "abab6.5-chat", name: "ABAB 6.5", description: "标准对话" },
      { id: "abab6.5s-chat", name: "ABAB 6.5s", description: "快速对话" },
    ],
    defaultModel: "abab6.5-chat",
  };

  const mimo = {
    id: "mimo",
    name: "MiMo",
    icon: "🧠",
    models: [
      { id: "mimo-7b-chat", name: "MiMo 7B", description: "MiMo 对话" },
      { id: "mimo-13b-chat", name: "MiMo 13B", description: "MiMo Plus" },
    ],
    defaultModel: "mimo-7b-chat",
  };

  return { minimax, mimo };
});

vi.mock("@/lib/chat-providers", () => ({
  listChatProviders: vi.fn(() => [mockProviders.minimax, mockProviders.mimo]),
  getChatProvider: vi.fn((id: string) =>
    id === "mimo" ? mockProviders.mimo : mockProviders.minimax,
  ),
}));

// Mock fetch
global.fetch = vi.fn();

/** Build a Response with a streaming body that yields the given chunks in order. */
function makeStreamingResponse(chunks: string[], ok = true): Response {
  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      for (const chunk of chunks) {
        controller.enqueue(encoder.encode(chunk));
      }
      controller.close();
    },
  });
  return {
    ok,
    status: ok ? 200 : 500,
    body: stream,
    json: async () => ({ error: "fail" }),
  } as unknown as Response;
}

/** Locate the provider-model select (the only top-level `<select>` rendered). */
function getProviderSelect(): HTMLSelectElement {
  return screen.getAllByRole("combobox")[0] as HTMLSelectElement;
}

/** Locate the send button (the only button whose SVG has the `M22 2L11 13` path). */
function getSendButton(): HTMLButtonElement {
  return screen
    .getAllByRole("button")
    .find((b) => b.querySelector('svg path[d*="M22 2L11 13"]')) as HTMLButtonElement;
}

describe("ChatTool", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // JSDOM doesn't implement scrollTo; the component uses it on each new
    // message to auto-scroll the chat list.
    if (!HTMLElement.prototype.scrollTo) {
      HTMLElement.prototype.scrollTo = function () {
        /* no-op in tests */
      } as typeof HTMLElement.prototype.scrollTo;
    }
  });

  describe("rendering", () => {
    it("renders the chat heading", () => {
      render(<ChatTool />);
      expect(screen.getByText("Li Yang 的数字分身")).toBeInTheDocument();
    });

    it("renders all provider options", () => {
      render(<ChatTool />);
      expect(
        screen.getByRole("option", { name: /MiniMax/ }),
      ).toBeInTheDocument();
      expect(screen.getByRole("option", { name: /MiMo/ })).toBeInTheDocument();
    });

    it("renders the model chips for the default provider", () => {
      render(<ChatTool />);
      expect(screen.getByText("ABAB 6.5")).toBeInTheDocument();
      expect(screen.getByText("ABAB 6.5s")).toBeInTheDocument();
    });

    it("renders the quick-question buttons", () => {
      render(<ChatTool />);
      expect(screen.getByText("你是做什么的？")).toBeInTheDocument();
      expect(screen.getByText("你的技术栈是什么？")).toBeInTheDocument();
      expect(screen.getByText("怎么联系你？")).toBeInTheDocument();
    });

    it("renders the role tags", () => {
      render(<ChatTool />);
      expect(screen.getByText("全栈工程师")).toBeInTheDocument();
      expect(screen.getByText("AI 爱好者")).toBeInTheDocument();
      expect(screen.getByText("开源贡献者")).toBeInTheDocument();
      expect(screen.getByText("创业者")).toBeInTheDocument();
    });

    it("renders the empty-state hint when no messages", () => {
      render(<ChatTool />);
      expect(
        screen.getByText(/点击上方问题或输入你的问题开始对话/),
      ).toBeInTheDocument();
    });
  });

  describe("input handling", () => {
    it("disables the send button when input is empty", () => {
      render(<ChatTool />);
      expect(getSendButton()).toBeDisabled();
    });

    it("enables the send button when input has text", () => {
      render(<ChatTool />);
      fireEvent.change(screen.getByLabelText("输入消息"), {
        target: { value: "你好" },
      });
      expect(getSendButton()).not.toBeDisabled();
    });

    it("quick-question button populates the input", () => {
      render(<ChatTool />);
      fireEvent.click(screen.getByText("你是做什么的？"));
      const input = screen.getByLabelText("输入消息") as HTMLInputElement;
      expect(input.value).toBe("你是做什么的？");
    });
  });

  describe("sending messages", () => {
    it("appends a user message and clears the input on send", async () => {
      vi.mocked(fetch).mockResolvedValueOnce(
        makeStreamingResponse(["你好！我是 Li Yang 的数字分身。"]),
      );

      render(<ChatTool />);
      fireEvent.change(screen.getByLabelText("输入消息"), {
        target: { value: "你好" },
      });
      fireEvent.click(getSendButton());

      await waitFor(() => {
        expect(screen.getByText("你好")).toBeInTheDocument();
      });
      expect((screen.getByLabelText("输入消息") as HTMLInputElement).value).toBe(
        "",
      );
    });

    it("accumulates streamed chunks into the assistant bubble", async () => {
      vi.mocked(fetch).mockResolvedValueOnce(
        makeStreamingResponse(["你", "好", "，", "Li Yang", "！"]),
      );

      render(<ChatTool />);
      fireEvent.change(screen.getByLabelText("输入消息"), {
        target: { value: "hi" },
      });
      fireEvent.click(getSendButton());

      await waitFor(() => {
        expect(screen.getByText("你好，Li Yang！")).toBeInTheDocument();
      });
    });

    it("sends provider + model + messages in the POST body", async () => {
      vi.mocked(fetch).mockResolvedValueOnce(makeStreamingResponse(["ok"]));

      render(<ChatTool />);
      fireEvent.change(screen.getByLabelText("输入消息"), {
        target: { value: "test" },
      });
      fireEvent.click(getSendButton());

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith("/api/chat", expect.any(Object));
      });

      const callBody = JSON.parse(
        vi.mocked(fetch).mock.calls[0][1]?.body as string,
      );
      expect(callBody.provider).toBe("minimax");
      expect(callBody.model).toBe("abab6.5-chat");
      expect(callBody.messages).toEqual([{ role: "user", content: "test" }]);
    });

    it("sends Enter key without Shift as a submit", async () => {
      vi.mocked(fetch).mockResolvedValueOnce(makeStreamingResponse(["ok"]));

      render(<ChatTool />);
      const input = screen.getByLabelText("输入消息");
      fireEvent.change(input, { target: { value: "via enter" } });
      fireEvent.keyDown(input, { key: "Enter", shiftKey: false });

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledTimes(1);
      });
    });

    it("does NOT send when Enter is pressed with Shift held", async () => {
      render(<ChatTool />);
      const input = screen.getByLabelText("输入消息");
      fireEvent.change(input, { target: { value: "newline" } });
      fireEvent.keyDown(input, { key: "Enter", shiftKey: true });
      expect(fetch).not.toHaveBeenCalled();
    });

    it("does NOT send empty or whitespace-only input", async () => {
      render(<ChatTool />);
      fireEvent.change(screen.getByLabelText("输入消息"), {
        target: { value: "   " },
      });
      fireEvent.click(getSendButton());
      expect(fetch).not.toHaveBeenCalled();
    });
  });

  describe("error handling", () => {
    it("shows a distinct error bubble with retry on 500", async () => {
      vi.mocked(fetch).mockResolvedValueOnce(makeStreamingResponse([], false));

      render(<ChatTool />);
      fireEvent.change(screen.getByLabelText("输入消息"), {
        target: { value: "fail please" },
      });
      fireEvent.click(getSendButton());

      await waitFor(() => {
        expect(screen.getByText(/请求失败 \(500\)/)).toBeInTheDocument();
      });
      const alert = screen.getByRole("alert");
      expect(alert).toHaveTextContent(/请求失败/);
      expect(screen.getByText("重试")).toBeInTheDocument();
    });

    it("shows a 429-specific rate-limit message", async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 429,
        json: async () => ({}),
      } as Response);

      render(<ChatTool />);
      fireEvent.change(screen.getByLabelText("输入消息"), {
        target: { value: "spam" },
      });
      fireEvent.click(getSendButton());

      await waitFor(() => {
        expect(
          screen.getByText(/请求太频繁，请稍后再试/),
        ).toBeInTheDocument();
      });
    });

    it("shows an 'AI service not configured' message on Service unavailable", async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 503,
        json: async () => ({ error: "Service unavailable" }),
      } as Response);

      render(<ChatTool />);
      fireEvent.change(screen.getByLabelText("输入消息"), {
        target: { value: "hi" },
      });
      fireEvent.click(getSendButton());

      await waitFor(() => {
        expect(screen.getByText(/AI 服务未配置/)).toBeInTheDocument();
      });
    });

    it("shows a generic error on network failure", async () => {
      vi.mocked(fetch).mockRejectedValueOnce(new Error("NetworkError"));

      render(<ChatTool />);
      fireEvent.change(screen.getByLabelText("输入消息"), {
        target: { value: "offline" },
      });
      fireEvent.click(getSendButton());

      await waitFor(() => {
        expect(screen.getByText("NetworkError")).toBeInTheDocument();
      });
    });

    it("clicking 重试 copies the last user message back into the input", async () => {
      vi.mocked(fetch).mockResolvedValueOnce(makeStreamingResponse([], false));

      render(<ChatTool />);
      fireEvent.change(screen.getByLabelText("输入消息"), {
        target: { value: "original question" },
      });
      fireEvent.click(getSendButton());

      await waitFor(() => {
        expect(screen.getByText("重试")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("重试"));
      const input = screen.getByLabelText("输入消息") as HTMLInputElement;
      expect(input.value).toBe("original question");
    });
  });

  describe("loading state", () => {
    it("disables the input while a request is in flight", async () => {
      // Never-resolving response: the request stays pending
      const pendingStream = new ReadableStream<Uint8Array>({
        start() {
          /* never closes */
        },
      });
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
        body: pendingStream,
      } as Response);

      render(<ChatTool />);
      fireEvent.change(screen.getByLabelText("输入消息"), {
        target: { value: "block me" },
      });
      fireEvent.click(getSendButton());

      await waitFor(() => {
        expect(screen.getByLabelText("输入消息")).toBeDisabled();
      });
    });
  });

  describe("provider switching", () => {
    it("switches the model chips when the provider changes", async () => {
      render(<ChatTool />);
      fireEvent.change(getProviderSelect(), { target: { value: "mimo" } });
      await waitFor(() => {
        expect(screen.getByText("MiMo 7B")).toBeInTheDocument();
      });
    });
  });
});
