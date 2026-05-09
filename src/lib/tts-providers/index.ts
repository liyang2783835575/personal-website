import type { TtsProvider } from "./types";
import { mimoProvider } from "./mimo";
import { minimaxProvider } from "./minimax";

export const PROVIDER_IDS = [mimoProvider.id, minimaxProvider.id] as const;
export type ProviderId = (typeof PROVIDER_IDS)[number];

const providers: Map<string, TtsProvider> = new Map([
  [mimoProvider.id, mimoProvider],
  [minimaxProvider.id, minimaxProvider],
]);

export function getProvider(id: string): TtsProvider | undefined {
  return providers.get(id);
}

export function listProviders(): TtsProvider[] {
  return Array.from(providers.values());
}

export { mimoProvider, minimaxProvider };
export type { TtsProvider, TtsRequest, TtsResponse, Voice, TtsModel } from "./types";
