'use client';

import { useState, useEffect, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Sparkles, Copy, Check, Loader2, Trash2 } from 'lucide-react';
import { Channel, Phase, ChatMessage, CHANNEL_META, PHASE_META } from '@/lib/types';
import { getProject, getPost, updatePost, getChatMessages, saveChatMessage, deletePost } from '@/lib/store';
import { buildSystemPrompt, buildVariationPrompt } from '@/lib/prompt';
import ChatArea from '@/components/chat/ChatArea';
import ChatInput from '@/components/chat/ChatInput';

export default function EditPostPage({ params }: { params: Promise<{ id: string; postId: string }> }) {
  const { id: projectId, postId } = use(params);
  const router = useRouter();

  const [channel, setChannel] = useState<Channel>('instagram_feed');
  const [phase, setPhase] = useState<Phase>('pre_pre');
  const [title, setTitle] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streamingContent, setStreamingContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [extractedContent, setExtractedContent] = useState('');
  const [extractedHashtags, setExtractedHashtags] = useState('');
  const [copied, setCopied] = useState(false);
  const [generatingVariations, setGeneratingVariations] = useState(false);

  const project = typeof window !== 'undefined' ? getProject(projectId) : null;

  useEffect(() => {
    const post = getPost(postId);
    if (!post) { router.push(`/projects/${projectId}`); return; }
    setChannel(post.channel);
    setPhase(post.phase);
    setTitle(post.title);
    setScheduledDate(post.scheduledDate || '');
    setExtractedContent(post.content);
    setExtractedHashtags(post.hashtags || '');

    const msgs = getChatMessages(postId);
    setMessages(msgs);
  }, [postId, projectId, router]);

  const getSystemPrompt = useCallback(() => {
    if (!project) return '';
    return buildSystemPrompt({
      channel,
      phase,
      conceptSheet: project.conceptSheet,
      extractedData: project.extractedData,
    });
  }, [project, channel, phase]);

  // Extract latest content from new messages
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
      postId,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMsg]);
    saveChatMessage({ postId, role: 'user', content: text });
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

      saveChatMessage({ postId, role: 'assistant', content: accumulated });
      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        postId,
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
    updatePost(postId, {
      channel,
      phase,
      title: title.trim(),
      content: extractedContent,
      hashtags: extractedHashtags || undefined,
      scheduledDate: scheduledDate || undefined,
    });
    router.push(`/projects/${projectId}`);
  };

  const handleDelete = () => {
    if (!confirm('この投稿を削除しますか？')) return;
    deletePost(postId);
    router.push(`/projects/${projectId}`);
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

      saveChatMessage({ postId, role: 'assistant', content });
      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        postId,
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
            <div className="text-[10px] text-[#C8A96E] tracking-[3px] uppercase">Edit Post</div>
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
              onClick={handleDelete}
              className="p-1.5 text-[#6A6058] hover:text-[#C47A5A] transition-colors"
            >
              <Trash2 size={15} />
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#C8A96E] text-[#0D0D0D] rounded text-xs font-medium hover:bg-[#D4B87A] transition-colors"
            >
              <Save size={13} />
              保存
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
        placeholder="フィードバックを入力..."
      />
    </div>
  );
}
