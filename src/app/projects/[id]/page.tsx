'use client';

import { useState, useEffect, useMemo, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, ChevronLeft, ChevronRight, Calendar, List, Settings, Loader2, BarChart3 } from 'lucide-react';
import { Project, Post, CalendarSlot, Channel, Phase, CHANNEL_META, PHASE_META } from '@/lib/types';
import { getProject, getPosts, getCalendarSlots, saveCalendarSlot, deletePost, updatePost, deleteCalendarSlot } from '@/lib/store';
import WeekCalendar from '@/components/calendar/WeekCalendar';
import PostList from '@/components/post/PostList';

function getMonday(d: Date): Date {
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d);
  monday.setDate(diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

export default function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [slots, setSlots] = useState<CalendarSlot[]>([]);
  const [weekStart, setWeekStart] = useState(getMonday(new Date()));
  const [view, setView] = useState<'calendar' | 'list'>('calendar');
  const [generating, setGenerating] = useState(false);
  const [filterChannel, setFilterChannel] = useState<Channel | 'all'>('all');
  const [filterPhase, setFilterPhase] = useState<Phase | 'all'>('all');

  useEffect(() => {
    const p = getProject(id);
    if (!p) { router.push('/'); return; }
    setProject(p);
    setPosts(getPosts(id));
    setSlots(getCalendarSlots(id));
  }, [id, router]);

  const filteredPosts = useMemo(() => {
    let list = posts;
    if (filterChannel !== 'all') list = list.filter(p => p.channel === filterChannel);
    if (filterPhase !== 'all') list = list.filter(p => p.phase === filterPhase);
    return list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [posts, filterChannel, filterPhase]);

  const taskStats = useMemo(() => {
    const total = slots.length;
    const done = posts.filter(p => p.status === 'confirmed' || p.status === 'posted').length;
    return { total, done, remaining: total - done };
  }, [slots, posts]);

  const prevWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() - 7);
    setWeekStart(d);
  };

  const nextWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 7);
    setWeekStart(d);
  };

  const handleGenerateCalendar = async () => {
    if (!project || generating) return;
    setGenerating(true);
    try {
      const res = await fetch('/api/generate-calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conceptSheet: project.conceptSheet,
          channels: project.extractedData.channels,
          startDate: weekStart.toISOString().split('T')[0],
          daysCount: 7,
        }),
      });
      if (!res.ok) throw new Error('Failed');
      const { slots: generated } = await res.json();
      for (const s of generated) {
        saveCalendarSlot({
          projectId: id,
          date: s.date,
          channel: s.channel,
          phase: s.phase,
          theme: s.theme,
        });
      }
      setSlots(getCalendarSlots(id));
    } catch (err) {
      console.error(err);
      alert('カレンダー生成に失敗しました。');
    } finally {
      setGenerating(false);
    }
  };

  const handleSlotClick = (slot: CalendarSlot) => {
    if (slot.postId) {
      router.push(`/projects/${id}/posts/${slot.postId}`);
    } else {
      router.push(`/projects/${id}/posts/new?channel=${slot.channel}&phase=${slot.phase}&theme=${encodeURIComponent(slot.theme)}&date=${slot.date}&slotId=${slot.id}`);
    }
  };

  const handleEmptyClick = (date: string) => {
    router.push(`/projects/${id}/posts/new?date=${date}`);
  };

  const handleDeletePost = (postId: string) => {
    if (!confirm('この投稿を削除しますか？')) return;
    deletePost(postId);
    setPosts(getPosts(id));
    // Remove from slot
    const slot = slots.find(s => s.postId === postId);
    if (slot) {
      deleteCalendarSlot(slot.id);
      setSlots(getCalendarSlots(id));
    }
  };

  const handleStatusChange = (postId: string, status: Post['status']) => {
    updatePost(postId, { status });
    setPosts(getPosts(id));
  };

  if (!project) return null;

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-[#E8E0D5]" style={{ fontFamily: "'Georgia', 'Noto Serif JP', serif" }}>
      {/* Header */}
      <div className="border-b border-[#2A2520] px-6 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/')}
              className="text-[#6A6058] hover:text-[#A09080] transition-colors"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-sm text-[#E0D8C8]">{project.name}</h1>
              <div className="text-[10px] text-[#6A6058]">
                {taskStats.total > 0 && `進捗: ${taskStats.done}/${taskStats.total}完了`}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Progress bar */}
            {taskStats.total > 0 && (
              <div className="flex items-center gap-2 mr-4">
                <div className="w-24 h-1.5 bg-[#2A2520] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#7B9E87] rounded-full transition-all"
                    style={{ width: `${(taskStats.done / taskStats.total) * 100}%` }}
                  />
                </div>
                <span className="text-[10px] text-[#7B9E87]">
                  {Math.round((taskStats.done / taskStats.total) * 100)}%
                </span>
              </div>
            )}

            <button
              onClick={() => router.push(`/projects/${id}/posts/new`)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#C8A96E] text-[#0D0D0D] rounded text-xs font-medium hover:bg-[#D4B87A] transition-colors"
            >
              <Plus size={14} />
              投稿作成
            </button>
            <button
              onClick={() => router.push(`/projects/${id}/settings`)}
              className="p-2 text-[#6A6058] hover:text-[#A09080] transition-colors"
            >
              <Settings size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* View toggle + filters */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setView('calendar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs transition-colors ${
                view === 'calendar' ? 'bg-[#1A1A18] text-[#C8A96E] border border-[#C8A96E]' : 'text-[#6A6058] border border-[#2A2520]'
              }`}
            >
              <Calendar size={13} />
              カレンダー
            </button>
            <button
              onClick={() => setView('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs transition-colors ${
                view === 'list' ? 'bg-[#1A1A18] text-[#C8A96E] border border-[#C8A96E]' : 'text-[#6A6058] border border-[#2A2520]'
              }`}
            >
              <List size={13} />
              一覧
            </button>
          </div>

          {view === 'list' && (
            <div className="flex items-center gap-2">
              <select
                value={filterChannel}
                onChange={e => setFilterChannel(e.target.value as Channel | 'all')}
                className="bg-[#0D0D0D] border border-[#2A2520] rounded px-2 py-1 text-[11px] text-[#A09080] focus:outline-none"
              >
                <option value="all">全媒体</option>
                {Object.entries(CHANNEL_META).map(([key, meta]) => (
                  <option key={key} value={key}>{meta.icon} {meta.label}</option>
                ))}
              </select>
              <select
                value={filterPhase}
                onChange={e => setFilterPhase(e.target.value as Phase | 'all')}
                className="bg-[#0D0D0D] border border-[#2A2520] rounded px-2 py-1 text-[11px] text-[#A09080] focus:outline-none"
              >
                <option value="all">全フェーズ</option>
                {Object.entries(PHASE_META).map(([key, meta]) => (
                  <option key={key} value={key}>{meta.label}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Calendar view */}
        {view === 'calendar' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <button onClick={prevWeek} className="p-1 text-[#6A6058] hover:text-[#A09080]">
                  <ChevronLeft size={18} />
                </button>
                <span className="text-sm text-[#A09080]">
                  {weekStart.getFullYear()}年{weekStart.getMonth() + 1}月{weekStart.getDate()}日〜
                </span>
                <button onClick={nextWeek} className="p-1 text-[#6A6058] hover:text-[#A09080]">
                  <ChevronRight size={18} />
                </button>
              </div>
              <button
                onClick={handleGenerateCalendar}
                disabled={generating}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1A1A18] border border-[#3A3530] rounded text-xs text-[#C8A96E] hover:border-[#C8A96E] transition-colors disabled:opacity-30"
              >
                {generating ? <Loader2 size={13} className="animate-spin" /> : <BarChart3 size={13} />}
                {generating ? '生成中...' : 'AIでカレンダー生成'}
              </button>
            </div>
            <WeekCalendar
              slots={slots}
              posts={posts}
              weekStart={weekStart}
              onSlotClick={handleSlotClick}
              onEmptyClick={handleEmptyClick}
            />
          </div>
        )}

        {/* List view */}
        {view === 'list' && (
          <PostList
            posts={filteredPosts}
            onEdit={(postId) => router.push(`/projects/${id}/posts/${postId}`)}
            onDelete={handleDeletePost}
            onStatusChange={handleStatusChange}
          />
        )}
      </div>
    </div>
  );
}
