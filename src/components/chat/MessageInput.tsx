import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';

interface MessageInputProps {
  onSendMessage: (text: string) => Promise<boolean>;
  disabled?: boolean;
  placeholder?: string;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  disabled = false,
  placeholder = 'Напишите сообщение...',
}) => {
  const [text, setText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        140
      )}px`;
    }
  }, [text]);

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || disabled || isSending) return;

    setIsSending(true);
    const success = await onSendMessage(trimmed);
    setIsSending(false);

    if (success) {
      setText('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.focus();
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-3 bg-zinc-900 border-t border-zinc-800">
      <div className="flex items-end gap-2 bg-zinc-800/80 border border-zinc-700/70 rounded-2xl px-3 py-1.5 focus-within:border-emerald-500/80 transition-colors">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled || isSending}
          rows={1}
          className="flex-1 bg-transparent text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none resize-none py-1 max-h-36 leading-relaxed disabled:opacity-50"
        />

        <button
          onClick={handleSend}
          disabled={!text.trim() || disabled || isSending}
          aria-label="Отправить сообщение"
          className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-white transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 flex-shrink-0"
        >
          {isSending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </div>
      <div className="flex justify-between items-center px-2 pt-1 text-[11px] text-zinc-500 select-none">
        <span>Enter для отправки, Shift + Enter для новой строки</span>
        <span>Только текстовые сообщения (MAX)</span>
      </div>
    </div>
  );
};
