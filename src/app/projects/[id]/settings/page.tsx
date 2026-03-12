'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react';
import { Project, CTATemplate, Phase, PHASE_META } from '@/lib/types';
import { getProject, updateProject } from '@/lib/store';

function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export default function SettingsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [target, setTarget] = useState('');
  const [mainCopy, setMainCopy] = useState('');
  const [style, setStyle] = useState('');
  const [templates, setTemplates] = useState<CTATemplate[]>([]);

  useEffect(() => {
    const p = getProject(id);
    if (!p) { router.push('/'); return; }
    setProject(p);
    setTarget(p.extractedData.target);
    setMainCopy(p.extractedData.mainCopy);
    setStyle(p.extractedData.style);
    setTemplates(p.ctaTemplates);
  }, [id, router]);

  const handleSave = () => {
    updateProject(id, {
      extractedData: {
        ...project!.extractedData,
        target,
        mainCopy,
        style,
      },
      ctaTemplates: templates,
    });
    router.push(`/projects/${id}`);
  };

  const addTemplate = (phase: Phase) => {
    setTemplates(prev => [...prev, {
      id: uid(),
      phase,
      text: '',
      label: '',
    }]);
  };

  const updateTemplate = (templateId: string, updates: Partial<CTATemplate>) => {
    setTemplates(prev => prev.map(t => t.id === templateId ? { ...t, ...updates } : t));
  };

  const deleteTemplate = (templateId: string) => {
    setTemplates(prev => prev.filter(t => t.id !== templateId));
  };

  if (!project) return null;

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-[#E8E0D5]" style={{ fontFamily: "'Georgia', 'Noto Serif JP', serif" }}>
      <div className="max-w-2xl mx-auto px-6 py-12">
        <button
          onClick={() => router.push(`/projects/${id}`)}
          className="flex items-center gap-2 text-sm text-[#6A6058] hover:text-[#A09080] transition-colors mb-8"
        >
          <ArrowLeft size={16} />
          プロジェクトに戻る
        </button>

        <div className="text-[10px] text-[#C8A96E] tracking-[4px] mb-2 uppercase">Settings</div>
        <h1 className="text-xl font-normal mb-8">プロジェクト設定</h1>

        {/* Extracted data editing */}
        <div className="space-y-6 mb-10">
          <div className="text-xs text-[#C8A96E] font-medium pb-2 border-b border-[#2A2520]">コンセプト情報</div>

          <div>
            <label className="block text-xs text-[#A09080] mb-2">ターゲット像</label>
            <textarea
              value={target}
              onChange={e => setTarget(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 bg-[#161412] border border-[#2A2520] rounded text-sm text-[#E8E0D5] focus:outline-none focus:border-[#C8A96E] resize-none"
            />
          </div>

          <div>
            <label className="block text-xs text-[#A09080] mb-2">メインコピー</label>
            <input
              type="text"
              value={mainCopy}
              onChange={e => setMainCopy(e.target.value)}
              className="w-full px-3 py-2 bg-[#161412] border border-[#2A2520] rounded text-sm text-[#E8E0D5] focus:outline-none focus:border-[#C8A96E]"
            />
          </div>

          <div>
            <label className="block text-xs text-[#A09080] mb-2">スタイルシート（OK/NG表現）</label>
            <textarea
              value={style}
              onChange={e => setStyle(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 bg-[#161412] border border-[#2A2520] rounded text-sm text-[#E8E0D5] focus:outline-none focus:border-[#C8A96E] resize-none"
            />
          </div>
        </div>

        {/* CTA Templates */}
        <div className="mb-10">
          <div className="text-xs text-[#C8A96E] font-medium pb-2 border-b border-[#2A2520] mb-4">CTAテンプレート</div>

          {(['pre_pre', 'pre', 'launch'] as Phase[]).map(phase => {
            const phaseMeta = PHASE_META[phase];
            const phaseTemplates = templates.filter(t => t.phase === phase);

            return (
              <div key={phase} className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs" style={{ color: phaseMeta.color }}>{phaseMeta.label}</span>
                  <button
                    onClick={() => addTemplate(phase)}
                    className="flex items-center gap-1 text-[10px] text-[#6A6058] hover:text-[#A09080]"
                  >
                    <Plus size={12} />
                    追加
                  </button>
                </div>

                {phaseTemplates.length > 0 ? (
                  <div className="space-y-2">
                    {phaseTemplates.map(t => (
                      <div key={t.id} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={t.label}
                          onChange={e => updateTemplate(t.id, { label: e.target.value })}
                          placeholder="ラベル"
                          className="w-24 px-2 py-1.5 bg-[#161412] border border-[#2A2520] rounded text-[11px] text-[#A09080] focus:outline-none"
                        />
                        <input
                          type="text"
                          value={t.text}
                          onChange={e => updateTemplate(t.id, { text: e.target.value })}
                          placeholder="CTA文を入力..."
                          className="flex-1 px-2 py-1.5 bg-[#161412] border border-[#2A2520] rounded text-[11px] text-[#E8E0D5] focus:outline-none"
                        />
                        <button onClick={() => deleteTemplate(t.id)} className="p-1 text-[#4A4840] hover:text-[#C47A5A]">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-[11px] text-[#4A4840] py-2">テンプレートなし</div>
                )}
              </div>
            );
          })}
        </div>

        <button
          onClick={handleSave}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#C8A96E] text-[#0D0D0D] rounded-lg text-sm font-medium hover:bg-[#D4B87A] transition-colors"
        >
          <Save size={16} />
          保存
        </button>
      </div>
    </div>
  );
}
