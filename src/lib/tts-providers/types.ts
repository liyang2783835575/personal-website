export const TTS_AUDIO_FORMATS = ["mp3", "wav", "pcm16"] as const;
export type TtsAudioFormat = (typeof TTS_AUDIO_FORMATS)[number];

export interface TtsRequest {
  text: string;
  voice: string;
  format: TtsAudioFormat;
  model: string;
  style?: string;
  speed?: number;
  pitch?: number;
  volume?: number;
  voiceData?: string; // base64 audio for voiceclone
}

export interface TtsResponse {
  audioBase64: string;
  format: string;
}

export interface Voice {
  id: string;
  name: string;
  lang: string;
  gender: string;
  demoText: string;
}

export interface TtsModel {
  id: string;
  name: string;
  description: string;
}

export interface TtsProvider {
  id: string;
  name: string;
  models: TtsModel[];
  defaultModel: string;
  defaultVoiceId: string;
  voices: Voice[];
  generate(req: TtsRequest): Promise<TtsResponse>;
}
