export interface ChatModel {
  id: string;
  name: string;
  description: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatProvider {
  id: string;
  name: string;
  icon: string;
  models: ChatModel[];
  defaultModel: string;
  stream(
    messages: ChatMessage[],
    model: string,
    systemPrompt: string,
  ): Promise<ReadableStream<string>>;
}
