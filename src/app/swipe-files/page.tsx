'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Trash2, Filter } from 'lucide-react';
import { SwipeFile, CHANNEL_META } from '@/lib/types';
import { getSwipeFiles, saveSwipeFile, deleteSwipeFile } from '@/lib/store';

const CATEGORIES = {
  empathy: { label: '共感系', color: '#C47A5A' },
  education: { label: '教育系', color: '#5B8FA8' },
  cta: { label: 'CTA系', color: '#C8A96E' },
  story: { label: 'ストーリー系', color: '#9B8BB4' },
  proof: { label: '証拠系', color: '#7B9E87' },
  other: { label: 'その他', color: '#6A6058' },
} as const;

export default function SwipeFilesPage() {
  const router = useRouter();
  const [files, setFiles] = useState<SwipeFile[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Form state
  const [content, setContent] = useState('');
  const [channel, setChannel] = useState('instagram_feed');
  const [category, setCategory] = useState<SwipeFile['category']>('empathy');
  const [source, setSource] = useState<SwipeFile['source']>('self');
  const [memo, setMemo] = useState('');

  useEffect(() => {
    setFiles(getSwipeFiles());
  }, []);

  const handleSave = () => {
    if (!content.trim()) return;
    saveSwipeFile({
      content: content.trim(),
      channel,
      category,
      source,
      memo: memo.trim(),
    });
    setFiles(getSwipeFiles());
    setContent('');
    setMemo('');
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    if (!confirm('削除しますか？')) return;
    deleteSwipeFile(id);
    setFiles(getSwipeFiles());
  };

  const filtered = filterCategory === 'all' ? files : files.filter(f => f.category === filterCategory);

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-[#E8E0D5]" style={{ fontFamily: "'Georgia', 'Noto Serif JP', serif" }}>
      <div className="max-w-3xl mx-auto px-6 py-12">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-sm text-[#6A6058] hover:text-[#A09080] transition-colors mb-8"
        >
          <ArrowLeft size={16} />
          ダッシュボード
        </button>

        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="text-[10px] text-[#C8A96E] tracking-[4px] mb-2 uppercase">Swipe Files</div>
            <h1 className="text-xl font-normal">スワイプファイル</h1>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-[#C8A96E] text-[#0D0D0D] rounded-lg text-sm font-medium hover:bg-[#D4B87A] transition-colors"
          >
            <Plus size={16} />
            追加
          </button>
        </div>

        {/* Add form */}
        {showForm && (
          <div className="mb-8 p-4 bg-[#161412] border border-[#2A2520] rounded-lg space-y-3">
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="反応が良かった投稿テキスト..."
              rows={4}
              className="w-full px-3 py-2 bg-[#0D0D0D] border border-[#2A2520] rounded text-sm text-[#E8E0D5] placeholder-[#4A4840] focus:outline-none focus:border-[#C8A96E] resize-none"
            />
            <div className="flex flex-wrap gap-2">
              <select
                value={channel}
                onChange={e => setChannel(e.target.value)}
                className="bg-[#0D0D0D] border border-[#2A2520] rounded px-2 py-1.5 text-xs text-[#A09080] focus:outline-none"
              >
                {Object.entries(CHANNEL_META).map(([key, meta]) => (
                  <option key={key} value={key}>{meta.label}</option>
                ))}
              </select>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as SwipeFile['category'])}
                className="bg-[#0D0D0D] border border-[#2A2520] rounded px-2 py-1.5 text-xs text-[#A09080] focus:outline-none"
              >
                {Object.entries(CATEGORIES).map(([key, meta]) => (
                  <option key={key} value={key}>{meta.label}</option>
                ))}
              </select>
              <select
                value={source}
                onChange={e => setSource(e.target.value as SwipeFile['source'])}
                className="bg-[#0D0D0D] border border-[#2A2520] rounded px-2 py-1.5 text-xs text-[#A09080] focus:outline-none"
              >
                <option value="self">自分の投稿</option>
                <option value="reference">参考投稿</option>
              </select>
            </div>
            <input
              type="text"
              value={memo}
              onChange={e => setMemo(e.target.value)}
              placeholder="メモ（なぜ反応が良かったか）"
              className="w-full px-3 py-2 bg-[#0D0D0D] border border-[#2A2520] rounded text-sm text-[#E8E0D5] placeholder-[#4A4840] focus:outline-none focus:border-[#C8A96E]"
            />
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={!content.trim()}
                className="px-4 py-2 bg-[#C8A96E] text-[#0D0D0D] rounded text-xs font-medium hover:bg-[#D4B87A] transition-colors disabled:opacity-30"
              >
                保存
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-[#1A1A1A] border border-[#2A2520] rounded text-xs text-[#A09080] transition-colors"
              >
                キャンセル
              </button>
            </div>
          </div>
        )}

        {/* Filter */}
        <div className="flex items-center gap-2 mb-4">
          <Filter size={13} className="text-[#6A6058]" />
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="bg-[#0D0D0D] border border-[#2A2520] rounded px-2 py-1 text-[11px] text-[#A09080] focus:outline-none"
          >
            <option value="all">すべて</option>
            {Object.entries(CATEGORIES).map(([key, meta]) => (
              <option key={key} value={key}>{meta.label}</option>
            ))}
          </select>
          <span className="text-[11px] text-[#4A4840]">{filtered.length}件</span>
        </div>

        {/* List */}
        {filtered.length > 0 ? (
          <div className="space-y-2">
            {filtered.map(file => {
              const cat = CATEGORIES[file.category];
              return (
                <div key={file.id} className="bg-[#161412] border border-[#2A2520] rounded-md p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ backgroundColor: cat.color + '20', color: cat.color }}>
                        {cat.label}
                      </span>
                      <span className="text-[10px] text-[#6A6058]">
                        {file.source === 'self' ? '自分' : '参考'}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDelete(file.id)}
                      className="p-1 hover:bg-[#2A2520] rounded"
                    >
                      <Trash2 size={13} className="text-[#4A4840] hover:text-[#C47A5A]" />
                    </button>
                  </div>
                  <div className="text-[12px] text-[#A09080] mb-2 line-clamp-4">{file.content}</div>
                  {file.memo && (
                    <div className="text-[11px] text-[#6A6058] italic">{file.memo}</div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-sm text-[#6A6058]">
            スワイプファイルはまだありません
          </div>
        )}
      </div>
    </div>
  );
}
