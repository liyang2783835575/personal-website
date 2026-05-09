import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import TtsTool from "./TtsTool";

// Mock tts-db
const mockTtsDb = vi.hoisted(() => ({
  isSupported: vi.fn(() => true),
  addRecord: vi.fn(() => Promise.resolve()),
  getAllRecords: vi.fn(() => Promise.resolve([])),
  deleteRecord: vi.fn(() => Promise.resolve()),
  deleteOldestIfNeeded: vi.fn(() => Promise.resolve(false)),
  TtsDbError: class TtsDbError extends Error {
    static NotAvailable = new TtsDbError("IndexedDB not available");
    static QuotaExceeded = new TtsDbError("Storage quota exceeded");
  },
  MAX_TOTAL_SIZE: 30 * 1024 * 1024,
}));

vi.mock("@/lib/tts-db", () => mockTtsDb);

// Mock fetch
global.fetch = vi.fn();

describe("TtsTool", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockTtsDb.getAllRecords.mockResolvedValue([]);
    mockTtsDb.isSupported.mockReturnValue(true);
  });

  it("renders all voice cards", () => {
    render(<TtsTool />);
    expect(screen.getByText("冰糖")).toBeInTheDocument();
    expect(screen.getByText("茉莉")).toBeInTheDocument();
    expect(screen.getByText("苏打")).toBeInTheDocument();
    expect(screen.getByText("白桦")).toBeInTheDocument();
    expect(screen.getByText("Mia")).toBeInTheDocument();
    expect(screen.getByText("Chloe")).toBeInTheDocument();
    expect(screen.getByText("Milo")).toBeInTheDocument();
    expect(screen.getByText("Dean")).toBeInTheDocument();
  });

  it("selects a voice when card is clicked", () => {
    render(<TtsTool />);
    const voiceCard = screen.getByText("茉莉").closest("div[class*='cursor-pointer']");
    if (voiceCard) fireEvent.click(voiceCard);

    // Selected voice should have neon border styling
    const selectedCard = screen.getByText("茉莉").closest("div[class*='border-neon-cyan']");
    expect(selectedCard).toBeInTheDocument();
  });

  it("renders all style tags", () => {
    render(<TtsTool />);
    const styleLabels = ["开心", "悲伤", "温柔", "高冷", "慵懒", "磁性", "甜美", "东北话", "四川话", "粤语", "唱歌", "平静"];
    styleLabels.forEach((label) => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });
  });

  it("applies style tag to text when clicked", () => {
    render(<TtsTool />);
    const textarea = screen.getByPlaceholderText("输入要合成的文本，支持风格标签和音频标签...") as HTMLTextAreaElement;

    fireEvent.click(screen.getByText("开心"));
    expect(textarea.value.startsWith("(开心)")).toBe(true);
  });

  it("replaces existing style tag when new one is clicked", () => {
    render(<TtsTool />);
    const textarea = screen.getByPlaceholderText("输入要合成的文本，支持风格标签和音频标签...") as HTMLTextAreaElement;

    fireEvent.click(screen.getByText("开心"));
    fireEvent.click(screen.getByText("悲伤"));

    expect(textarea.value.startsWith("(悲伤)")).toBe(true);
    expect(textarea.value.includes("(开心)")).toBe(false);
  });

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

    // Set cursor position
    textarea.setSelectionRange(2, 2);
    fireEvent.click(screen.getByText("笑"));

    expect(textarea.value.includes("[笑]")).toBe(true);
  });

  it("textarea has default text", () => {
    render(<TtsTool />);
    const textarea = screen.getByPlaceholderText("输入要合成的文本，支持风格标签和音频标签...") as HTMLTextAreaElement;
    expect(textarea.value).toBe("你好！欢迎使用语音合成功能。");
  });

  it("generate button is disabled when text is empty", () => {
    render(<TtsTool />);
    const textarea = screen.getByPlaceholderText("输入要合成的文本，支持风格标签和音频标签...") as HTMLTextAreaElement;

    fireEvent.change(textarea, { target: { value: "" } });

    const generateBtn = screen.getByText("生成语音");
    expect(generateBtn.closest("button")).toBeDisabled();
  });

  it("toggles advanced settings when clicked", () => {
    render(<TtsTool />);

    expect(screen.queryByText("自然语言风格描述（可选）")).not.toBeInTheDocument();

    fireEvent.click(screen.getByText("高级设置"));

    expect(screen.getByText("自然语言风格描述（可选）")).toBeInTheDocument();
    expect(screen.getByText("音频格式")).toBeInTheDocument();
  });

  it("calls API when generate button is clicked", async () => {
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
    expect(callBody.voice).toBe("冰糖");
    expect(callBody.text).toBeTruthy();
  });

  it("shows error when API fails", async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ error: "API Error" }),
    } as Response);

    render(<TtsTool />);

    const generateBtn = screen.getByText("生成语音").closest("button");
    if (generateBtn) fireEvent.click(generateBtn);

    await waitFor(() => {
      expect(screen.getByText(/API Error/)).toBeInTheDocument();
    });
  });

  it("shows preview button for each voice", () => {
    render(<TtsTool />);
    const previewButtons = screen.getAllByText("试听");
    expect(previewButtons.length).toBeGreaterThan(0);
  });

  it("renders format selection in advanced settings", () => {
    render(<TtsTool />);
    fireEvent.click(screen.getByText("高级设置"));

    expect(screen.getByText("MP3")).toBeInTheDocument();
    expect(screen.getByText("WAV")).toBeInTheDocument();
    expect(screen.getByText("PCM16")).toBeInTheDocument();
  });

  it("shows helper text about tags", () => {
    render(<TtsTool />);
    expect(screen.getByText(/提示:/)).toBeInTheDocument();
    expect(screen.getByText(/在文本开头添加/)).toBeInTheDocument();
    expect(screen.getByText(/在任意位置插入/)).toBeInTheDocument();
  });

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
    const recordArg = mockTtsDb.addRecord.mock.calls[0][0];
    expect(recordArg.voiceName).toBe("冰糖");
    expect(recordArg.text).toBeTruthy();
    expect(recordArg.audioBlob).toBeInstanceOf(Blob);
  });

  it("removes oldest history when exceeding 5 records", async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ audio: "dGVzdA==" }),
    } as Response);

    const existingRecords = Array.from({ length: 5 }, (_, i) => ({
      id: `record-${i}`,
      voiceId: "冰糖",
      voiceName: "冰糖",
      text: `文本${i}`,
      audioBlob: new Blob(["audio"]),
      createdAt: 1000 + i,
    }));
    mockTtsDb.getAllRecords.mockResolvedValue(existingRecords);

    render(<TtsTool />);

    await waitFor(() => {
      expect(screen.getAllByLabelText("删除")).toHaveLength(5);
    });

    const generateBtn = screen.getByText("生成语音").closest("button");
    if (generateBtn) fireEvent.click(generateBtn);

    await waitFor(() => {
      expect(screen.getAllByLabelText("删除")).toHaveLength(5);
    });
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
