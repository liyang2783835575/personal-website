"use client";

/**
 * Generic provider + model picker.
 *
 * Shared by `ChatTool` and `TtsProviderModelPicker` to dedupe the
 * dropdown + chip-button markup. Accepts the minimum required fields
 * from `ChatProvider` / `TtsProvider` via structural typing.
 */

interface ModelLike {
  id: string;
  name: string;
  description: string;
}

interface ProviderLike {
  id: string;
  name: string;
  icon?: string;
  models: ModelLike[];
}

interface Props<P extends ProviderLike> {
  providers: P[];
  selectedProviderId: string;
  onProviderChange: (providerId: string) => void;
  models: ModelLike[];
  selectedModel: string;
  onModelChange: (modelId: string) => void;
  providerLabel: string;
  modelLabel: string;
  showProviderIcon?: boolean;
  disabled?: boolean;
}

const CHEVRON_SVG =
  "url(\"data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%238888aa' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")";

const SELECT_CLASSES =
  "w-full rounded-lg bg-bg-primary border border-white/10 px-3 py-2 text-sm text-text-primary focus:border-neon-cyan/50 focus:outline-none transition-all font-mono cursor-pointer appearance-none disabled:opacity-50";

const SELECT_STYLE = {
  backgroundImage: CHEVRON_SVG,
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 12px center",
  paddingRight: "2rem",
} as const;

/** Re-exported for callers (e.g. TtsVoiceSelector) that share the chevron. */
export { SELECT_CLASSES, SELECT_STYLE, CHEVRON_SVG };

export default function ProviderModelPicker<P extends ProviderLike>({
  providers,
  selectedProviderId,
  onProviderChange,
  models,
  selectedModel,
  onModelChange,
  providerLabel,
  modelLabel,
  showProviderIcon = false,
  disabled = false,
}: Props<P>) {
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-mono text-text-secondary mb-1.5 uppercase tracking-wider">
          {providerLabel}
        </label>
        <select
          value={selectedProviderId}
          onChange={(e) => onProviderChange(e.target.value)}
          disabled={disabled}
          className={SELECT_CLASSES}
          style={SELECT_STYLE}
        >
          {providers.map((p) => (
            <option key={p.id} value={p.id}>
              {showProviderIcon && p.icon ? `${p.icon} ${p.name}` : p.name}
            </option>
          ))}
        </select>
      </div>

      {models.length > 1 && (
        <div>
          <label className="block text-xs font-mono text-text-secondary mb-1.5 uppercase tracking-wider">
            {modelLabel}
          </label>
          <div className="flex gap-1.5 flex-wrap">
            {models.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => onModelChange(m.id)}
                disabled={disabled}
                className={`px-2.5 py-1.5 rounded-lg text-[11px] border transition-all disabled:opacity-50 ${
                  selectedModel === m.id
                    ? "border-neon-cyan/60 bg-neon-cyan/10 text-neon-cyan"
                    : "border-white/10 text-text-secondary hover:border-white/20"
                }`}
                title={m.description}
              >
                {m.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
