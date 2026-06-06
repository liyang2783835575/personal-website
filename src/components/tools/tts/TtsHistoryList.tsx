"use client";

import type { HistoryItem } from "./types";
import { Trash } from "@/components/icons";

interface Props {
  history: HistoryItem[];
  onDelete: (id: string) => void;
}

/**
 * Audio history list with inline players and per-item delete buttons. Shows
 * a dashed empty-state placeholder when no history exists (P2-6).
 */
export default function TtsHistoryList({ history, onDelete }: Props) {
  return (
    <div>
      <label className="block text-xs font-mono text-text-secondary mb-2 uppercase tracking-wider">
        生成记录
      </label>
      {history.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/10 bg-bg-card/50 p-6 text-center">
          <p className="text-xs text-text-muted font-mono">
            暂无记录 · 填写文本后点击「生成」即可听到
          </p>
        </div>
      ) : (
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
                type="button"
                onClick={() => onDelete(item.id)}
                aria-label="删除"
                className="w-7 h-7 rounded-lg flex items-center justify-center text-text-muted hover:text-neon-magenta hover:bg-neon-magenta/10 transition-colors shrink-0"
              >
                <Trash width={14} height={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
