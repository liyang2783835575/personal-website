"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { listProviders } from "@/lib/tts-providers";
import { getAudioTags } from "@/lib/tts-tags";

import useTtsHistory from "./tts/hooks/useTtsHistory";
import useTtsGenerator from "./tts/hooks/useTtsGenerator";
import useVoiceClone from "./tts/hooks/useVoiceClone";
import useStyleTags from "./tts/hooks/useStyleTags";

import TtsProviderModelPicker from "./tts/TtsProviderModelPicker";
import TtsVoiceDesignPanel from "./tts/TtsVoiceDesignPanel";
import TtsVoiceClonePanel from "./tts/TtsVoiceClonePanel";
import TtsVoiceSelector from "./tts/TtsVoiceSelector";
import TtsStyleTagPanel from "./tts/TtsStyleTagPanel";
import TtsAudioTagPanel from "./tts/TtsAudioTagPanel";
import TtsDirectorModePanel, {
  assembleDirectorStyle,
} from "./tts/TtsDirectorModePanel";
import TtsAdvancedSettingsPanel from "./tts/TtsAdvancedSettingsPanel";
import TtsHistoryList from "./tts/TtsHistoryList";
import CollapsibleSection from "./tts/CollapsibleSection";
import { AlertTriangle } from "@/components/icons";

/**
 * Top-level orchestrator. Owns only the high-level state (provider/model
 * selection, text input, format, director-mode, voice-design text) and
 * delegates the rest to focused subcomponents and hooks.
 *
 * Public API (default export) is unchanged from the pre-refactor version
 * so existing consumers (`src/lib/plugins.ts`, `TtsTool.test.tsx`) keep
 * working without modification.
 */
export default function TtsTool() {
  const providers = useMemo(() => listProviders(), []);
  const [selectedProviderId, setSelectedProviderId] = useState("mimo");
  const [selectedModel, setSelectedModel] = useState("mimo-v2.5-tts");
  const [selectedVoice, setSelectedVoice] = useState("冰糖");
  const [text, setText] = useState("你好！欢迎使用语音合成功能。");
  const [format, setFormat] = useState<"mp3" | "wav" | "pcm16">("mp3");
  const [styleDesc, setStyleDesc] = useState("");
  const [voiceDesignDesc, setVoiceDesignDesc] = useState("");

  // Director Mode
  const [directorRole, setDirectorRole] = useState("");
  const [directorScene, setDirectorScene] = useState("");
  const [directorDirection, setDirectorDirection] = useState("");

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // ---- Derived state ----
  const currentProvider = useMemo(
    () => providers.find((p) => p.id === selectedProviderId) ?? providers[0],
    [providers, selectedProviderId],
  );
  const voices = useMemo(() => currentProvider?.voices ?? [], [currentProvider]);
  const models = useMemo(() => currentProvider?.models ?? [], [currentProvider]);
  const isVoiceDesign = selectedModel.includes("voicedesign");
  const isVoiceClone = selectedModel.includes("voiceclone");

  // ---- Hooks ----
  const clone = useVoiceClone();
  const styleTags = useStyleTags({
    selectedProviderId,
    text,
    setText,
    textareaRef,
  });
  const { selectedStyles } = styleTags;
  const { history, removeHistory } = useTtsHistory();
  const directorStyle = assembleDirectorStyle({
    role: directorRole,
    scene: directorScene,
    direction: directorDirection,
  });
  const showDirector = !!(directorRole || directorScene || directorDirection);

  const generator = useTtsGenerator({
    selectedProviderId,
    selectedModel,
    selectedVoice,
    voices,
    isVoiceDesign,
    isVoiceClone,
    format,
    styleDesc,
    showDirector,
    directorStyle,
    voiceDesignDesc,
    cloneAudioBase64: clone.audioBase64,
    selectedStyles,
  });

  const filteredAudioTags = useMemo(
    () => getAudioTags(selectedProviderId),
    [selectedProviderId],
  );

  // ---- Provider switching: reset state that doesn't apply to the new provider ----
  const handleProviderChange = useCallback(
    (providerId: string) => {
      const provider = providers.find((p) => p.id === providerId);
      if (!provider) return;
      setSelectedProviderId(providerId);
      setSelectedModel(provider.defaultModel);
      setSelectedVoice(provider.defaultVoiceId);
      styleTags.clearStyles();
      clone.clear();
    },
    [providers, styleTags, clone],
  );

  // ---- Text-insertion helper for audio tags ----
  const insertAtCursor = useCallback(
    (insertText: string) => {
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
    },
    [],
  );

  // ---- Generate / Preview ----
  const handleGenerate = useCallback(() => {
    if (!text.trim()) return;
    if (isVoiceClone && !clone.audioBase64) {
      generator.setError("请先上传音频样本");
      return;
    }
    void generator.generate(selectedVoice, text.trim(), false);
  }, [text, selectedVoice, generator, isVoiceClone, clone.audioBase64]);

  // ---- Wire clone error back to the generator's error channel ----
  useEffect(() => {
    if (clone.errorMessage) {
      generator.setError(clone.errorMessage);
      clone.setErrorMessage(null);
    }
  }, [clone.errorMessage, clone, generator]);

  const generateLabel = isVoiceDesign
    ? "生成音色"
    : isVoiceClone
      ? "复刻并生成语音"
      : "生成语音";

  return (
    <div className="max-h-[calc(100dvh-14rem)] overflow-y-auto p-4 space-y-4">
      {/* Row 1: Provider + Model */}
      <TtsProviderModelPicker
        providers={providers}
        selectedProviderId={selectedProviderId}
        onProviderChange={handleProviderChange}
        models={models}
        selectedModel={selectedModel}
        onModelChange={setSelectedModel}
      />

      {/* Voice Design Panel */}
      {isVoiceDesign && (
        <TtsVoiceDesignPanel
          value={voiceDesignDesc}
          onChange={setVoiceDesignDesc}
        />
      )}

      {/* Voice Clone Panel */}
      {isVoiceClone && <TtsVoiceClonePanel {...clone} />}

      {/* Voice Selector — dropdown (normal mode) */}
      {!isVoiceDesign && !isVoiceClone && (
        <TtsVoiceSelector
          voices={voices}
          selectedVoice={selectedVoice}
          onChange={setSelectedVoice}
          previewing={generator.previewing}
          onPreview={generator.previewVoice}
        />
      )}

      {/* Style Tags — full width, all visible */}
      {!isVoiceDesign && !isVoiceClone && (
        <TtsStyleTagPanel
          providerId={selectedProviderId}
          selectedStyles={styleTags.selectedStyles}
          customStyleInput={styleTags.customStyleInput}
          setCustomStyleInput={styleTags.setCustomStyleInput}
          filteredCategories={styleTags.filteredCategories}
          toggleStyleTag={styleTags.toggleStyleTag}
          addCustomStyle={styleTags.addCustomStyle}
        />
      )}

      {/* Audio Tags — collapsed by default */}
      {!isVoiceDesign && !isVoiceClone && (
        <CollapsibleSection
          title="音频标签"
          meta={`(${filteredAudioTags.length})`}
        >
          <TtsAudioTagPanel
            tags={filteredAudioTags}
            insertAtCursor={insertAtCursor}
          />
        </CollapsibleSection>
      )}

      {/* Director Mode — collapsed by default */}
      <CollapsibleSection title="导演模式">
        <TtsDirectorModePanel
          role={directorRole}
          scene={directorScene}
          direction={directorDirection}
          onChange={({ role, scene, direction }) => {
            setDirectorRole(role);
            setDirectorScene(scene);
            setDirectorDirection(direction);
          }}
        />
      </CollapsibleSection>

      {/* Advanced Settings — collapsed by default */}
      <CollapsibleSection title="高级设置">
        <TtsAdvancedSettingsPanel
          styleDesc={styleDesc}
          onStyleDescChange={setStyleDesc}
          format={format}
          onFormatChange={setFormat}
        />
      </CollapsibleSection>

      {/* Text Input (hidden for voice design) */}
      {!isVoiceDesign && (
        <div>
          <label className="block text-xs font-mono text-text-secondary mb-1.5 uppercase tracking-wider">
            合成文本
          </label>
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="输入要合成的文本，支持风格标签和音频标签..."
            rows={3}
            className="w-full rounded-xl bg-bg-primary border border-white/10 p-3 text-sm text-text-primary placeholder:text-text-muted focus:border-neon-cyan/50 focus:outline-none focus:shadow-[var(--glow-xs)] transition-all resize-none font-mono"
          />
        </div>
      )}

      {/* Voice Design preview */}
      {isVoiceDesign && voiceDesignDesc && (
        <div className="p-3 rounded-xl border border-neon-purple/10 bg-bg-card">
          <p className="text-xs text-text-muted font-mono mb-1 uppercase tracking-wider">
            音色描述预览
          </p>
          <p className="text-sm text-text-primary font-mono whitespace-pre-wrap">
            {voiceDesignDesc}
          </p>
        </div>
      )}

      {/* Error */}
      {generator.error && (
        <div
          role="alert"
          aria-live="polite"
          className="p-3 rounded-xl bg-neon-magenta/5 border border-neon-magenta/20 text-neon-magenta text-sm font-mono flex items-start gap-2"
        >
          <AlertTriangle
            width={16}
            height={16}
            className="shrink-0 mt-0.5"
          />
          {generator.error}
        </div>
      )}

      {/* Generate Button */}
      <button
        type="button"
        onClick={handleGenerate}
        disabled={!text.trim() || generator.generating}
        className="w-full py-3 rounded-xl bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/30 hover:bg-neon-cyan/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all font-mono text-sm flex items-center justify-center gap-2"
      >
        {generator.generating ? (
          <>
            <span className="w-4 h-4 border-2 border-neon-cyan/30 border-t-neon-cyan rounded-full animate-spin" />
            生成中...
          </>
        ) : (
          <>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            {generateLabel}
          </>
        )}
      </button>

      {/* History */}
      <TtsHistoryList history={history} onDelete={removeHistory} />
    </div>
  );
}
