import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import TtsTool from "./TtsTool";

// Mock tts-db
const mockTtsDb = vi.hoisted(() => ({
  isSupported: vi.fn(() => true),
  addRecord: vi.fn(() => Promise.resolve()),
  getAllRecords: vi.fn(() => Promise.resolve([] as unknown[])),
  deleteRecord: vi.fn(() => Promise.resolve()),
  deleteOldestIfNeeded: vi.fn(() => Promise.resolve(false)),
  TtsDbError: class TtsDbError extends Error {
    static NotAvailable = new TtsDbError("IndexedDB not available");
    static QuotaExceeded = new TtsDbError("Storage quota exceeded");
  },
  MAX_TOTAL_SIZE: 30 * 1024 * 1024,
}));

vi.mock("@/lib/tts-db", () => mockTtsDb);

// Mock tts-providers
const mockProviders = vi.hoisted(() => {
  const mimo = {
    id: "mimo",
    name: "MiMo",
    models: [
      { id: "mimo-v2.5-tts", name: "MiMo TTS v2.5", description: "标准语音合成" },
      { id: "mimo-v2.5-tts-voicedesign", name: "音色设计", description: "通过文本描述生成新音色" },
      { id: "mimo-v2.5-tts-voiceclone", name: "音色复刻", description: "通过音频样本复刻音色" },
    ],
    defaultModel: "mimo-v2.5-tts",
    defaultVoiceId: "冰糖",
    voices: [
      { id: "冰糖", name: "冰糖", lang: "中文", gender: "女", demoText: "你好呀" },
      { id: "茉莉", name: "茉莉", lang: "中文", gender: "女", demoText: "嗨" },
    ],
  };

  const minimax = {
    id: "minimax",
    name: "MiniMax",
    models: [
      { id: "speech-2.8-hd", name: "Speech 2.8 HD", description: "最新高质量" },
      { id: "speech-02-hd", name: "Speech 02 HD", description: "高清" },
    ],
    defaultModel: "speech-2.8-hd",
    defaultVoiceId: "male-qn-qingse",
    voices: [
      { id: "male-qn-qingse", name: "青涩", lang: "中文", gender: "男", demoText: "你好" },
      { id: "female-shaonv", name: "少女", lang: "中文", gender: "女", demoText: "嗨" },
    ],
  };

  return { mimo, minimax };
});

vi.mock("@/lib/tts-providers", () => ({
  listProviders: vi.fn(() => [mockProviders.mimo, mockProviders.minimax]),
  mimoProvider: mockProviders.mimo,
  minimaxProvider: mockProviders.minimax,
}));

// Mock fetch
global.fetch = vi.fn();

describe("TtsTool", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockTtsDb.getAllRecords.mockResolvedValue([]);
    mockTtsDb.isSupported.mockReturnValue(true);
  });

  describe("provider switching", () => {
    it("renders provider buttons", () => {
      render(<TtsTool />);
      expect(screen.getByText("MiMo")).toBeInTheDocument();
      expect(screen.getByText("MiniMax")).toBeInTheDocument();
    });

    it("shows MiMo voices by default", () => {
      render(<TtsTool />);
      expect(screen.getByText("冰糖")).toBeInTheDocument();
      expect(screen.getByText("茉莉")).toBeInTheDocument();
    });

    it("switches to MiniMax voices when MiniMax is selected", () => {
      render(<TtsTool />);
      fireEvent.click(screen.getByText("MiniMax"));
      expect(screen.getByText("青涩")).toBeInTheDocument();
      expect(screen.getByText("少女")).toBeInTheDocument();
    });

    it("shows model selector for the current provider", () => {
      render(<TtsTool />);
      expect(screen.getByText("MiMo TTS v2.5")).toBeInTheDocument();
      expect(screen.getByText("音色设计")).toBeInTheDocument();
    });

    it("switches models when provider changes", () => {
      render(<TtsTool />);
      fireEvent.click(screen.getByText("MiniMax"));
      expect(screen.getByText("Speech 2.8 HD")).toBeInTheDocument();
    });

    it("sends provider and model in API request", async () => {
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ audio: "dGVzdA==" }),
      } as Response);

      render(<TtsTool />);

      const generateBtn = screen.getByText("生成语音").closest("button");
      if (generateBtn) fireEvent.click(generateBtn);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith("/api/tts", expect.any(Object));
      });

      const callBody = JSON.parse(mockFetch.mock.calls[0][1]?.body as string);
      expect(callBody.provider).toBe("mimo");
      expect(callBody.model).toBe("mimo-v2.5-tts");
    });

    it("sends MiniMax provider in API request after switching", async () => {
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ audio: "dGVzdA==" }),
      } as Response);

      render(<TtsTool />);
      fireEvent.click(screen.getByText("MiniMax"));

      const generateBtn = screen.getByText("生成语音").closest("button");
      if (generateBtn) fireEvent.click(generateBtn);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith("/api/tts", expect.any(Object));
      });

      const callBody = JSON.parse(mockFetch.mock.calls[0][1]?.body as string);
      expect(callBody.provider).toBe("minimax");
      expect(callBody.model).toBe("speech-2.8-hd");
    });
  });

  describe("voice selection", () => {
    it("selects a voice when card is clicked", () => {
      render(<TtsTool />);
      const voiceCard = screen.getByText("茉莉").closest("div[class*='cursor-pointer']");
      if (voiceCard) fireEvent.click(voiceCard);

      const selectedCard = screen.getByText("茉莉").closest("div[class*='border-neon-cyan']");
      expect(selectedCard).toBeInTheDocument();
    });
  });

  describe("style tags", () => {
    it("renders style categories", () => {
      render(<TtsTool />);
      // Category labels should be visible
      expect(screen.getByText("情绪")).toBeInTheDocument();
    });

    it("applies style tag to text when clicked", () => {
      render(<TtsTool />);
      const textarea = screen.getByPlaceholderText("输入要合成的文本，支持风格标签和音频标签...") as HTMLTextAreaElement;
      fireEvent.click(screen.getByText("开心"));
      expect(textarea.value.startsWith("(开心)")).toBe(true);
    });

    it("multi-selects: clicking two tags creates combined prefix", () => {
      render(<TtsTool />);
      const textarea = screen.getByPlaceholderText("输入要合成的文本，支持风格标签和音频标签...") as HTMLTextAreaElement;
      fireEvent.click(screen.getByText("开心"));
      fireEvent.click(screen.getByText("悲伤"));
      expect(textarea.value.startsWith("(开心 悲伤)")).toBe(true);
    });

    it("deselects tag on second click", () => {
      render(<TtsTool />);
      const textarea = screen.getByPlaceholderText("输入要合成的文本，支持风格标签和音频标签...") as HTMLTextAreaElement;
      fireEvent.click(screen.getByText("开心"));
      fireEvent.click(screen.getByText("悲伤"));
      // Deselect 开心
      fireEvent.click(screen.getByText("开心"));
      expect(textarea.value.startsWith("(悲伤)")).toBe(true);
      expect(textarea.value.includes("开心")).toBe(false);
    });

    it("removes prefix when all tags deselected", () => {
      render(<TtsTool />);
      const textarea = screen.getByPlaceholderText("输入要合成的文本，支持风格标签和音频标签...") as HTMLTextAreaElement;
      fireEvent.click(screen.getByText("开心"));
      fireEvent.click(screen.getByText("开心")); // deselect
      expect(textarea.value).toBe("你好！欢迎使用语音合成功能。");
    });
  });

  describe("audio tags", () => {
    it("renders all audio tags", () => {
      render(<TtsTool />);
      const audioLabels = ["笑", "轻笑", "叹气", "深呼吸", "抽泣", "哽咽", "颤抖", "气声"];
      audioLabels.forEach((label) => {
        expect(screen.getByText(label)).toBeInTheDocument();
      });
    });

    it("inserts audio tag at cursor position when clicked", () => {
      render(<TtsTool />);
      const textarea = screen.getByPlaceholderText("输入要合成的文本，支持风格标签和音频标签...") as HTMLTextAreaElement;
      textarea.setSelectionRange(2, 2);
      fireEvent.click(screen.getByText("笑"));
      expect(textarea.value.includes("[笑]")).toBe(true);
    });
  });

  describe("text input", () => {
    it("has default text", () => {
      render(<TtsTool />);
      const textarea = screen.getByPlaceholderText("输入要合成的文本，支持风格标签和音频标签...") as HTMLTextAreaElement;
      expect(textarea.value).toBe("你好！欢迎使用语音合成功能。");
    });

    it("disables generate button when text is empty", () => {
      render(<TtsTool />);
      const textarea = screen.getByPlaceholderText("输入要合成的文本，支持风格标签和音频标签...") as HTMLTextAreaElement;
      fireEvent.change(textarea, { target: { value: "" } });
      const generateBtn = screen.getByText("生成语音");
      expect(generateBtn.closest("button")).toBeDisabled();
    });
  });

  describe("advanced settings", () => {
    it("toggles advanced settings when clicked", () => {
      render(<TtsTool />);
      expect(screen.queryByText("自然语言风格描述（可选）")).not.toBeInTheDocument();
      fireEvent.click(screen.getByText("高级设置"));
      expect(screen.getByText("自然语言风格描述（可选）")).toBeInTheDocument();
    });

    it("renders format selection in advanced settings", () => {
      render(<TtsTool />);
      fireEvent.click(screen.getByText("高级设置"));
      expect(screen.getByText("MP3")).toBeInTheDocument();
      expect(screen.getByText("WAV")).toBeInTheDocument();
      expect(screen.getByText("PCM16")).toBeInTheDocument();
    });
  });

  describe("preview", () => {
    it("shows preview button for each voice", () => {
      render(<TtsTool />);
      const previewButtons = screen.getAllByText("试听");
      expect(previewButtons.length).toBeGreaterThan(0);
    });
  });

  describe("helper text", () => {
    it("shows helper text about tags", () => {
      render(<TtsTool />);
      expect(screen.getByText(/提示:/)).toBeInTheDocument();
    });
  });

  describe("history", () => {
    it("shows history record after generation", async () => {
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ audio: "dGVzdA==" }),
      } as Response);

      render(<TtsTool />);

      const generateBtn = screen.getByText("生成语音").closest("button");
      if (generateBtn) fireEvent.click(generateBtn);

      await waitFor(() => {
        expect(screen.getByText("生成记录")).toBeInTheDocument();
      });

      expect(mockTtsDb.addRecord).toHaveBeenCalledTimes(1);
    });

    it("deletes a history record when delete button is clicked", async () => {
      const existingRecords = [{
        id: "record-1",
        voiceId: "冰糖",
        voiceName: "冰糖",
        text: "测试文本",
        audioBlob: new Blob(["audio"]),
        createdAt: 1000,
      }];
      mockTtsDb.getAllRecords.mockResolvedValue(existingRecords);

      render(<TtsTool />);

      await waitFor(() => {
        expect(screen.getByLabelText("删除")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByLabelText("删除"));

      await waitFor(() => {
        expect(mockTtsDb.deleteRecord).toHaveBeenCalledWith("record-1");
        expect(screen.queryByLabelText("删除")).not.toBeInTheDocument();
      });
    });

    it("falls back to memory mode when IndexedDB is not supported", async () => {
      mockTtsDb.isSupported.mockReturnValue(false);

      const mockFetch = vi.mocked(fetch);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ audio: "dGVzdA==" }),
      } as Response);

      render(<TtsTool />);

      const generateBtn = screen.getByText("生成语音").closest("button");
      if (generateBtn) fireEvent.click(generateBtn);

      await waitFor(() => {
        expect(screen.getByText("生成记录")).toBeInTheDocument();
      });

      expect(mockTtsDb.addRecord).not.toHaveBeenCalled();
    });
  });

  describe("voice design", () => {
    it("shows voice design panel when voicedesign model selected", () => {
      render(<TtsTool />);
      fireEvent.click(screen.getByText("音色设计"));
      expect(screen.getByPlaceholderText("描述你想要的音色，例如：一个温柔知性的中年女声，语速偏慢，略带沙哑，适合录制有声书…")).toBeInTheDocument();
    });

    it("hides voice cards when voicedesign model selected", () => {
      render(<TtsTool />);
      fireEvent.click(screen.getByText("音色设计"));
      expect(screen.queryByText("选择音色")).not.toBeInTheDocument();
    });

    it("hides text input when voicedesign model selected", () => {
      render(<TtsTool />);
      fireEvent.click(screen.getByText("音色设计"));
      expect(screen.queryByText("合成文本")).not.toBeInTheDocument();
    });

    it("shows generate button label '生成音色' for voice design", () => {
      render(<TtsTool />);
      fireEvent.click(screen.getByText("音色设计"));
      expect(screen.getByText("生成音色")).toBeInTheDocument();
    });
  });

  describe("voice clone", () => {
    it("shows voice clone upload panel when voiceclone model selected", () => {
      render(<TtsTool />);
      fireEvent.click(screen.getByText("音色复刻"));
      expect(screen.getByText("点击上传音频样本")).toBeInTheDocument();
    });

    it("hides voice cards when voiceclone model selected", () => {
      render(<TtsTool />);
      fireEvent.click(screen.getByText("音色复刻"));
      expect(screen.queryByText("选择音色")).not.toBeInTheDocument();
    });

    it("shows generate button label '复刻并生成语音' for voice clone", () => {
      render(<TtsTool />);
      fireEvent.click(screen.getByText("音色复刻"));
      expect(screen.getByText("复刻并生成语音")).toBeInTheDocument();
    });

    it("shows error when generating without uploading audio", async () => {
      render(<TtsTool />);
      fireEvent.click(screen.getByText("音色复刻"));

      const generateBtn = screen.getByText("复刻并生成语音").closest("button");
      if (generateBtn) fireEvent.click(generateBtn);

      await waitFor(() => {
        expect(screen.getByText("请先上传音频样本")).toBeInTheDocument();
      });
    });
  });

  describe("director mode", () => {
    it("toggles director mode panel", () => {
      render(<TtsTool />);
      expect(screen.queryByPlaceholderText("例如: 一位年迈的智者")).not.toBeInTheDocument();
      fireEvent.click(screen.getByText("导演模式"));
      expect(screen.getByPlaceholderText("例如: 一位年迈的智者")).toBeInTheDocument();
    });

    it("renders role, scene, and direction inputs", () => {
      render(<TtsTool />);
      fireEvent.click(screen.getByText("导演模式"));
      expect(screen.getByPlaceholderText("例如: 一位年迈的智者")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("例如: 在篝火旁讲述古老的传说")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("例如: 语速缓慢而庄重，声音低沉有回声，在说到'古老'时加重语气")).toBeInTheDocument();
    });

    it("collapses director mode on second click", () => {
      render(<TtsTool />);
      fireEvent.click(screen.getByText("导演模式"));
      fireEvent.click(screen.getByText("导演模式"));
      expect(screen.queryByPlaceholderText("例如: 一位年迈的智者")).not.toBeInTheDocument();
    });

    it("sends assembled director style in API request", async () => {
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ audio: "dGVzdA==" }),
      } as Response);

      render(<TtsTool />);
      fireEvent.click(screen.getByText("导演模式"));

      const roleInput = screen.getByPlaceholderText("例如: 一位年迈的智者");
      fireEvent.change(roleInput, { target: { value: "年迈的智者" } });

      const generateBtn = screen.getByText("生成语音").closest("button");
      if (generateBtn) fireEvent.click(generateBtn);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith("/api/tts", expect.any(Object));
      });

      const callBody = JSON.parse(mockFetch.mock.calls[0][1]?.body as string);
      expect(callBody.style).toContain("角色：年迈的智者");
    });
  });

  describe("error handling", () => {
    it("shows error when API returns non-ok", async () => {
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: "Service error" }),
      } as Response);

      render(<TtsTool />);

      const generateBtn = screen.getByText("生成语音").closest("button");
      if (generateBtn) fireEvent.click(generateBtn);

      await waitFor(() => {
        expect(screen.getByText("Service error")).toBeInTheDocument();
      });
    });

    it("shows error on network failure", async () => {
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockRejectedValueOnce(new Error("NetworkError"));

      render(<TtsTool />);

      const generateBtn = screen.getByText("生成语音").closest("button");
      if (generateBtn) fireEvent.click(generateBtn);

      await waitFor(() => {
        expect(screen.getByText("NetworkError")).toBeInTheDocument();
      });
    });
  });

  describe("voice design full flow", () => {
    it("sends voice as undefined and style as voice description", async () => {
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ audio: "dGVzdA==" }),
      } as Response);

      render(<TtsTool />);
      fireEvent.click(screen.getByText("音色设计"));

      const descInput = screen.getByPlaceholderText(/描述你想要的音色/);
      fireEvent.change(descInput, { target: { value: "一个温柔的女声" } });

      const generateBtn = screen.getByText("生成音色").closest("button");
      if (generateBtn) fireEvent.click(generateBtn);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith("/api/tts", expect.any(Object));
      });

      const callBody = JSON.parse(mockFetch.mock.calls[0][1]?.body as string);
      expect(callBody.voice).toBeUndefined();
      expect(callBody.style).toBe("一个温柔的女声");
      expect(callBody.model).toContain("voicedesign");
    });
  });
});
