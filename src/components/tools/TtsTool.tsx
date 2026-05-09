"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import {
  isSupported,
  addRecord,
  getAllRecords,
  deleteRecord,
  type TtsHistoryRecord,
} from "@/lib/tts-db";
import {
  listProviders,
  type Voice,
} from "@/lib/tts-providers";
import {
  STYLE_CATEGORIES,
  AUDIO_TAGS as AUDIO_TAG_OPTIONS,
  filterTagsByProvider,
  formatStylePrefix,
} from "@/lib/tts-tags";

const VISIBLE_TAG_COUNT = 6;

const AUDIO_MIME_MAP: Record<string, string> = {
  mp3: "audio/mpeg",
  wav: "audio/wav",
  pcm16: "audio/pcm",
  pcm: "audio/pcm",
};

interface HistoryItem {
  id: string;
  voiceName: string;
  text: string;
  audioUrl: string;
  createdAt: number;
}

export default function TtsTool() {
  const providers = useMemo(() => listProviders(), []);
  const [selectedProviderId, setSelectedProviderId] = useState("mimo");
  const [selectedModel, setSelectedModel] = useState("mimo-v2.5-tts");
  const [text, setText] = useState("你好！欢迎使用语音合成功能。");
  const [selectedVoice, setSelectedVoice] = useState("冰糖");
  const [styleDesc, setStyleDesc] = useState("");
  const [format, setFormat] = useState<"mp3" | "wav" | "pcm16">("mp3");
  const [generating, setGenerating] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [previewing, setPreviewing] = useState<string | null>(null);
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [customStyleInput, setCustomStyleInput] = useState("");
  const [customAudioInput, setCustomAudioInput] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  // Voice Design state
  const [voiceDesignDesc, setVoiceDesignDesc] = useState("");

  // Voice Clone state
  const [cloneAudioBase64, setCloneAudioBase64] = useState<string | null>(null);
  const [cloneAudioName, setCloneAudioName] = useState("");
  const [clonePreviewUrl, setClonePreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Director Mode state
  const [showDirector, setShowDirector] = useState(false);
  const [directorRole, setDirectorRole] = useState("");
  const [directorScene, setDirectorScene] = useState("");
  const [directorDirection, setDirectorDirection] = useState("");

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);
  const previewUrlRef = useRef<string | null>(null);
  const previewingRef = useRef(false);
  const historyRef = useRef<HistoryItem[]>([]);
  useEffect(() => {
    historyRef.current = history;
  }, [history]);
  const dbSupportedRef = useRef(isSupported());

  const currentProvider = useMemo(
    () => providers.find((p) => p.id === selectedProviderId) ?? providers[0],
    [providers, selectedProviderId]
  );

  const voices = useMemo(() => currentProvider?.voices ?? [], [currentProvider]);
  const models = useMemo(() => currentProvider?.models ?? [], [currentProvider]);

  const isVoiceDesign = selectedModel.includes("voicedesign");
  const isVoiceClone = selectedModel.includes("voiceclone");

  // Sync selected model when provider changes
  const handleProviderChange = useCallback((providerId: string) => {
    const provider = providers.find((p) => p.id === providerId);
    if (provider) {
      setSelectedProviderId(providerId);
      setSelectedModel(provider.defaultModel);
      setSelectedVoice(provider.defaultVoiceId);
      setSelectedStyles([]);
      setCloneAudioBase64(null);
      setCloneAudioName("");
      setClonePreviewUrl(null);
    }
  }, [providers]);

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
      .catch((err) => {
        console.error("[TTS] Failed to load history from IndexedDB:", err);
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
      if (clonePreviewUrl) {
        URL.revokeObjectURL(clonePreviewUrl);
      }
    };
  }, [clonePreviewUrl]);

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

  const insertCustomAudioTag = useCallback(() => {
    const tag = customAudioInput.trim();
    if (!tag) return;
    const formatted = tag.startsWith("[") ? tag : `[${tag}]`;
    insertAtCursor(formatted);
    setCustomAudioInput("");
  }, [customAudioInput, insertAtCursor]);

  const toggleStyleTag = useCallback((tag: string) => {
    setSelectedStyles((prev) => {
      const next = prev.includes(tag)
        ? prev.filter((t) => t !== tag)
        : [...prev, tag];

      const prefix = formatStylePrefix(next);
      setText((currentText) => {
        const styleRegex = /^\([^)]*\)\s*/;
        if (prefix) {
          return styleRegex.test(currentText)
            ? currentText.replace(styleRegex, prefix)
            : `${prefix}${currentText}`;
        } else {
          return currentText.replace(styleRegex, "");
        }
      });

      return next;
    });
    textareaRef.current?.focus();
  }, []);

  const addCustomStyle = useCallback(() => {
    const tag = customStyleInput.trim();
    if (!tag) return;
    toggleStyleTag(tag);
    setCustomStyleInput("");
  }, [customStyleInput, toggleStyleTag]);

  const toggleCategory = useCallback((label: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  }, []);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate audio type
    if (!file.type.startsWith("audio/")) {
      setError("请选择音频文件");
      return;
    }

    // Max 5MB
    if (file.size > 5 * 1024 * 1024) {
      setError("音频文件不能超过 5MB");
      return;
    }

    setError(null);
    setCloneAudioName(file.name);

    // Revoke previous preview
    if (clonePreviewUrl) {
      URL.revokeObjectURL(clonePreviewUrl);
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        const base64 = reader.result.split(",")[1];
        setCloneAudioBase64(base64);
      }
    };
    reader.onerror = () => {
      setError("音频文件读取失败，请重试或更换文件");
      setCloneAudioName("");
    };
    reader.onabort = () => {
      setCloneAudioName("");
    };
    reader.readAsDataURL(file);

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setClonePreviewUrl(previewUrl);
  }, [clonePreviewUrl]);

  const clearCloneAudio = useCallback(() => {
    setCloneAudioBase64(null);
    setCloneAudioName("");
    if (clonePreviewUrl) {
      URL.revokeObjectURL(clonePreviewUrl);
      setClonePreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [clonePreviewUrl]);

  const assembleDirectorStyle = useCallback(() => {
    const parts: string[] = [];
    if (directorRole.trim()) parts.push(`角色：${directorRole.trim()}`);
    if (directorScene.trim()) parts.push(`场景：${directorScene.trim()}`);
    if (directorDirection.trim()) parts.push(`指导：${directorDirection.trim()}`);
    return parts.join("；");
  }, [directorRole, directorScene, directorDirection]);

  const generateSpeech = useCallback(async (voiceId: string, textToSpeak: string, isPreview = false) => {
    setError(null);

    if (isPreview) {
      setPreviewing(voiceId);
      previewingRef.current = true;
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

    // Build style from director mode or manual input
    let effectiveStyle = styleDesc;
    if (showDirector) {
      const directorStyle = assembleDirectorStyle();
      effectiveStyle = directorStyle || styleDesc;
    }
    if (isVoiceDesign && voiceDesignDesc.trim()) {
      effectiveStyle = voiceDesignDesc.trim();
    }

    try {
      const body: Record<string, unknown> = {
        provider: selectedProviderId,
        model: selectedModel,
        text: textToSpeak,
        voice: isVoiceDesign ? undefined : voiceId,
        style: effectiveStyle || undefined,
        format,
      };

      if (isVoiceClone && cloneAudioBase64) {
        body.voiceData = cloneAudioBase64;
      }

      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `生成失败: ${res.status}`);
      }

      const data = await res.json();
      const audioData = data.audio;

      const byteArray = Uint8Array.from(atob(audioData), (c) => c.charCodeAt(0));
      const blob = new Blob([byteArray], { type: AUDIO_MIME_MAP[data.format] || "audio/wav" });

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
          previewingRef.current = false;
          setPreviewing(null);
        };

        previewAudio.onerror = () => {
          if (previewUrlRef.current === url) {
            URL.revokeObjectURL(url);
            previewUrlRef.current = null;
          }
          previewAudioRef.current = null;
          previewingRef.current = false;
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
          previewingRef.current = false;
          setPreviewing(null);
          setError("无法播放音频，请检查浏览器设置");
        }
      } else {
        const voice = voices.find((v) => v.id === selectedVoice);
        const recordId = crypto.randomUUID();
        const newUrl = URL.createObjectURL(blob);
        const record: TtsHistoryRecord = {
          id: recordId,
          voiceId: voiceId,
          voiceName: voice?.name || voiceId,
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
              deleteRecord(oldest.id).catch((err) => {
                console.error("[TTS] Failed to delete oldest record:", err);
              });
            }
            next = next.filter((item) => item.id !== oldest.id);
          }
          return [
            {
              id: recordId,
              voiceName: record.voiceName,
              text: record.text,
              audioUrl: newUrl,
              createdAt: record.createdAt,
            },
            ...next,
          ];
        });

        if (dbSupportedRef.current) {
          addRecord(record).catch((err) => {
            console.error("[TTS] Failed to save record:", err);
            setHistory((prev) => prev.filter((h) => h.id !== recordId));
            URL.revokeObjectURL(newUrl);
          });
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "生成失败";
      setError(message);
      if (isPreview) {
        previewingRef.current = false;
        setPreviewing(null);
      } else {
        setGenerating(false);
      }
    } finally {
      if (!isPreview) {
        setGenerating(false);
      }
    }
  }, [
    styleDesc, format, selectedVoice, selectedProviderId, selectedModel, voices,
    isVoiceDesign, isVoiceClone, voiceDesignDesc, cloneAudioBase64,
    showDirector, assembleDirectorStyle,
  ]);

  const handleGenerate = useCallback(() => {
    if (!text.trim()) return;
    if (isVoiceClone && !cloneAudioBase64) {
      setError("请先上传音频样本");
      return;
    }
    generateSpeech(selectedVoice, text.trim(), false);
  }, [text, selectedVoice, generateSpeech, isVoiceClone, cloneAudioBase64]);

  const handlePreview = useCallback((voice: Voice) => {
    if (previewingRef.current) return;
    generateSpeech(voice.id, voice.demoText, true);
  }, [generateSpeech]);

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
      deleteRecord(id).catch((err) => {
        console.error("[TTS] Failed to delete record:", err);
      });
    }
  }, []);

  const filteredCategories = useMemo(() => {
    return STYLE_CATEGORIES.map((cat) => ({
      ...cat,
      tags: filterTagsByProvider(cat.tags, selectedProviderId),
    })).filter((cat) => cat.tags.length > 0);
  }, [selectedProviderId]);

  const filteredAudioTags = useMemo(
    () => filterTagsByProvider(AUDIO_TAG_OPTIONS, selectedProviderId),
    [selectedProviderId]
  );

  const generateLabel = isVoiceDesign ? "生成音色"
    : isVoiceClone ? "复刻并生成语音"
    : "生成语音";

  return (
    <div className="space-y-5">
      {/* Provider Selector */}
      <div>
        <label className="block text-xs font-mono text-text-secondary mb-2 uppercase tracking-wider">
          Provider
        </label>
        <div className="flex gap-2">
          {providers.map((p) => (
            <button
              key={p.id}
              onClick={() => handleProviderChange(p.id)}
              className={`px-4 py-2 rounded-lg text-sm border transition-all ${
                selectedProviderId === p.id
                  ? "border-neon-cyan/60 bg-neon-cyan/10 text-neon-cyan"
                  : "border-white/10 text-text-secondary hover:border-white/20"
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Model Selector */}
      {models.length > 1 && (
        <div>
          <label className="block text-xs font-mono text-text-secondary mb-2 uppercase tracking-wider">
            模型
          </label>
          <div className="flex gap-2 flex-wrap">
            {models.map((m) => (
              <button
                key={m.id}
                onClick={() => setSelectedModel(m.id)}
                className={`px-3 py-1.5 rounded-lg text-xs border transition-all ${
                  selectedModel === m.id
                    ? "border-neon-cyan/60 bg-neon-cyan/10 text-neon-cyan"
                    : "border-white/10 text-text-secondary hover:border-white/20"
                }`}
                title={m.description}
              >
                {m.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Voice Design Panel (when voicedesign model selected) */}
      {isVoiceDesign && (
        <div>
          <label className="block text-xs font-mono text-text-secondary mb-2 uppercase tracking-wider">
            音色描述
          </label>
          <textarea
            value={voiceDesignDesc}
            onChange={(e) => setVoiceDesignDesc(e.target.value)}
            placeholder="描述你想要的音色，例如：一个温柔知性的中年女声，语速偏慢，略带沙哑，适合录制有声书…"
            rows={3}
            className="w-full rounded-xl bg-bg-primary border border-neon-purple/20 p-3 text-sm text-text-primary placeholder:text-text-muted focus:border-neon-purple/40 focus:outline-none transition-all resize-none font-mono"
          />
          <p className="text-xs text-text-muted mt-1 font-mono">
            MiMo 会根据描述即时生成一个全新的音色。不保留音色，每次生成即时设计。
          </p>
        </div>
      )}

      {/* Voice Clone Panel (when voiceclone model selected) */}
      {isVoiceClone && (
        <div>
          <label className="block text-xs font-mono text-text-secondary mb-2 uppercase tracking-wider">
            音频样本
          </label>
          {!cloneAudioBase64 ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-white/10 rounded-xl p-6 text-center cursor-pointer hover:border-neon-magenta/30 transition-colors"
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto mb-2 text-text-muted">
                <path d="M12 16V4M8 8l4-4 4 4" />
                <path d="M20 16v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2" />
              </svg>
              <p className="text-sm text-text-secondary font-mono">点击上传音频样本</p>
              <p className="text-[10px] text-text-muted mt-1 font-mono">支持 mp3, wav, m4a 等格式，最大 5MB</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          ) : (
            <div className="rounded-xl border border-neon-magenta/20 bg-bg-card p-3">
              <div className="flex items-center gap-3">
                <audio src={clonePreviewUrl ?? undefined} controls className="flex-1 h-8" />
                <button
                  onClick={clearCloneAudio}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-text-muted hover:text-neon-magenta hover:bg-neon-magenta/10 transition-colors shrink-0"
                  aria-label="移除音频"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                  </svg>
                </button>
              </div>
              <p className="text-[10px] text-text-muted mt-1.5 font-mono truncate">{cloneAudioName}</p>
            </div>
          )}
        </div>
      )}

      {/* Voice Selection Cards (hidden for voice design/clone) */}
      {!isVoiceDesign && !isVoiceClone && (
        <div>
          <label className="block text-xs font-mono text-text-secondary mb-2 uppercase tracking-wider">
            选择音色
          </label>
          <div className="grid grid-cols-3 gap-2">
            {voices.map((voice) => (
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
      )}

      {/* Style Tags (hidden for voice design/clone since style is handled differently) */}
      {!isVoiceDesign && !isVoiceClone && (
        <div>
          <label className="block text-xs font-mono text-text-secondary mb-2 uppercase tracking-wider">
            风格标签（多选，点击切换）
          </label>
          {filteredCategories.map((cat) => {
            const isExpanded = expandedCategories[cat.label] ?? false;
            const visibleTags = isExpanded ? cat.tags : cat.tags.slice(0, VISIBLE_TAG_COUNT);
            const hasMore = cat.tags.length > VISIBLE_TAG_COUNT;

            return (
              <div key={cat.label} className="mb-2 last:mb-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[10px] text-text-muted font-mono">{cat.label}</span>
                  {hasMore && (
                    <button
                      onClick={() => toggleCategory(cat.label)}
                      className="text-[10px] text-neon-cyan/60 hover:text-neon-cyan transition-colors"
                    >
                      {isExpanded ? "收起" : `更多(${cat.tags.length - VISIBLE_TAG_COUNT})`}
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-1">
                  {visibleTags.map((t) => {
                    const isSelected = selectedStyles.includes(t.tag);
                    return (
                      <button
                        key={t.tag}
                        onClick={() => toggleStyleTag(t.tag)}
                        className={`px-2 py-0.5 rounded-md text-xs border transition-all ${
                          isSelected
                            ? "border-neon-purple/60 bg-neon-purple/15 text-neon-purple"
                            : "border-neon-purple/20 text-neon-purple/60 hover:border-neon-purple/40 hover:text-neon-purple"
                        }`}
                      >
                        {t.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          <div className="flex gap-1.5 mt-2">
            <input
              type="text"
              value={customStyleInput}
              onChange={(e) => setCustomStyleInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addCustomStyle();
                }
              }}
              placeholder="自定义风格标签…"
              className="flex-1 px-2.5 py-1 rounded-lg bg-bg-primary border border-white/10 text-xs text-text-primary placeholder:text-text-muted focus:border-neon-purple/40 focus:outline-none transition-all font-mono"
            />
            <button
              onClick={addCustomStyle}
              disabled={!customStyleInput.trim()}
              className="px-3 py-1 rounded-lg text-xs border border-neon-purple/30 text-neon-purple hover:bg-neon-purple/10 disabled:opacity-30 transition-all"
            >
              添加
            </button>
          </div>

          {selectedStyles.length > 0 && (
            <div className="mt-1.5 text-[10px] text-text-muted font-mono">
              当前: <span className="text-neon-purple">{formatStylePrefix(selectedStyles)}</span>
            </div>
          )}
        </div>
      )}

      {/* Audio Tags */}
      {!isVoiceDesign && !isVoiceClone && (
        <div>
          <label className="block text-xs font-mono text-text-secondary mb-2 uppercase tracking-wider">
            音频标签（点击插入光标位置）
          </label>
          <div className="flex flex-wrap gap-1">
            {filteredAudioTags.map((t) => (
              <button
                key={t.tag}
                onClick={() => insertAtCursor(t.tag)}
                className="px-2 py-0.5 rounded-md text-xs border border-neon-magenta/40 text-neon-magenta/70 hover:bg-neon-magenta/10 hover:border-neon-magenta/60 hover:text-neon-magenta transition-all"
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="flex gap-1.5 mt-2">
            <input
              type="text"
              value={customAudioInput}
              onChange={(e) => setCustomAudioInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  insertCustomAudioTag();
                }
              }}
              placeholder="自定义音频标签…"
              className="flex-1 px-2.5 py-1 rounded-lg bg-bg-primary border border-white/10 text-xs text-text-primary placeholder:text-text-muted focus:border-neon-magenta/40 focus:outline-none transition-all font-mono"
            />
            <button
              onClick={insertCustomAudioTag}
              disabled={!customAudioInput.trim()}
              className="px-3 py-1 rounded-lg text-xs border border-neon-magenta/30 text-neon-magenta hover:bg-neon-magenta/10 disabled:opacity-30 transition-all"
            >
              插入
            </button>
          </div>
        </div>
      )}

      {/* Text Input (hidden for voice design since we use voiceDesignDesc) */}
      {!isVoiceDesign && (
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
            提示: 上方选择风格标签自动添加前缀，点击音频标签插入到光标位置。也支持自定义标签。
          </p>
        </div>
      )}

      {/* Director Mode */}
      <div>
        <button
          onClick={() => setShowDirector(!showDirector)}
          aria-expanded={showDirector}
          aria-controls="director-panel"
          className="text-xs font-mono text-text-secondary hover:text-neon-cyan transition-colors flex items-center gap-1"
        >
          <span>{showDirector ? "▼" : "▶"}</span>
          导演模式
        </button>

        {showDirector && (
          <div
            id="director-panel"
            className="mt-3 space-y-3 pl-4 border-l border-white/5"
          >
            <div>
              <label className="block text-xs font-mono text-text-secondary mb-1">
                角色
              </label>
              <input
                type="text"
                value={directorRole}
                onChange={(e) => setDirectorRole(e.target.value)}
                placeholder="例如: 一位年迈的智者"
                className="w-full rounded-lg bg-bg-primary border border-white/10 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-neon-cyan/50 focus:outline-none transition-all font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-text-secondary mb-1">
                场景
              </label>
              <input
                type="text"
                value={directorScene}
                onChange={(e) => setDirectorScene(e.target.value)}
                placeholder="例如: 在篝火旁讲述古老的传说"
                className="w-full rounded-lg bg-bg-primary border border-white/10 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-neon-cyan/50 focus:outline-none transition-all font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-text-secondary mb-1">
                指导
              </label>
              <input
                type="text"
                value={directorDirection}
                onChange={(e) => setDirectorDirection(e.target.value)}
                placeholder="例如: 语速缓慢而庄重，声音低沉有回声，在说到'古老'时加重语气"
                className="w-full rounded-lg bg-bg-primary border border-white/10 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-neon-cyan/50 focus:outline-none transition-all font-mono"
              />
            </div>
            <p className="text-xs text-text-muted font-mono">
              导演模式将角色、场景、指导组合为自然语言风格描述，通过 user role 传给模型。
            </p>
          </div>
        )}
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
            {generateLabel}
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
