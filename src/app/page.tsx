'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, FolderOpen, HelpCircle, FileText } from 'lucide-react';
import { Project } from '@/lib/types';
import { getProjects, deleteProject } from '@/lib/store';

export default function Dashboard() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    setProjects(getProjects());
  }, []);

  const handleDelete = (id: string, name: string) => {
    if (confirm(`「${name}」を削除しますか？`)) {
      deleteProject(id);
      setProjects(getProjects());
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-[#E8E0D5]" style={{ fontFamily: "'Georgia', 'Noto Serif JP', serif" }}>
      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="text-[11px] tracking-[6px] text-[#C8A96E] mb-4 uppercase">
            Launch Post Creation Tool
          </div>
          <h1 className="text-2xl font-normal mb-2">投稿作成ツール</h1>
          <p className="text-sm text-[#6A6058]">
            コンセプトシートに基づいた投稿コンテンツ作成
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mb-8">
          <button
            onClick={() => router.push('/projects/new')}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#C8A96E] text-[#0D0D0D] rounded-lg text-sm font-medium hover:bg-[#D4B87A] transition-colors"
          >
            <Plus size={16} />
            新規プロジェクト
          </button>
          <button
            onClick={() => router.push('/swipe-files')}
            className="flex items-center gap-2 px-4 py-3 bg-[#1A1A1A] border border-[#2A2520] rounded-lg text-sm text-[#A09080] hover:border-[#3A3530] transition-colors"
          >
            <FolderOpen size={16} />
            スワイプファイル
          </button>
          <button
            onClick={() => router.push('/guide')}
            className="flex items-center gap-2 px-4 py-3 bg-[#1A1A1A] border border-[#2A2520] rounded-lg text-sm text-[#A09080] hover:border-[#3A3530] transition-colors"
          >
            <HelpCircle size={16} />
            使い方
          </button>
        </div>

        {/* Projects */}
        {projects.length > 0 ? (
          <div className="space-y-2">
            <div className="text-[10px] text-[#6A6058] tracking-[3px] mb-4 uppercase">Projects</div>
            {projects.map(project => (
              <div
                key={project.id}
                className="flex items-center gap-4 px-5 py-4 bg-[#161412] border border-[#2A2520] border-l-[3px] border-l-[#C8A96E] rounded-md cursor-pointer hover:bg-[#1E1C18] transition-colors"
                onClick={() => router.push(`/projects/${project.id}`)}
              >
                <FileText size={18} className="text-[#C8A96E] flex-shrink-0" />
                <div className="flex-1">
                  <div className="text-sm text-[#E0D8C8] mb-1">{project.name}</div>
                  <div className="text-[11px] text-[#6A6058]">
                    {new Date(project.updatedAt).toLocaleDateString('ja-JP')}
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(project.id, project.name); }}
                  className="p-1.5 hover:bg-[#2A2520] rounded transition-colors"
                  title="削除"
                >
                  <Trash2 size={14} className="text-[#4A4840] hover:text-[#C47A5A]" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-[#3A3530] text-4xl mb-4">◇</div>
            <p className="text-sm text-[#6A6058] mb-6">まだプロジェクトがありません</p>
            <button
              onClick={() => router.push('/projects/new')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#C8A96E] text-[#0D0D0D] rounded-lg text-sm hover:bg-[#D4B87A] transition-colors"
            >
              <Plus size={16} />
              最初のプロジェクトを作成
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
