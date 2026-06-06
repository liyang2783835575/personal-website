"use client";

interface Props {
  styleDesc: string;
  onStyleDescChange: (next: string) => void;
  format: "mp3" | "wav" | "pcm16";
  onFormatChange: (next: "mp3" | "wav" | "pcm16") => void;
}

const FORMATS: ("mp3" | "wav" | "pcm16")[] = ["mp3", "wav", "pcm16"];

/**
 * Natural-language style override + audio format selector. Rendered inside
 * a `<CollapsibleSection title="高级设置">` at the parent.
 */
export default function TtsAdvancedSettingsPanel({
  styleDesc,
  onStyleDescChange,
  format,
  onFormatChange,
}: Props) {
  return (
    <>
      <div>
        <label className="block text-xs font-mono text-text-secondary mb-1">
          自然语言风格描述（可选）
        </label>
        <input
          type="text"
          value={styleDesc}
          onChange={(e) => onStyleDescChange(e.target.value)}
          placeholder="例如: 温柔且略带疲惫的女声，语速缓慢"
          className="w-full rounded-lg bg-bg-primary border border-white/10 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-neon-cyan/50 focus:outline-none transition-all font-mono"
        />
      </div>
      <div>
        <label className="block text-xs font-mono text-text-secondary mb-1">
          音频格式
        </label>
        <div className="flex gap-2">
          {FORMATS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => onFormatChange(f)}
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
    </>
  );
}
