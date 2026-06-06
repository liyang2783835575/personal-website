"use client";

import { useState } from "react";

interface AudioTag {
  tag: string;
  label: string;
}

interface Props {
  tags: AudioTag[];
  insertAtCursor: (text: string) => void;
}

/**
 * In-text audio tags (e.g. `[笑]`, `[叹气]`) that get inserted at the
 * textarea caret when the user clicks one. Includes a custom-tag input.
 */
export default function TtsAudioTagPanel({ tags, insertAtCursor }: Props) {
  const [customInput, setCustomInput] = useState("");

  const insertCustom = () => {
    const trimmed = customInput.trim();
    if (!trimmed) return;
    const formatted = trimmed.startsWith("[") ? trimmed : `[${trimmed}]`;
    insertAtCursor(formatted);
    setCustomInput("");
  };

  return (
    <>
      <div className="flex flex-wrap gap-1">
        {tags.map((t) => (
          <button
            key={t.tag}
            type="button"
            onClick={() => insertAtCursor(t.tag)}
            className="px-2 py-0.5 rounded-md text-xs border border-neon-magenta/40 text-neon-magenta/70 hover:bg-neon-magenta/10 hover:border-neon-magenta/60 hover:text-neon-magenta transition-all"
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex gap-1.5">
        <input
          type="text"
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              insertCustom();
            }
          }}
          placeholder="自定义音频标签…"
          className="flex-1 max-w-xs px-2.5 py-1 rounded-lg bg-bg-primary border border-white/10 text-xs text-text-primary placeholder:text-text-muted focus:border-neon-magenta/40 focus:outline-none transition-all font-mono"
        />
        <button
          type="button"
          onClick={insertCustom}
          disabled={!customInput.trim()}
          className="px-3 py-1 rounded-lg text-xs border border-neon-magenta/30 text-neon-magenta hover:bg-neon-magenta/10 disabled:opacity-30 transition-all"
        >
          插入
        </button>
      </div>
    </>
  );
}
