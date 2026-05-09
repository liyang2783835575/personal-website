"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  isSupported,
  addRecord,
  getAllRecords,
  deleteRecord,
  type TtsHistoryRecord,
} from "@/lib/tts-db";

interface Voice {
  id: string;
  name: string;
  lang: string;
  gender: string;
  demoText: string;
}

const VOICES: Voice[] = [
  { id: "mimo_default", name: "MiMo 默认", lang: "自动", gender: "", demoText: "你好，我是 MiMo 默认音色。" },
  { id: "冰糖", name: "冰糖", lang: "中文", gender: "女", demoText: "你好呀，我是冰糖，一个温柔的女声。" },
  { id: "茉莉", name: "茉莉", lang: "中文", gender: "女", demoText: "嗨，我是茉莉，很高兴认识你。" },
  { id: "苏打", name: "苏打", lang: "中文", gender: "男", demoText: "你好，我是苏打，一个清爽的男声。" },
  { id: "白桦", name: "白桦", lang: "中文", gender: "男", demoText: "你好，我是白桦，一个沉稳的男声。" },
  { id: "Mia", name: "Mia", lang: "英文", gender: "女", demoText: "Hello, I'm Mia. Nice to meet you!" },
  { id: "Chloe", name: "Chloe", lang: "英文", gender: "女", demoText: "Hi there, I'm Chloe. How are you today?" },
  { id: "Milo", name: "Milo", lang: "英文", gender: "男", demoText: "Hey, I'm Milo. Glad to be here." },
  { id: "Dean", name: "Dean", lang: "英文", gender: "男", demoText: "Hello, I'm Dean. Let's get started." },
];

const STYLE_TAGS = [
  { label: "开心", tag: "开心" },
  { label: "悲伤", tag: "悲伤" },
  { label: "温柔", tag: "温柔" },
  { label: "高冷", tag: "高冷" },
  { label: "慵懒", tag: "慵懒" },
  { label: "磁性", tag: "磁性" },
  { label: "甜美", tag: "甜美" },
  { label: "东北话", tag: "东北话" },
  { label: "四川话", tag: "四川话" },
  { label: "粤语", tag: "粤语" },
  { label: "唱歌", tag: "唱歌" },
  { label: "平静", tag: "平静" },
];

const AUDIO_TAGS = [
  { label: "笑", tag: "[笑]" },
  { label: "轻笑", tag: "[轻笑]" },
  { label: "叹气", tag: "[叹气]" },
  { label: "深呼吸", tag: "[深呼吸]" },
  { label: "抽泣", tag: "[抽泣]" },
  { label: "哽咽", tag: "[哽咽]" },
  { label: "颤抖", tag: "[颤抖]" },
  { label: "气声", tag: "[气声]" },
];

interface HistoryItem {
  id: string;
  voiceName: string;
  text: string;
  audioUrl: string;
  createdAt: number;
}

export default function TtsTool() {
  const [text, setText] = useState("你好！欢迎使用语音合成功能。");
  const [selectedVoice, setSelectedVoice] = useState("冰糖");
  const [styleDesc, setStyleDesc] = useState("");
  const [format, setFormat] = useState<"mp3" | "wav" | "pcm16">("mp3");
  const [generating, setGenerating] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [previewing, setPreviewing] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);
  const previewUrlRef = useRef<string | null>(null);
  const historyRef = useRef<HistoryItem[]>([]);
  historyRef.current = history;
  const dbSupportedRef = useRef(isSupported());

  // Load history from IndexedDB on mount
  useEffect(() => {
    if (!dbSupportedRef.current) return;

    getAllRecords()
      .then((records) => {
        const items = records.map((r) => ({
          id: r.id,
          voiceName: r.voiceName,
          text: r.text,
          audioUrl: URL.createObjectURL(r.audioBlob),
          createdAt: r.createdAt,
        }));
        setHistory(items);
      })
      .catch(() => {
        // Silently ignore DB errors
      });
  }, []);

  // Revoke all Blob URLs on unmount
  useEffect(() => {
    return () => {
      historyRef.current.forEach((item) => {
        URL.revokeObjectURL(item.audioUrl);
      });
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
      }
    };
  }, []);

  const insertAtCursor = useCallback((insertText: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const value = textarea.value;

    const newValue = value.slice(0, start) + insertText + value.slice(end);
    setText(newValue);

    requestAnimationFrame(() => {
      textarea.focus();
      const newCursorPos = start + insertText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    });
  }, []);

  const applyStyleTag = useCallback((tag: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const styleRegex = /^\([^)]*\)/;
    let newValue = text;

    if (styleRegex.test(text)) {
      newValue = text.replace(styleRegex, `(${tag})`);
    } else {
      newValue = `(${tag})${text}`;
    }

    setText(newValue);
    textarea.focus();
  }, [text]);

  const generateSpeech = useCallback(async (voiceId: string, textToSpeak: string, isPreview = false) => {
    setError(null);

    if (isPreview) {
      setPreviewing(voiceId);
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
        previewAudioRef.current = null;
      }
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
        previewUrlRef.current = null;
      }
    } else {
      setGenerating(true);
    }

    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: textToSpeak,
          voice: voiceId,
          style: styleDesc,
          format,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `生成失败: ${res.status}`);
      }

      const data = await res.json();
      const audioData = data.audio;

      const byteCharacters = atob(audioData);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);

      const blob = new Blob([byteArray], { type: "audio/wav" });

      if (isPreview) {
        const url = URL.createObjectURL(blob);
        previewUrlRef.current = url;
        const previewAudio = new Audio(url);
        previewAudioRef.current = previewAudio;

        previewAudio.onended = () => {
          if (previewUrlRef.current === url) {
            URL.revokeObjectURL(url);
            previewUrlRef.current = null;
          }
          previewAudioRef.current = null;
          setPreviewing(null);
        };

        previewAudio.onerror = () => {
          if (previewUrlRef.current === url) {
            URL.revokeObjectURL(url);
            previewUrlRef.current = null;
          }
          previewAudioRef.current = null;
          setPreviewing(null);
          setError("音频播放失败");
        };

        try {
          await previewAudio.play();
        } catch {
          if (previewUrlRef.current === url) {
            URL.revokeObjectURL(url);
            previewUrlRef.current = null;
          }
          previewAudioRef.current = null;
          setPreviewing(null);
          setError("无法播放音频，请检查浏览器设置");
        }
      } else {
        // Build history record
        const voice = VOICES.find((v) => v.id === selectedVoice);
        const record: TtsHistoryRecord = {
          id: crypto.randomUUID(),
          voiceId: selectedVoice,
          voiceName: voice?.name || selectedVoice,
          text: textToSpeak.trim().slice(0, 50),
          audioBlob: blob,
          createdAt: Date.now(),
        };

        setHistory((prev) => {
          let next = [...prev];
          if (next.length >= 5) {
            const oldest = next.reduce((a, b) => a.createdAt < b.createdAt ? a : b);
            URL.revokeObjectURL(oldest.audioUrl);
            if (dbSupportedRef.current) {
              deleteRecord(oldest.id).catch(() => {});
            }
            next = next.filter((item) => item.id !== oldest.id);
          }
          const newUrl = URL.createObjectURL(blob);
          return [
            {
              id: record.id,
              voiceName: record.voiceName,
              text: record.text,
              audioUrl: newUrl,
              createdAt: record.createdAt,
            },
            ...next,
          ];
        });

        if (dbSupportedRef.current) {
          addRecord(record).catch(() => {});
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "生成失败";
      setError(message);
      if (isPreview) {
        setPreviewing(null);
      } else {
        setGenerating(false);
      }
    } finally {
      if (!isPreview) {
        setGenerating(false);
      }
    }
  }, [styleDesc, format, selectedVoice]);

  const handleGenerate = useCallback(() => {
    if (!text.trim()) return;
    generateSpeech(selectedVoice, text.trim(), false);
  }, [text, selectedVoice, generateSpeech]);

  const handlePreview = useCallback((voice: Voice) => {
    if (previewing) return;
    generateSpeech(voice.id, voice.demoText, true);
  }, [previewing, generateSpeech]);

  const handleVoiceKeyDown = useCallback((e: React.KeyboardEvent, voiceId: string) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setSelectedVoice(voiceId);
    }
  }, []);

  const handleDeleteHistory = useCallback((id: string) => {
    setHistory((prev) => {
      const item = prev.find((h) => h.id === id);
      if (item) {
        URL.revokeObjectURL(item.audioUrl);
      }
      return prev.filter((h) => h.id !== id);
    });

    if (dbSupportedRef.current) {
      deleteRecord(id).catch(() => {});
    }
  }, []);

  return (
    <div className="space-y-5">
      {/* Voice Selection Cards */}
      <div>
        <label className="block text-xs font-mono text-text-secondary mb-2 uppercase tracking-wider">
          选择音色
        </label>
        <div className="grid grid-cols-3 gap-2">
          {VOICES.map((voice) => (
            <div
              key={voice.id}
              role="button"
              tabIndex={0}
              aria-pressed={selectedVoice === voice.id}
              onClick={() => setSelectedVoice(voice.id)}
              onKeyDown={(e) => handleVoiceKeyDown(e, voice.id)}
              className={`relative cursor-pointer rounded-xl p-3 border transition-all ${
                selectedVoice === voice.id
                  ? "border-neon-cyan/60 bg-neon-cyan/5 shadow-[var(--glow-xs)]"
                  : "border-white/5 bg-bg-card hover:border-white/10 hover:bg-bg-card-hover"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-medium text-text-primary">
                  {voice.name}
                </span>
                {voice.gender && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-text-muted">
                    {voice.gender}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-text-muted">{voice.lang}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePreview(voice);
                  }}
                  disabled={previewing === voice.id}
                  className="text-xs px-2.5 py-1 rounded-full border border-neon-cyan/40 text-neon-cyan hover:bg-neon-cyan/15 transition-all disabled:opacity-50"
                >
                  {previewing === voice.id ? "试听中..." : "试听"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Style Tags */}
      <div>
        <label className="block text-xs font-mono text-text-secondary mb-2 uppercase tracking-wider">
          风格标签（点击添加到文本开头）
        </label>
        <div className="flex flex-wrap gap-1.5">
          {STYLE_TAGS.map((s) => (
            <button
              key={s.tag}
              onClick={() => applyStyleTag(s.tag)}
              className="px-2.5 py-1 rounded-lg text-xs border border-neon-purple/30 text-neon-purple hover:bg-neon-purple/10 hover:border-neon-purple/50 transition-all"
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Audio Tags */}
      <div>
        <label className="block text-xs font-mono text-text-secondary mb-2 uppercase tracking-wider">
          音频标签（点击插入光标位置）
        </label>
        <div className="flex flex-wrap gap-1.5">
          {AUDIO_TAGS.map((t) => (
            <button
              key={t.tag}
              onClick={() => insertAtCursor(t.tag)}
              className="px-2.5 py-1 rounded-lg text-xs border border-neon-magenta/50 text-neon-magenta hover:bg-neon-magenta/15 hover:border-neon-magenta/70 transition-all"
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Text Input */}
      <div>
        <label className="block text-xs font-mono text-text-secondary mb-2 uppercase tracking-wider">
          合成文本
        </label>
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="输入要合成的文本，支持风格标签和音频标签..."
          rows={4}
          className="w-full rounded-xl bg-bg-primary border border-white/10 p-3 text-sm text-text-primary placeholder:text-text-muted focus:border-neon-cyan/50 focus:outline-none focus:shadow-[var(--glow-xs)] transition-all resize-none font-mono"
        />
        <p className="text-xs text-text-muted mt-1.5 font-mono">
          提示: 在文本开头添加 (风格) 如 (开心)，在任意位置插入 [标签] 如 [笑] 来控制语音效果
        </p>
      </div>

      {/* Advanced Settings */}
      <div>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          aria-expanded={showAdvanced}
          aria-controls="advanced-settings-panel"
          className="text-xs font-mono text-text-secondary hover:text-neon-cyan transition-colors flex items-center gap-1"
        >
          <span>{showAdvanced ? "▼" : "▶"}</span>
          高级设置
        </button>

        {showAdvanced && (
          <div
            id="advanced-settings-panel"
            className="mt-3 space-y-3 pl-4 border-l border-white/5"
          >
            {/* Natural Language Style Description */}
            <div>
              <label className="block text-xs font-mono text-text-secondary mb-1">
                自然语言风格描述（可选）
              </label>
              <input
                type="text"
                value={styleDesc}
                onChange={(e) => setStyleDesc(e.target.value)}
                placeholder="例如: 温柔且略带疲惫的女声，语速缓慢"
                className="w-full rounded-lg bg-bg-primary border border-white/10 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-neon-cyan/50 focus:outline-none transition-all font-mono"
              />
            </div>

            {/* Format Selection */}
            <div>
              <label className="block text-xs font-mono text-text-secondary mb-1">
                音频格式
              </label>
              <div className="flex gap-2">
                {(["mp3", "wav", "pcm16"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFormat(f)}
                    className={`px-3 py-1.5 rounded-lg text-xs border transition-all ${
                      format === f
                        ? "border-neon-cyan/60 bg-neon-cyan/10 text-neon-cyan"
                        : "border-white/10 text-text-secondary hover:border-white/20"
                    }`}
                  >
                    {f.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div
          role="alert"
          aria-live="polite"
          className="p-3 rounded-xl bg-neon-magenta/5 border border-neon-magenta/20 text-neon-magenta text-sm font-mono flex items-start gap-2"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 mt-0.5" aria-hidden="true">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          {error}
        </div>
      )}

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={!text.trim() || generating}
        className="w-full py-3 rounded-xl bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/30 hover:bg-neon-cyan/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all font-mono text-sm flex items-center justify-center gap-2"
      >
        {generating ? (
          <>
            <span className="w-4 h-4 border-2 border-neon-cyan/30 border-t-neon-cyan rounded-full animate-spin" />
            生成中...
          </>
        ) : (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            生成语音
          </>
        )}
      </button>

      {/* History List */}
      {history.length > 0 && (
        <div>
          <label className="block text-xs font-mono text-text-secondary mb-2 uppercase tracking-wider">
            生成记录
          </label>
          <div className="space-y-2">
            {history.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-2 p-3 rounded-xl border border-white/5 bg-bg-card"
              >
                <audio
                  src={item.audioUrl}
                  controls
                  className="flex-1 h-8 [&::-webkit-media-controls-panel]:bg-transparent [&::-webkit-media-controls-current-time-display]:text-text-secondary [&::-webkit-media-controls-time-remaining-display]:text-text-secondary"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-text-primary truncate">
                    {item.voiceName}
                  </div>
                  <div className="text-[10px] text-text-muted truncate">
                    {item.text}
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteHistory(item.id)}
                  aria-label="删除"
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-text-muted hover:text-neon-magenta hover:bg-neon-magenta/10 transition-colors shrink-0"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
