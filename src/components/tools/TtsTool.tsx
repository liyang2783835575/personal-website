"use client";

import { useState, useCallback, useRef, useEffect } from "react";

export default function TtsTool() {
  const [text, setText] = useState("");
  const [speaking, setSpeaking] = useState(false);
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    return () => {
      speechSynthesis.cancel();
    };
  }, []);

  const speak = useCallback(() => {
    if (!text.trim()) return;

    // Stop any current speech
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.lang = "zh-CN";

    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    utteranceRef.current = utterance;
    speechSynthesis.speak(utterance);
  }, [text, rate, pitch]);

  const stop = useCallback(() => {
    speechSynthesis.cancel();
    setSpeaking(false);
  }, []);

  return (
    <div className="space-y-6">
      {/* Text input */}
      <div>
        <label className="block text-sm font-mono text-text-secondary mb-2">
          输入文字
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="在这里输入要转换的文字..."
          rows={5}
          className="w-full rounded-lg bg-bg-primary border border-white/10 p-3 text-sm text-text-primary placeholder:text-text-muted focus:border-neon-cyan/50 focus:outline-none focus:shadow-[var(--glow-xs)] transition-all resize-none font-mono"
        />
      </div>

      {/* Controls */}
      <div className="space-y-4">
        {/* Rate */}
        <div>
          <div className="flex justify-between mb-1">
            <label className="text-xs font-mono text-text-secondary">
              语速
            </label>
            <span className="text-xs font-mono text-neon-cyan">{rate}x</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={rate}
            onChange={(e) => setRate(parseFloat(e.target.value))}
            className="w-full accent-neon-cyan"
          />
        </div>

        {/* Pitch */}
        <div>
          <div className="flex justify-between mb-1">
            <label className="text-xs font-mono text-text-secondary">
              音调
            </label>
            <span className="text-xs font-mono text-neon-cyan">{pitch}</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={pitch}
            onChange={(e) => setPitch(parseFloat(e.target.value))}
            className="w-full accent-neon-cyan"
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-3">
        <button
          onClick={speak}
          disabled={!text.trim() || speaking}
          className="flex-1 py-2.5 rounded-lg bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/30 hover:bg-neon-cyan/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all font-mono text-sm"
        >
          {speaking ? "播放中..." : "播放"}
        </button>
        <button
          onClick={stop}
          disabled={!speaking}
          className="px-4 py-2.5 rounded-lg border border-neon-magenta/30 text-neon-magenta hover:bg-neon-magenta/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all font-mono text-sm"
        >
          停止
        </button>
      </div>
    </div>
  );
}
