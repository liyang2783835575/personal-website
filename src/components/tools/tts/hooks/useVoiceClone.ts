"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export interface VoiceCloneState {
  audioBase64: string | null;
  audioName: string;
  previewUrl: string | null;
  errorMessage: string | null;
  upload: (file: File) => void;
  clear: () => void;
  setErrorMessage: (msg: string | null) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}

/**
 * Owns the voice-clone sample upload: validates file type and size, base64
 * encodes the audio, and creates a preview URL for the inline player.
 */
export default function useVoiceClone(): VoiceCloneState {
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  const [audioName, setAudioName] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Revoke preview URL on unmount.
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const upload = useCallback((file: File) => {
    if (!file.type.startsWith("audio/")) {
      setErrorMessage("请选择音频文件");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setErrorMessage("音频文件不能超过 5MB");
      return;
    }

    setErrorMessage(null);
    setAudioName(file.name);

    // Revoke previous preview before creating a new one.
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        const base64 = reader.result.split(",")[1];
        setAudioBase64(base64);
      }
    };
    reader.onerror = () => {
      setErrorMessage("音频文件读取失败，请重试或更换文件");
      setAudioName("");
    };
    reader.onabort = () => {
      setAudioName("");
    };
    reader.readAsDataURL(file);
  }, []);

  const clear = useCallback(() => {
    setAudioBase64(null);
    setAudioName("");
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  return {
    audioBase64,
    audioName,
    previewUrl,
    errorMessage,
    upload,
    clear,
    setErrorMessage,
    fileInputRef,
  };
}
