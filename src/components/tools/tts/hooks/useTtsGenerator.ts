"use client";

import { useCallback, useState } from "react";
import { type Voice } from "@/lib/tts-providers";
import { getMiniMaxEmotion, formatStylePrefix } from "@/lib/tts-tags";
import { type TtsHistoryRecord } from "@/lib/tts-db";
import useTtsHistory from "./useTtsHistory";
import useTtsPreview from "./useTtsPreview";
import { base64ToBlob } from "../types";

interface GeneratorArgs {
  selectedProviderId: string;
  selectedModel: string;
  selectedVoice: string;
  voices: Voice[];
  isVoiceDesign: boolean;
  isVoiceClone: boolean;
  format: "mp3" | "wav" | "pcm16";
  styleDesc: string;
  showDirector: boolean;
  directorStyle: string;
  voiceDesignDesc: string;
  cloneAudioBase64: string | null;
  selectedStyles: string[];
}

/**
 * Owns the `POST /api/tts` flow:
 *  - Builds the request body (provider/model/voice/style/format/voiceData).
 *  - Resolves the effective style from director mode, voice-design
 *    description, or selected style tags (MiniMax emotion mapping).
 *  - Converts the base64 response into a Blob and either plays it (preview)
 *    or appends it to history (full generation).
 */
export default function useTtsGenerator(args: GeneratorArgs) {
  const {
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
    cloneAudioBase64,
    selectedStyles,
  } = args;

  const { addHistory } = useTtsHistory();
  const preview = useTtsPreview();
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** Resolve which style string to send in the request body. */
  const resolveEffectiveStyle = useCallback((): string => {
    if (showDirector && directorStyle) return directorStyle;
    if (isVoiceDesign && voiceDesignDesc.trim()) return voiceDesignDesc.trim();
    if (styleDesc) return styleDesc;
    if (selectedProviderId === "minimax" && selectedStyles.length > 0) {
      return getMiniMaxEmotion(selectedStyles) ?? "";
    }
    return "";
  }, [
    showDirector,
    directorStyle,
    isVoiceDesign,
    voiceDesignDesc,
    styleDesc,
    selectedProviderId,
    selectedStyles,
  ]);

  /** Build the JSON body that gets POSTed to `/api/tts`. */
  const buildBody = useCallback(
    (voiceId: string, text: string) => {
      const body: Record<string, unknown> = {
        provider: selectedProviderId,
        model: selectedModel,
        text,
        voice: isVoiceDesign ? undefined : voiceId,
        style: resolveEffectiveStyle() || undefined,
        format,
      };
      if (isVoiceClone && cloneAudioBase64) {
        body.voiceData = cloneAudioBase64;
      }
      return body;
    },
    [
      selectedProviderId,
      selectedModel,
      isVoiceDesign,
      isVoiceClone,
      cloneAudioBase64,
      format,
      resolveEffectiveStyle,
    ],
  );

  /**
   * Speak `textToSpeak` with the given voice. When `isPreview` is true, play
   * it through the preview player (no history). When false, persist to
   * history and trigger UI download.
   */
  const generate = useCallback(
    async (voiceId: string, textToSpeak: string, isPreview = false) => {
      setError(null);

      if (isPreview) {
        if (preview.isBusy()) return;
      } else {
        setGenerating(true);
      }

      try {
        const res = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(buildBody(voiceId, textToSpeak)),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || `生成失败: ${res.status}`);
        }

        const data = await res.json();
        const blob = await base64ToBlob(data.audio, data.format);

        if (isPreview) {
          const url = URL.createObjectURL(blob);
          const audio = new Audio(url);
          preview.start(voiceId, audio, url, (msg) => setError(msg));
          return;
        }

        // Full generation: persist to history.
        const voice = voices.find((v) => v.id === selectedVoice);
        const recordId = crypto.randomUUID();
        const newUrl = URL.createObjectURL(blob);
        const record: TtsHistoryRecord = {
          id: recordId,
          voiceId,
          voiceName: voice?.name || voiceId,
          text: textToSpeak.trim().slice(0, 50),
          audioBlob: blob,
          createdAt: Date.now(),
        };
        addHistory(record, newUrl);
      } catch (err) {
        const message = err instanceof Error ? err.message : "生成失败";
        setError(message);
      } finally {
        if (!isPreview) setGenerating(false);
      }
    },
    [buildBody, preview, voices, selectedVoice, addHistory],
  );

  /** Convenience: kick off a voice demo. */
  const previewVoice = useCallback(
    (voice: Voice) => {
      if (preview.isBusy()) return;
      void generate(voice.id, voice.demoText, true);
    },
    [generate, preview],
  );

  return {
    generating,
    error,
    setError,
    generate,
    previewVoice,
    previewing: preview.previewing,
  };
}

// re-export for callers that need the style formatter too
export { formatStylePrefix };
