"use client";

import type { VoiceCloneState } from "./hooks/useVoiceClone";
import { Trash } from "@/components/icons";

type Props = VoiceCloneState;

/**
 * Audio sample uploader for the `voiceclone` model family. When no sample
 * is selected, shows a dashed drop-zone button (a11y: native `<button
 * type="button">` with `aria-label`). When selected, shows an inline audio
 * preview plus a trash button to clear.
 */
export default function TtsVoiceClonePanel({
  audioBase64,
  audioName,
  previewUrl,
  upload,
  clear,
  fileInputRef,
}: Props) {
  if (!audioBase64) {
    return (
      <div>
        <label className="block text-xs font-mono text-text-secondary mb-1.5 uppercase tracking-wider">
          音频样本
        </label>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full border-2 border-dashed border-white/10 rounded-xl p-6 text-center cursor-pointer hover:border-neon-magenta/30 focus-visible:border-neon-magenta/60 focus-visible:outline-none transition-colors"
          aria-label="上传音频样本（mp3, wav, m4a，最大 5MB）"
        >
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="mx-auto mb-2 text-text-muted"
            aria-hidden="true"
          >
            <path d="M12 16V4M8 8l4-4 4 4" />
            <path d="M20 16v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2" />
          </svg>
          <p className="text-sm text-text-secondary font-mono">点击上传音频样本</p>
          <p className="text-[10px] text-text-muted mt-1 font-mono">
            mp3, wav, m4a, 最大 5MB
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) upload(file);
            }}
            className="hidden"
          />
        </button>
      </div>
    );
  }

  return (
    <div>
      <label className="block text-xs font-mono text-text-secondary mb-1.5 uppercase tracking-wider">
        音频样本
      </label>
      <div className="rounded-xl border border-neon-magenta/20 bg-bg-card p-3">
        <div className="flex items-center gap-3">
          <audio
            src={previewUrl ?? undefined}
            controls
            className="flex-1 h-8"
          />
          <button
            type="button"
            onClick={clear}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-text-muted hover:text-neon-magenta hover:bg-neon-magenta/10 transition-colors shrink-0"
            aria-label="移除音频"
          >
            <Trash width={14} height={14} />
          </button>
        </div>
        <p className="text-[10px] text-text-muted mt-1.5 font-mono truncate">
          {audioName}
        </p>
      </div>
    </div>
  );
}
