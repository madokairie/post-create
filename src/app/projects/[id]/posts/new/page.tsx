'use client';

import { useState, useEffect, useCallback, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Save, Sparkles, Copy, Check, Loader2 } from 'lucide-react';
import { Channel, Phase, ChatMessage, CHANNEL_META, PHASE_META } from '@/lib/types';
import { getProject, savePost, saveChatMessage, getChatMessages, updateCalendarSlot } from '@/lib/store';
import { buildSystemPrompt, buildVariationPrompt } from '@/lib/prompt';
import ChatArea from '@/components/chat/ChatArea';
import ChatInput from '@/components/chat/ChatInput';

export default function NewPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: projectId } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();

  const [channel, setChannel] = useState<Channel>((searchParams.get('channel') as Channel) || 'instagram_feed');
  const [phase, setPhase] = useState<Phase>((searchParams.get('phase') as Phase) || 'pre_pre');
  const [title, setTitle] = useState(searchParams.get('theme') || '');
  const [scheduledDate, setScheduledDate] = useState(searchParams.get('date') || '');
  const slotId = searchParams.get('slotId');

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streamingContent, setStreamingContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [extractedContent, setExtractedContent] = useState('');
  const [extractedHashtags, setExtractedHashtags] = useState('');
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [generatingVariations, setGeneratingVariations] = useState(false);

  const project = typeof window !== 'undefined' ? getProject(projectId) : null;

  const getSystemPrompt = useCallback(() => {
    if (!project) return '';
    return buildSystemPrompt({
      channel,
      phase,
      conceptSheet: project.conceptSheet,
      extractedData: project.extractedData,
    });
  }, [project, channel, phase]);

  // Extract post content from assistant messages
  useEffect(() => {
    const allContent = messages
      .filter(m => m.role === 'assistant')
      .map(m => m.content)
      .join('\n');

    const postMatch = allContent.match(/```post\n([\s\S]*?)```/g);
    if (postMatch) {
      const latest = postMatch[postMatch.length - 1];
      setExtractedContent(latest.replace(/```post\n?/, '').replace(/```$/, '').trim());
    }

    const hashMatch = allContent.match(/```hashtags\n([\s\S]*?)```/g);
    if (hashMatch) {
      const latest = hashMatch[hashMatch.length - 1];
      setExtractedHashtags(latest.replace(/```hashtags\n?/, '').replace(/```$/, '').trim());
    }
  }, [messages]);

  const handleSend = async (text: string) => {
    if (!project || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      postId: 'new',
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);
    setStreamingContent('');

    try {
      const allMessages = [...messages, userMsg].map(m => ({ role: m.role, content: m.content }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: allMessages,
          systemPrompt: getSystemPrompt(),
        }),
      });

      if (!res.ok || !res.body) throw new Error('Failed');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split('\n')) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6);
          if (data === '[DONE]') break;
          try {
            const { text: t } = JSON.parse(data);
            accumulated += t;
            setStreamingContent(accumulated);
          } catch { /* skip */ }
        }
      }

      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        postId: 'new',
        role: 'assistant',
        content: accumulated,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, assistantMsg]);
      setStreamingContent('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = () => {
    if (!project || !title.trim()) {
      alert('タイトルを入力してください');
      return;
    }

    const content = extractedContent || messages.filter(m => m.role === 'assistant').pop()?.content || '';
    if (!content) {
      alert('投稿内容がありません。AIと壁打ちして投稿を作成してください。');
      return;
    }

    const post = savePost({
      projectId,
      channel,
      phase,
      title: title.trim(),
      content,
      hashtags: extractedHashtags || undefined,
      status: 'draft',
      scheduledDate: scheduledDate || undefined,
    });

    // Save chat messages
    for (const msg of messages) {
      saveChatMessage({ postId: post.id, role: msg.role, content: msg.content });
    }

    // Link to calendar slot
    if (slotId) {
      updateCalendarSlot(slotId, { postId: post.id });
    }

    setSaved(true);
    setTimeout(() => router.push(`/projects/${projectId}`), 1000);
  };

  const handleGenerateVariations = async () => {
    if (!project || !extractedContent || generatingVariations) return;
    setGeneratingVariations(true);

    try {
      const res = await fetch('/api/generate-variations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemPrompt: getSystemPrompt(),
          variationPrompt: buildVariationPrompt(extractedContent, channel, phase),
        }),
      });

      if (!res.ok) throw new Error('Failed');
      const { content } = await res.json();

      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        postId: 'new',
        role: 'assistant',
        content,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error(err);
      alert('バリエーション生成に失敗しました。');
    } finally {
      setGeneratingVariations(false);
    }
  };

  const handleCopyContent = () => {
    const text = extractedContent + (extractedHashtags ? '\n\n' + extractedHashtags : '');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!project) return null;

  return (
    <div className="h-screen flex flex-col bg-[#0D0D0D] text-[#E8E0D5]" style={{ fontFamily: "'Georgia', 'Noto Serif JP', serif" }}>
      {/* Header */}
      <div className="border-b border-[#2A2520] px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push(`/projects/${projectId}`)}
              className="text-[#6A6058] hover:text-[#A09080]"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="text-[10px] text-[#C8A96E] tracking-[3px] uppercase">New Post</div>
          </div>
          <div className="flex items-center gap-2">
            {extractedContent && (
              <>
                <button
                  onClick={handleCopyContent}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1A1A18] border border-[#3A3530] rounded text-xs text-[#A09080] hover:border-[#C8A96E] hover:text-[#C8A96E] transition-colors"
                >
                  {copied ? <Check size={13} className="text-[#7B9E87]" /> : <Copy size={13} />}
                  コピー
                </button>
                <button
                  onClick={handleGenerateVariations}
                  disabled={generatingVariations}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1A1A18] border border-[#3A3530] rounded text-xs text-[#9B8BB4] hover:border-[#9B8BB4] transition-colors disabled:opacity-30"
                >
                  {generatingVariations ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
                  バリエーション
                </button>
              </>
            )}
            <button
              onClick={handleSave}
              disabled={saved}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#C8A96E] text-[#0D0D0D] rounded text-xs font-medium hover:bg-[#D4B87A] transition-colors disabled:opacity-50"
            >
              {saved ? <Check size={13} /> : <Save size={13} />}
              {saved ? '保存済み' : '保存'}
            </button>
          </div>
        </div>
      </div>

      {/* Settings bar */}
      <div className="border-b border-[#2A2520] px-4 py-2 flex items-center gap-3 flex-wrap">
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="投稿テーマ・タイトル"
          className="flex-1 min-w-[200px] px-3 py-1.5 bg-[#161412] border border-[#2A2520] rounded text-sm text-[#E8E0D5] placeholder-[#4A4840] focus:outline-none focus:border-[#C8A96E]"
        />
        <select
          value={channel}
          onChange={e => setChannel(e.target.value as Channel)}
          className="bg-[#161412] border border-[#2A2520] rounded px-2 py-1.5 text-xs text-[#A09080] focus:outline-none"
        >
          {Object.entries(CHANNEL_META).map(([key, meta]) => (
            <option key={key} value={key}>{meta.icon} {meta.label}</option>
          ))}
        </select>
        <select
          value={phase}
          onChange={e => setPhase(e.target.value as Phase)}
          className="bg-[#161412] border border-[#2A2520] rounded px-2 py-1.5 text-xs text-[#A09080] focus:outline-none"
        >
          {Object.entries(PHASE_META).map(([key, meta]) => (
            <option key={key} value={key}>{meta.label}</option>
          ))}
        </select>
        <input
          type="date"
          value={scheduledDate}
          onChange={e => setScheduledDate(e.target.value)}
          className="bg-[#161412] border border-[#2A2520] rounded px-2 py-1.5 text-xs text-[#A09080] focus:outline-none"
        />
      </div>

      {/* Chat area */}
      <ChatArea
        messages={messages}
        streamingContent={streamingContent}
        isLoading={isLoading}
      />

      {/* Input */}
      <ChatInput
        onSend={handleSend}
        disabled={isLoading}
        placeholder={messages.length === 0
          ? `${CHANNEL_META[channel].label}用の投稿テーマや方向性を伝えてください...`
          : 'フィードバックを入力...'}
      />
    </div>
  );
}
