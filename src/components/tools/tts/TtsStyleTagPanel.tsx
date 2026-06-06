"use client";

import { formatStylePrefix, getMiniMaxEmotion } from "@/lib/tts-tags";

interface StyleCategory {
  label: string;
  tags: { tag: string; label: string }[];
}

interface Props {
  providerId: string;
  selectedStyles: string[];
  customStyleInput: string;
  setCustomStyleInput: (next: string) => void;
  filteredCategories: StyleCategory[];
  toggleStyleTag: (tag: string) => void;
  addCustomStyle: () => void;
}

/**
 * Multi-select style tags grouped by category, plus a custom-tag input and
 * a hint line that shows the current effective prefix (or MiniMax emotion
 * when on the minimax provider).
 */
export default function TtsStyleTagPanel({
  providerId,
  selectedStyles,
  customStyleInput,
  setCustomStyleInput,
  filteredCategories,
  toggleStyleTag,
  addCustomStyle,
}: Props) {
  return (
    <div>
      <label className="block text-xs font-mono text-text-secondary mb-1.5 uppercase tracking-wider">
        风格标签（多选）
      </label>
      <div className="space-y-2">
        {filteredCategories.map((cat) => (
          <div key={cat.label}>
            <span className="text-[10px] text-text-muted font-mono mr-2">
              {cat.label}
            </span>
            <span className="inline-flex flex-wrap gap-1">
              {cat.tags.map((t) => {
                const isSelected = selectedStyles.includes(t.tag);
                return (
                  <button
                    key={t.tag}
                    type="button"
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
            </span>
          </div>
        ))}
      </div>

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
          className="flex-1 max-w-xs px-2.5 py-1 rounded-lg bg-bg-primary border border-white/10 text-xs text-text-primary placeholder:text-text-muted focus:border-neon-purple/40 focus:outline-none transition-all font-mono"
        />
        <button
          type="button"
          onClick={addCustomStyle}
          disabled={!customStyleInput.trim()}
          className="px-3 py-1 rounded-lg text-xs border border-neon-purple/30 text-neon-purple hover:bg-neon-purple/10 disabled:opacity-30 transition-all"
        >
          添加
        </button>
      </div>

      {selectedStyles.length > 0 && (
        <div className="mt-1.5 text-[10px] text-text-muted font-mono">
          {providerId === "minimax" ? (
            <>
              情绪:{" "}
              <span className="text-neon-purple">
                {getMiniMaxEmotion(selectedStyles) ?? "—"}
              </span>
            </>
          ) : (
            <>
              当前:{" "}
              <span className="text-neon-purple">
                {formatStylePrefix(selectedStyles)}
              </span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
