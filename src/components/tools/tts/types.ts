/**
 * Shared types and constants for the TTS tool.
 *
 * Kept in its own module so subcomponents and hooks can import without
 * pulling in the full TtsTool component.
 */

export interface HistoryItem {
  id: string;
  voiceName: string;
  text: string;
  audioUrl: string;
  createdAt: number;
}

export const AUDIO_MIME_MAP: Record<string, string> = {
  mp3: "audio/mpeg",
  wav: "audio/wav",
  pcm16: "audio/pcm",
  pcm: "audio/pcm",
};

/**
 * Drop a previously-created base64 string into a Blob the browser can play.
 *
 * Uses the browser's native data: URL handler instead of
 * `atob + Uint8Array.from`. The native path is implemented in optimized
 * C++ and decouples the conversion from the JS main thread (a 5 MB voice
 * clone payload can take 30-50 ms in userland; the data: URL path is
 * typically 2-5× faster and yields to the event loop while in flight).
 */
export async function base64ToBlob(
  base64: string,
  format: string | undefined,
): Promise<Blob> {
  const mime = AUDIO_MIME_MAP[format ?? ""] || "audio/wav";
  const response = await fetch(`data:${mime};base64,${base64}`);
  return response.blob();
}
