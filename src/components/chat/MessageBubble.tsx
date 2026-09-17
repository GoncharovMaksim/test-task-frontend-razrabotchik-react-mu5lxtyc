import React from 'react';
import { Check, CheckCheck, Clock, AlertCircle } from 'lucide-react';
import { ChatMessage } from '../../types/chat';
import { formatTime } from '../../utils/formatters';

interface MessageBubbleProps {
  message: ChatMessage;
  onRetry?: (messageId: string) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, onRetry }) => {
  const isOutgoing = message.sender === 'user';

  const renderStatus = () => {
    if (!isOutgoing) return null;

    switch (message.status) {
      case 'sending':
        return <Clock className="w-3 h-3 text-zinc-300 animate-pulse inline ml-1" />;
      case 'sent':
        return <Check className="w-3.5 h-3.5 text-zinc-300 inline ml-1" />;
      case 'delivered':
        return <CheckCheck className="w-3.5 h-3.5 text-zinc-300 inline ml-1" />;
      case 'read':
        return <CheckCheck className="w-3.5 h-3.5 text-sky-200 inline ml-1" />;
      case 'failed':
        return (
          <button
            onClick={() => onRetry?.(message.id)}
            title={message.error || 'Ошибка отправки. Нажмите для повтора.'}
            className="text-rose-300 hover:text-white inline ml-1"
          >
            <AlertCircle className="w-3.5 h-3.5" />
          </button>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={`flex w-full mb-2 ${
        isOutgoing ? 'justify-end' : 'justify-start'
      }`}
    >
      <div
        className={`relative max-w-[85%] sm:max-w-[70%] rounded-2xl px-3.5 py-2 text-sm shadow-sm transition-all select-text ${
          isOutgoing
            ? 'bg-emerald-600 text-white rounded-tr-none'
            : 'bg-zinc-800/90 text-zinc-100 border border-zinc-700/60 rounded-tl-none'
        }`}
      >
        {!isOutgoing && message.senderName && (
          <div className="text-xs font-semibold text-emerald-400 mb-1">
            {message.senderName}
          </div>
        )}

        <div className="whitespace-pre-wrap break-words leading-relaxed">
          {message.text}
        </div>

        <div
          className={`flex items-center justify-end gap-1 mt-1 text-[11px] select-none ${
            isOutgoing ? 'text-emerald-100/80' : 'text-zinc-400'
          }`}
        >
          <span>{formatTime(message.timestamp)}</span>
          {renderStatus()}
        </div>
      </div>
    </div>
  );
};
