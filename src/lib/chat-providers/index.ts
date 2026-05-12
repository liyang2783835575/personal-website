import type { ChatProvider } from "./types";
import { mimoChatProvider } from "./mimo";
import { minimaxChatProvider } from "./minimax";

const providers: Map<string, ChatProvider> = new Map([
  [mimoChatProvider.id, mimoChatProvider],
  [minimaxChatProvider.id, minimaxChatProvider],
]);

export function getChatProvider(id: string): ChatProvider | undefined {
  return providers.get(id);
}

export function listChatProviders(): ChatProvider[] {
  return Array.from(providers.values());
}

export type { ChatProvider, ChatModel, ChatMessage } from "./types";
