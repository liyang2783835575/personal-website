"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  isSupported,
  addRecord,
  getAllRecords,
  deleteRecord,
  type TtsHistoryRecord,
} from "@/lib/tts-db";
import type { HistoryItem } from "../types";

const MAX_HISTORY = 5;

/**
 * Manages the in-memory TTS history list plus its IndexedDB persistence.
 *
 * The hook owns the Blob URL lifecycle: every URL created here is revoked
 * on unmount, and URLs are also revoked when an item is deleted or evicted
 * (oldest-first cap at {@link MAX_HISTORY}).
 */
export default function useTtsHistory() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const historyRef = useRef<HistoryItem[]>([]);
  const dbSupportedRef = useRef(isSupported());

  useEffect(() => {
    historyRef.current = history;
  }, [history]);

  // Load records from IndexedDB on mount.
  useEffect(() => {
    if (!dbSupportedRef.current) return;
    getAllRecords()
      .then((records) => {
        const items = records.map((r) => ({
          id: r.id,
          voiceName: r.voiceName,
          text: r.text,
          audioUrl: URL.createObjectURL(r.audioBlob),
          createdAt: r.createdAt,
        }));
        setHistory(items);
      })
      .catch((err) => {
        console.error("[TTS] Failed to load history from IndexedDB:", err);
      });
  }, []);

  // Revoke all Blob URLs on unmount.
  useEffect(() => {
    return () => {
      historyRef.current.forEach((item) => {
        URL.revokeObjectURL(item.audioUrl);
      });
    };
  }, []);

  /**
   * Append a new record. Caps history at MAX_HISTORY items (oldest-first
   * eviction). Persists to IndexedDB if supported.
   */
  const addHistory = useCallback(
    (record: TtsHistoryRecord, audioUrl: string) => {
      setHistory((prev) => {
        let next = [...prev];
        if (next.length >= MAX_HISTORY) {
          const oldest = next.reduce((a, b) =>
            a.createdAt < b.createdAt ? a : b,
          );
          URL.revokeObjectURL(oldest.audioUrl);
          if (dbSupportedRef.current) {
            deleteRecord(oldest.id).catch((err) => {
              console.error("[TTS] Failed to delete oldest record:", err);
            });
          }
          next = next.filter((item) => item.id !== oldest.id);
        }
        return [
          {
            id: record.id,
            voiceName: record.voiceName,
            text: record.text,
            audioUrl,
            createdAt: record.createdAt,
          },
          ...next,
        ];
      });

      if (dbSupportedRef.current) {
        addRecord(record).catch((err) => {
          console.error("[TTS] Failed to save record:", err);
          setHistory((prev) => prev.filter((h) => h.id !== record.id));
          URL.revokeObjectURL(audioUrl);
        });
      }
    },
    [],
  );

  /** Delete one record (and its Blob URL) from memory and IndexedDB. */
  const removeHistory = useCallback((id: string) => {
    setHistory((prev) => {
      const item = prev.find((h) => h.id === id);
      if (item) URL.revokeObjectURL(item.audioUrl);
      return prev.filter((h) => h.id !== id);
    });
    if (dbSupportedRef.current) {
      deleteRecord(id).catch((err) => {
        console.error("[TTS] Failed to delete record:", err);
      });
    }
  }, []);

  return { history, addHistory, removeHistory };
}
