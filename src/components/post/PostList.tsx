'use client';

import { Post, CHANNEL_META, PHASE_META, STATUS_META } from '@/lib/types';
import { Copy, Check, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface Props {
  posts: Post[];
  onEdit: (postId: string) => void;
  onDelete: (postId: string) => void;
  onStatusChange: (postId: string, status: Post['status']) => void;
}

export default function PostList({ posts, onEdit, onDelete, onStatusChange }: Props) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (post: Post) => {
    navigator.clipboard.writeText(post.content + (post.hashtags ? '\n\n' + post.hashtags : ''));
    setCopiedId(post.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (posts.length === 0) {
    return (
      <div className="text-center py-8 text-sm text-[#6A6058]">
        投稿はまだありません
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {posts.map(post => {
        const ch = CHANNEL_META[post.channel];
        const ph = PHASE_META[post.phase];
        const st = STATUS_META[post.status];

        return (
          <div
            key={post.id}
            className="bg-[#161412] border border-[#2A2520] rounded-md p-4"
            style={{ borderLeftWidth: '3px', borderLeftColor: ph.color }}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span style={{ color: ch.color }}>{ch.icon}</span>
                <span className="text-xs text-[#A09080]">{ch.label}</span>
                <span
                  className="text-[10px] px-1.5 py-0.5 rounded"
                  style={{ backgroundColor: ph.color + '20', color: ph.color }}
                >
                  {ph.label}
                </span>
                <span
                  className="text-[10px] px-1.5 py-0.5 rounded"
                  style={{ color: st.color }}
                >
                  {st.label}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <select
                  value={post.status}
                  onChange={e => onStatusChange(post.id, e.target.value as Post['status'])}
                  className="bg-[#0D0D0D] border border-[#2A2520] rounded px-1.5 py-0.5 text-[10px] text-[#A09080] focus:outline-none"
                >
                  <option value="draft">下書き</option>
                  <option value="confirmed">確定</option>
                  <option value="posted">投稿済み</option>
                </select>
              </div>
            </div>

            <div className="text-sm text-[#E0D8C8] mb-1 font-medium">{post.title}</div>

            <div className="text-[12px] text-[#8A8070] line-clamp-3 mb-3">
              {post.content.slice(0, 200)}{post.content.length > 200 ? '...' : ''}
            </div>

            <div className="flex items-center justify-between">
              <div className="text-[10px] text-[#4A4840]">
                {post.scheduledDate && `投稿予定: ${post.scheduledDate}`}
                {!post.scheduledDate && new Date(post.updatedAt).toLocaleDateString('ja-JP')}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleCopy(post)}
                  className="p-1.5 hover:bg-[#2A2520] rounded transition-colors"
                  title="コピー"
                >
                  {copiedId === post.id
                    ? <Check size={13} className="text-[#7B9E87]" />
                    : <Copy size={13} className="text-[#4A4840]" />
                  }
                </button>
                <button
                  onClick={() => onEdit(post.id)}
                  className="p-1.5 hover:bg-[#2A2520] rounded transition-colors"
                  title="編集"
                >
                  <Pencil size={13} className="text-[#4A4840]" />
                </button>
                <button
                  onClick={() => onDelete(post.id)}
                  className="p-1.5 hover:bg-[#2A2520] rounded transition-colors"
                  title="削除"
                >
                  <Trash2 size={13} className="text-[#4A4840] hover:text-[#C47A5A]" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
