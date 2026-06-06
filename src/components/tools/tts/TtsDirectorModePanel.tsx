"use client";

interface Props {
  role: string;
  scene: string;
  direction: string;
  onChange: (next: { role: string; scene: string; direction: string }) => void;
}

/**
 * Three free-text inputs (角色/场景/指导) that combine into a single natural-
 * language style description, sent to the TTS model as `style`.
 */
export default function TtsDirectorModePanel({
  role,
  scene,
  direction,
  onChange,
}: Props) {
  const update = (
    patch: Partial<{ role: string; scene: string; direction: string }>,
  ) => onChange({ role, scene, direction, ...patch });

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-mono text-text-secondary mb-1">
            角色
          </label>
          <input
            type="text"
            value={role}
            onChange={(e) => update({ role: e.target.value })}
            placeholder="例如: 一位年迈的智者"
            className="w-full rounded-lg bg-bg-primary border border-white/10 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-neon-cyan/50 focus:outline-none transition-all font-mono"
          />
        </div>
        <div>
          <label className="block text-xs font-mono text-text-secondary mb-1">
            场景
          </label>
          <input
            type="text"
            value={scene}
            onChange={(e) => update({ scene: e.target.value })}
            placeholder="例如: 在篝火旁讲述古老的传说"
            className="w-full rounded-lg bg-bg-primary border border-white/10 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-neon-cyan/50 focus:outline-none transition-all font-mono"
          />
        </div>
        <div>
          <label className="block text-xs font-mono text-text-secondary mb-1">
            指导
          </label>
          <input
            type="text"
            value={direction}
            onChange={(e) => update({ direction: e.target.value })}
            placeholder="例如: 语速缓慢而庄重，声音低沉有回声"
            className="w-full rounded-lg bg-bg-primary border border-white/10 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-neon-cyan/50 focus:outline-none transition-all font-mono"
          />
        </div>
      </div>
      <p className="text-xs text-text-muted font-mono">
        角色/场景/指导组合为自然语言风格描述，通过 user role 传给模型。
      </p>
    </>
  );
}

/** Helper: join the three director fields into a single semicolon-joined string. */
export function assembleDirectorStyle(args: {
  role: string;
  scene: string;
  direction: string;
}): string {
  const parts: string[] = [];
  if (args.role.trim()) parts.push(`角色：${args.role.trim()}`);
  if (args.scene.trim()) parts.push(`场景：${args.scene.trim()}`);
  if (args.direction.trim()) parts.push(`指导：${args.direction.trim()}`);
  return parts.join("；");
}
