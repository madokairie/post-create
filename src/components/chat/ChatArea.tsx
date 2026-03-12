'use client';

import { useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { ChatMessage } from '@/lib/types';

interface Props {
  messages: ChatMessage[];
  streamingContent: string;
  isLoading: boolean;
}

export default function ChatArea({ messages, streamingContent, isLoading }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
      {messages.map(msg => (
        <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
          <div
            className={`max-w-[85%] rounded-lg px-4 py-3 text-[13px] leading-relaxed ${
              msg.role === 'user'
                ? 'bg-[#1A1A18] text-[#E0D8C8] border border-[#2A2520]'
                : 'bg-[#161412] text-[#C8BFB0] border border-[#2A2520]'
            }`}
          >
            {msg.role === 'assistant' ? (
              <div className="prose-chat">
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
            ) : (
              <div className="whitespace-pre-wrap">{msg.content}</div>
            )}
          </div>
        </div>
      ))}

      {streamingContent && (
        <div className="flex justify-start">
          <div className="max-w-[85%] rounded-lg px-4 py-3 text-[13px] leading-relaxed bg-[#161412] text-[#C8BFB0] border border-[#2A2520]">
            <div className="prose-chat">
              <ReactMarkdown>{streamingContent}</ReactMarkdown>
            </div>
          </div>
        </div>
      )}

      {isLoading && !streamingContent && (
        <div className="flex justify-start">
          <div className="rounded-lg px-4 py-3 bg-[#161412] border border-[#2A2520]">
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 bg-[#C8A96E] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 bg-[#C8A96E] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 bg-[#C8A96E] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
