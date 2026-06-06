"use client";

import type { TtsProvider } from "@/lib/tts-providers";
import ProviderModelPicker, {
  SELECT_CLASSES,
  SELECT_STYLE,
} from "@/components/tools/ProviderModelPicker";

interface Props {
  providers: TtsProvider[];
  selectedProviderId: string;
  onProviderChange: (providerId: string) => void;
  models: TtsProvider["models"];
  selectedModel: string;
  onModelChange: (modelId: string) => void;
  disabled?: boolean;
}

/**
 * TTS-flavoured wrapper around the shared `ProviderModelPicker`.
 * Re-exports the chevron styling for `TtsVoiceSelector` which lives
 * in the same folder and shares the same dropdown look.
 */
export default function TtsProviderModelPicker({
  providers,
  selectedProviderId,
  onProviderChange,
  models,
  selectedModel,
  onModelChange,
  disabled,
}: Props) {
  return (
    <ProviderModelPicker
      providers={providers}
      selectedProviderId={selectedProviderId}
      onProviderChange={onProviderChange}
      models={models}
      selectedModel={selectedModel}
      onModelChange={onModelChange}
      providerLabel="Provider"
      modelLabel="模型"
      disabled={disabled}
    />
  );
}

export { SELECT_CLASSES, SELECT_STYLE };
