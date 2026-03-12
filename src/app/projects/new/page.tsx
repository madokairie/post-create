'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ClipboardPaste, FileText } from 'lucide-react';
import { saveProject } from '@/lib/store';
import { Channel, CHANNEL_META } from '@/lib/types';

const ALL_CHANNELS: Channel[] = ['instagram_feed', 'instagram_reel', 'x_short', 'x_long', 'youtube', 'threads', 'email', 'line'];

export default function NewProjectPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [conceptHTML, setConceptHTML] = useState('');
  const [selectedChannels, setSelectedChannels] = useState<Channel[]>(['instagram_feed', 'x_short', 'email', 'line']);
  const [step, setStep] = useState<'import' | 'settings'>('import');

  const toggleChannel = (ch: Channel) => {
    setSelectedChannels(prev =>
      prev.includes(ch) ? prev.filter(c => c !== ch) : [...prev, ch]
    );
  };

  const extractData = (html: string) => {
    // Simple extraction from concept sheet HTML
    const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ');

    let target = '';
    let mainCopy = '';
    let style = '';
    let schedule = '';

    // Try to extract key sections
    const targetMatch = text.match(/ターゲット[^:：]*[:：]\s*([^。]+。?)/);
    if (targetMatch) target = targetMatch[1].trim();

    const copyMatch = text.match(/メインコピー[^:：]*[:：]\s*([^。]+。?)/);
    if (copyMatch) mainCopy = copyMatch[1].trim();

    const styleMatch = text.match(/(OK表現|NG表現|スタイル)[^:：]*[:：]\s*([^。]+。?)/);
    if (styleMatch) style = styleMatch[2].trim();

    const scheduleMatch = text.match(/(スケジュール|発信戦略)[^:：]*[:：]\s*([^。]+。?)/);
    if (scheduleMatch) schedule = scheduleMatch[2].trim();

    return { target, mainCopy, style, schedule, channels: selectedChannels };
  };

  const handleCreate = () => {
    if (!name.trim()) return;

    const extracted = extractData(conceptHTML);
    const project = saveProject({
      name: name.trim(),
      conceptSheet: conceptHTML,
      extractedData: extracted,
      ctaTemplates: [],
    });

    router.push(`/projects/${project.id}`);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setConceptHTML(text);
    } catch {
      // fallback - user will paste manually
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-[#E8E0D5]" style={{ fontFamily: "'Georgia', 'Noto Serif JP', serif" }}>
      <div className="max-w-2xl mx-auto px-6 py-12">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-sm text-[#6A6058] hover:text-[#A09080] transition-colors mb-8"
        >
          <ArrowLeft size={16} />
          ダッシュボードに戻る
        </button>

        <div className="text-[10px] text-[#C8A96E] tracking-[4px] mb-2 uppercase">New Project</div>
        <h1 className="text-xl font-normal mb-8">新規プロジェクト作成</h1>

        {step === 'import' ? (
          <div className="space-y-6">
            {/* Project name */}
            <div>
              <label className="block text-xs text-[#A09080] mb-2">プロジェクト名</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="例: 5月ローンチ投稿"
                className="w-full px-4 py-3 bg-[#161412] border border-[#2A2520] rounded-lg text-sm text-[#E8E0D5] placeholder-[#4A4840] focus:outline-none focus:border-[#C8A96E]"
              />
            </div>

            {/* Concept sheet import */}
            <div>
              <label className="block text-xs text-[#A09080] mb-2">
                コンセプトシート読み込み
                <span className="text-[#6A6058] ml-2">（コンセプトアプリの📋ボタンでコピーしたHTMLを貼り付け）</span>
              </label>
              <div className="relative">
                <textarea
                  value={conceptHTML}
                  onChange={e => setConceptHTML(e.target.value)}
                  placeholder="コンセプトシートのHTMLをここに貼り付け..."
                  rows={8}
                  className="w-full px-4 py-3 bg-[#161412] border border-[#2A2520] rounded-lg text-sm text-[#E8E0D5] placeholder-[#4A4840] focus:outline-none focus:border-[#C8A96E] resize-none"
                />
                <button
                  onClick={handlePaste}
                  className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 bg-[#1A1A18] border border-[#3A3530] rounded text-[10px] text-[#C8A96E] hover:border-[#C8A96E] transition-colors"
                >
                  <ClipboardPaste size={12} />
                  貼り付け
                </button>
              </div>
              {conceptHTML && (
                <div className="mt-2 flex items-center gap-2 text-[11px] text-[#7B9E87]">
                  <FileText size={12} />
                  コンセプトシートを読み込みました（{conceptHTML.length.toLocaleString()}文字）
                </div>
              )}
            </div>

            <button
              onClick={() => setStep('settings')}
              disabled={!name.trim()}
              className="w-full px-4 py-3 bg-[#C8A96E] text-[#0D0D0D] rounded-lg text-sm font-medium hover:bg-[#D4B87A] transition-colors disabled:opacity-30"
            >
              次へ — 使用媒体を選択
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Channel selection */}
            <div>
              <label className="block text-xs text-[#A09080] mb-3">使用する媒体を選択</label>
              <div className="grid grid-cols-2 gap-2">
                {ALL_CHANNELS.map(ch => {
                  const meta = CHANNEL_META[ch];
                  const selected = selectedChannels.includes(ch);
                  return (
                    <button
                      key={ch}
                      onClick={() => toggleChannel(ch)}
                      className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm transition-colors border ${
                        selected
                          ? 'bg-[#1A1A18] border-[#C8A96E] text-[#E0D8C8]'
                          : 'bg-[#161412] border-[#2A2520] text-[#6A6058] hover:border-[#3A3530]'
                      }`}
                    >
                      <span>{meta.icon}</span>
                      <span>{meta.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep('import')}
                className="px-4 py-3 bg-[#1A1A1A] border border-[#2A2520] rounded-lg text-sm text-[#A09080] hover:border-[#3A3530] transition-colors"
              >
                戻る
              </button>
              <button
                onClick={handleCreate}
                disabled={selectedChannels.length === 0}
                className="flex-1 px-4 py-3 bg-[#C8A96E] text-[#0D0D0D] rounded-lg text-sm font-medium hover:bg-[#D4B87A] transition-colors disabled:opacity-30"
              >
                プロジェクトを作成
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
