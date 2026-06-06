"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Single-voice preview player. Only one preview can play at a time;
 * starting a new one stops and revokes the previous one.
 */
export default function useTtsPreview() {
  const [previewing, setPreviewing] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const urlRef = useRef<string | null>(null);
  const busyRef = useRef(false);

  // Stop & revoke on unmount.
  useEffect(() => {
    return () => {
      if (audioRef.current) audioRef.current.pause();
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    };
  }, []);

  /**
   * Start playing `audio` (an HTMLAudioElement the caller has just created
   * from a Blob URL) and tag it with `voiceId` for UI state. Stops any
   * currently-playing preview first. Cleans up the URL on natural end or
   * error; reports play-time errors via `onError`.
   */
  const start = useCallback(
    (
      voiceId: string,
      audio: HTMLAudioElement,
      url: string,
      onError?: (msg: string) => void,
    ) => {
      // Stop & revoke previous preview, if any.
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (urlRef.current) {
        URL.revokeObjectURL(urlRef.current);
        urlRef.current = null;
      }

      busyRef.current = true;
      setPreviewing(voiceId);
      audioRef.current = audio;
      urlRef.current = url;

      const cleanup = (errorMsg?: string) => {
        if (urlRef.current === url) {
          URL.revokeObjectURL(url);
          urlRef.current = null;
        }
        if (audioRef.current === audio) {
          audioRef.current = null;
        }
        busyRef.current = false;
        setPreviewing(null);
        if (errorMsg) onError?.(errorMsg);
      };

      audio.onended = () => cleanup();
      audio.onerror = () => cleanup("音频播放失败");

      audio.play().catch(() => {
        cleanup("无法播放音频，请检查浏览器设置");
      });
    },
    [],
  );

  /** True if a preview is currently in flight. Read by the disable-guard. */
  const isBusy = useCallback(() => busyRef.current, []);

  return { previewing, start, isBusy };
}
