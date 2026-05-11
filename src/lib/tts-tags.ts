export interface TagOption {
  label: string;
  tag: string;
  provider?: string; // undefined = all providers
}

export interface TagCategory {
  label: string;
  tags: TagOption[];
}

// ========== Style Tags (prefix) ==========
// MiMo: (标签) format embedded in text
// MiniMax: emotion parameter, but also supports (tag) as paralinguistic cues

const EMOTION_TAGS: TagOption[] = [
  { label: "开心", tag: "开心" },
  { label: "悲伤", tag: "悲伤" },
  { label: "愤怒", tag: "愤怒" },
  { label: "恐惧", tag: "恐惧" },
  { label: "厌恶", tag: "厌恶" },
  { label: "惊讶", tag: "惊讶" },
  { label: "中性", tag: "中性" },
  { label: "兴奋", tag: "兴奋" },
  { label: "紧张", tag: "紧张" },
  { label: "失望", tag: "失望" },
  { label: "骄傲", tag: "骄傲" },
  { label: "嫉妒", tag: "嫉妒" },
];

const CHARACTER_TAGS: TagOption[] = [
  { label: "老人", tag: "老人" },
  { label: "小孩", tag: "小孩" },
  { label: "机器人", tag: "机器人" },
  { label: "精灵", tag: "精灵" },
  { label: "怪兽", tag: "怪兽" },
  { label: "英雄", tag: "英雄" },
];

const VOICE_STYLE_TAGS: TagOption[] = [
  { label: "温柔", tag: "温柔" },
  { label: "高冷", tag: "高冷" },
  { label: "慵懒", tag: "慵懒" },
  { label: "磁性", tag: "磁性" },
  { label: "甜美", tag: "甜美" },
  { label: "平静", tag: "平静" },
  { label: "沙哑", tag: "沙哑" },
  { label: "尖锐", tag: "尖锐" },
  { label: "低沉", tag: "低沉" },
  { label: "活泼", tag: "活泼" },
  { label: "严肃", tag: "严肃" },
  { label: "温柔且带气声", tag: "温柔且带气声" },
];

const DIALECT_TAGS: TagOption[] = [
  { label: "东北话", tag: "东北话" },
  { label: "四川话", tag: "四川话" },
  { label: "粤语", tag: "粤语" },
  { label: "上海话", tag: "上海话" },
  { label: "陕西话", tag: "陕西话" },
  { label: "天津话", tag: "天津话" },
  { label: "河南话", tag: "河南话" },
  { label: "湖南话", tag: "湖南话" },
];

const SCENE_TAGS: TagOption[] = [
  { label: "唱歌", tag: "唱歌" },
  { label: "新闻播报", tag: "新闻播报" },
  { label: "广告配音", tag: "广告配音" },
  { label: "纪录片解说", tag: "纪录片解说" },
  { label: "有声书", tag: "有声书" },
  { label: "诗歌朗诵", tag: "诗歌朗诵" },
  { label: "客服", tag: "客服" },
  { label: "教学", tag: "教学" },
];

export const STYLE_CATEGORIES: TagCategory[] = [
  { label: "情绪", tags: EMOTION_TAGS },
  { label: "声音风格", tags: VOICE_STYLE_TAGS },
  { label: "角色", tags: CHARACTER_TAGS },
  { label: "方言", tags: DIALECT_TAGS },
  { label: "场景", tags: SCENE_TAGS },
];

// ========== Audio Tags (inline) ==========
// MiMo: [笑] [轻笑] format — Chinese square brackets, inserted at cursor position
// MiniMax: (laughs) (sighs) format — English parentheses, inline in text

export const MIMO_AUDIO_TAGS: TagOption[] = [
  { label: "笑", tag: "[笑]" },
  { label: "轻笑", tag: "[轻笑]" },
  { label: "大笑", tag: "[大笑]" },
  { label: "叹气", tag: "[叹气]" },
  { label: "深呼吸", tag: "[深呼吸]" },
  { label: "抽泣", tag: "[抽泣]" },
  { label: "哽咽", tag: "[哽咽]" },
  { label: "颤抖", tag: "[颤抖]" },
  { label: "气声", tag: "[气声]" },
  { label: "停顿(短)", tag: "[pause]" },
  { label: "停顿(长)", tag: "[long pause]" },
  { label: "打哈欠", tag: "[打哈欠]" },
  { label: "咳嗽", tag: "[咳嗽]" },
  { label: "清嗓子", tag: "[清嗓子]" },
  { label: "窃窃私语", tag: "[窃窃私语]" },
  { label: "喊叫", tag: "[喊叫]" },
];

// MiniMax paralinguistic tags per official docs: https://platform.minimaxi.com/docs/api-reference/speech-t2a-http
export const MINIMAX_AUDIO_TAGS: TagOption[] = [
  { label: "笑", tag: "(laughs)" },
  { label: "轻笑", tag: "(chuckle)" },
  { label: "叹气", tag: "(sighs)" },
  { label: "深呼吸", tag: "(breath)" },
  { label: "喘气", tag: "(pant)" },
  { label: "抽泣", tag: "(cries)" },
  { label: "哽咽", tag: "(sobs)" },
  { label: "倒吸气", tag: "(gasps)" },
  { label: "吸鼻子", tag: "(sniffs)" },
  { label: "清嗓子", tag: "(clear-throat)" },
  { label: "咳嗽", tag: "(coughs)" },
  { label: "呻吟", tag: "(groans)" },
  { label: "哼唱", tag: "(humming)" },
  { label: "嘶嘶声", tag: "(hissing)" },
  { label: "嗯", tag: "(emm)" },
  { label: "喷嚏", tag: "(sneezes)" },
];

export const AUDIO_TAGS = MIMO_AUDIO_TAGS; // legacy alias

export function getAudioTags(providerId?: string): TagOption[] {
  if (providerId === "minimax") return MINIMAX_AUDIO_TAGS;
  return MIMO_AUDIO_TAGS;
}

// ========== Helpers ==========

export function filterTagsByProvider(
  tags: TagOption[],
  providerId: string | undefined
): TagOption[] {
  if (!providerId) return tags;
  return tags.filter((t) => !t.provider || t.provider === providerId);
}

// MiniMex-specific emotion mapping: Chinese tags → MiniMax emotion enum values
const MINIMAX_EMOTION_MAP: Record<string, string> = {
  "开心": "happy",
  "悲伤": "sad",
  "愤怒": "angry",
  "恐惧": "fearful",
  "厌恶": "disgusted",
  "惊讶": "surprised",
  "中性": "calm",
  "兴奋": "happy",
  "紧张": "fearful",
  "失望": "sad",
  "骄傲": "happy",
  "嫉妒": "angry",
};

export function getMiniMaxEmotion(styleTags: string[]): string | undefined {
  for (const tag of styleTags) {
    const emotion = MINIMAX_EMOTION_MAP[tag];
    if (emotion) return emotion;
  }
  return undefined;
}

// MiniMax doesn't support inline style tags — only MiMo does
// MiniMax: emotion set via voice_setting.emotion parameter
// MiMo: (标签1 标签2) prefix in text
export function formatStylePrefix(tags: string[], providerId?: string): string {
  if (tags.length === 0) return "";
  if (providerId === "minimax") return ""; // MiniMax reads inline tags literally
  return `(${tags.join(" ")})`;
}
