'use client';

import { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';

interface Props {
  onSend: (message: string) => void;
  disabled: boolean;
  placeholder?: string;
}

export default function ChatInput({ onSend, disabled, placeholder }: Props) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 150) + 'px';
    }
  }, [value]);

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="border-t border-[#2A2520] px-4 py-3">
      <div className="flex items-end gap-2">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || 'メッセージを入力...'}
          rows={1}
          disabled={disabled}
          className="flex-1 px-3 py-2 bg-[#161412] border border-[#2A2520] rounded-lg text-sm text-[#E8E0D5] placeholder-[#4A4840] focus:outline-none focus:border-[#C8A96E] resize-none disabled:opacity-50"
        />
        <button
          onClick={handleSubmit}
          disabled={disabled || !value.trim()}
          className="p-2 bg-[#C8A96E] rounded-lg text-[#0D0D0D] hover:bg-[#D4B87A] transition-colors disabled:opacity-30"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
