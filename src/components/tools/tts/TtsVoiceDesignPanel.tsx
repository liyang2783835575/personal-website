"use client";

interface Props {
  value: string;
  onChange: (next: string) => void;
}

/**
 * Free-text voice description for the `voicedesign` model family. The MiMo
 * provider uses this string verbatim as a `style` hint.
 */
export default function TtsVoiceDesignPanel({ value, onChange }: Props) {
  return (
    <div>
      <label className="block text-xs font-mono text-text-secondary mb-1.5 uppercase tracking-wider">
        音色描述
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="描述你想要的音色，例如：一个温柔知性的中年女声，语速偏慢，略带沙哑，适合录制有声书…"
        rows={3}
        className="w-full rounded-xl bg-bg-primary border border-neon-purple/20 p-3 text-sm text-text-primary placeholder:text-text-muted focus:border-neon-purple/40 focus:outline-none transition-all resize-none font-mono"
      />
      <p className="text-xs text-text-muted mt-1 font-mono">
        MiMo 会根据描述即时生成一个全新的音色。
      </p>
    </div>
  );
}
