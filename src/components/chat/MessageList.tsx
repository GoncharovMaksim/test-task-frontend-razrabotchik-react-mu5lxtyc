import React, { useEffect, useRef } from 'react';
import { ChatMessage } from '../../types/chat';
import { MessageBubble } from './MessageBubble';
import { formatDateGroup } from '../../utils/formatters';
import { MessageSquare } from 'lucide-react';

interface MessageListProps {
  messages: ChatMessage[];
  onRetry?: (messageId: string) => void;
}

export const MessageList: React.FC<MessageListProps> = ({ messages, onRetry }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages.length]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-zinc-500">
        <div className="w-12 h-12 rounded-full bg-zinc-800/60 border border-zinc-700/50 flex items-center justify-center mb-3 text-zinc-400">
          <MessageSquare className="w-6 h-6" />
        </div>
        <p className="text-sm font-medium text-zinc-300">Сообщений пока нет</p>
        <p className="text-xs text-zinc-500 mt-1 max-w-xs">
          Напишите первое текстовое сообщение получателю в мессенджер MAX.
        </p>
      </div>
    );
  }

  // Group messages by date
  const grouped: { date: string; items: ChatMessage[] }[] = [];
  let currentDate = '';
  let currentGroup: ChatMessage[] = [];

  messages.forEach((msg) => {
    const dateStr = formatDateGroup(msg.timestamp);
    if (dateStr !== currentDate) {
      if (currentGroup.length > 0) {
        grouped.push({ date: currentDate, items: currentGroup });
      }
      currentDate = dateStr;
      currentGroup = [msg];
    } else {
      currentGroup.push(msg);
    }
  });

  if (currentGroup.length > 0) {
    grouped.push({ date: currentDate, items: currentGroup });
  }

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto px-4 py-3 space-y-4"
    >
      {grouped.map((group) => (
        <div key={group.date} className="space-y-2">
          <div className="flex items-center justify-center my-3">
            <span className="bg-zinc-800/80 text-zinc-400 text-[11px] font-medium px-2.5 py-0.5 rounded-full border border-zinc-700/50 shadow-sm">
              {group.date}
            </span>
          </div>

          {group.items.map((msg) => (
            <MessageBubble key={msg.id} message={msg} onRetry={onRetry} />
          ))}
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};
