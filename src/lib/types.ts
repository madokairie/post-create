// ── Channel & Phase ──

export type Channel =
  | 'instagram_feed'
  | 'instagram_reel'
  | 'x_short'
  | 'x_long'
  | 'youtube'
  | 'threads'
  | 'email'
  | 'line';

export type Phase = 'pre_pre' | 'pre' | 'launch';

export type PostStatus = 'draft' | 'confirmed' | 'posted';

// ── Channel metadata ──

export const CHANNEL_META: Record<Channel, { label: string; icon: string; color: string; maxLength?: number }> = {
  instagram_feed: { label: 'Instagram フィード', icon: '📸', color: '#E1306C' },
  instagram_reel: { label: 'Instagram リール', icon: '🎬', color: '#E1306C' },
  x_short:        { label: 'X 短文', icon: '𝕏', color: '#1DA1F2', maxLength: 140 },
  x_long:         { label: 'X 長文', icon: '𝕏', color: '#1DA1F2' },
  youtube:        { label: 'YouTube', icon: '▶️', color: '#FF0000' },
  threads:        { label: 'Threads', icon: '🧵', color: '#000000' },
  email:          { label: 'メール', icon: '✉️', color: '#5B8FA8' },
  line:           { label: 'LINE', icon: '💬', color: '#06C755' },
};

export const PHASE_META: Record<Phase, { label: string; color: string; description: string }> = {
  pre_pre: { label: 'pre-preローンチ', color: '#C47A5A', description: '認知・問題提起' },
  pre:     { label: 'preローンチ', color: '#C8A96E', description: '解決策提示・期待値上げ' },
  launch:  { label: 'ローンチ期間', color: '#7B9E87', description: 'セミナー誘導・クロージング' },
};

export const STATUS_META: Record<PostStatus, { label: string; color: string }> = {
  draft:     { label: '下書き', color: '#6A6058' },
  confirmed: { label: '確定', color: '#C8A96E' },
  posted:    { label: '投稿済み', color: '#7B9E87' },
};

// ── Data models ──

export interface Project {
  id: string;
  name: string;
  conceptSheet: string;
  extractedData: {
    target: string;
    mainCopy: string;
    style: string;
    schedule: string;
    channels: string[];
  };
  ctaTemplates: CTATemplate[];
  createdAt: string;
  updatedAt: string;
}

export interface Post {
  id: string;
  projectId: string;
  channel: Channel;
  phase: Phase;
  title: string;
  content: string;
  hashtags?: string;
  reelScript?: ReelScene[];
  status: PostStatus;
  scheduledDate?: string;
  chainId?: string;
  chainOrder?: number;
  swipeFileRef?: string;
  variationOf?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReelScene {
  sceneNumber: number;
  duration: string;
  visual: string;
  telop: string;
  narration: string;
}

export interface CalendarSlot {
  id: string;
  projectId: string;
  date: string;
  channel: Channel;
  phase: Phase;
  theme: string;
  postId?: string;
  chainId?: string;
}

export interface SwipeFile {
  id: string;
  content: string;
  channel: string;
  category: 'empathy' | 'education' | 'cta' | 'story' | 'proof' | 'other';
  source: 'self' | 'reference';
  memo: string;
  createdAt: string;
}

export interface CTATemplate {
  id: string;
  phase: Phase;
  text: string;
  label: string;
}

export interface ChatMessage {
  id: string;
  postId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}
