"use client";

import type { Voice } from "@/lib/tts-providers";
import { SELECT_CLASSES, SELECT_STYLE } from "./TtsProviderModelPicker";

interface Props {
  voices: Voice[];
  selectedVoice: string;
  onChange: (voiceId: string) => void;
  previewing: string | null;
  onPreview: (voice: Voice) => void;
}

/**
 * Voice dropdown + 试听 (preview) button. Reuses the chevron styling from
 * the provider picker so all `<select>`s in the tool look identical.
 */
export default function TtsVoiceSelector({
  voices,
  selectedVoice,
  onChange,
  previewing,
  onPreview,
}: Props) {
  return (
    <div>
      <label className="block text-xs font-mono text-text-secondary mb-1.5 uppercase tracking-wider">
        音色
      </label>
      <div className="flex items-center gap-2">
        <select
          value={selectedVoice}
          onChange={(e) => onChange(e.target.value)}
          className={`flex-1 max-w-md ${SELECT_CLASSES}`}
          style={SELECT_STYLE}
        >
          {voices.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name} ({v.gender ?? "—"}, {v.lang})
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => {
            const voice = voices.find((v) => v.id === selectedVoice);
            if (voice) onPreview(voice);
          }}
          disabled={previewing === selectedVoice}
          className="px-3 py-2 rounded-lg text-xs border border-neon-cyan/40 text-neon-cyan hover:bg-neon-cyan/15 transition-all disabled:opacity-50 shrink-0"
        >
          {previewing === selectedVoice ? "试听中..." : "试听"}
        </button>
      </div>
    </div>
  );
}
