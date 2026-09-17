import React from 'react';
import { useChat } from '../../context/ChatContext';
import { ChatHeader } from './ChatHeader';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { EmptyState } from './EmptyState';

interface ChatAreaProps {
  onBack?: () => void;
  onOpenNewChat: () => void;
}

export const ChatArea: React.FC<ChatAreaProps> = ({ onBack, onOpenNewChat }) => {
  const {
    activeContact,
    currentMessages,
    sendMessageText,
    isSending,
    clearChat,
    deleteChat,
  } = useChat();

  if (!activeContact) {
    return <EmptyState onOpenNewChat={onOpenNewChat} />;
  }

  const handleClear = () => {
    if (window.confirm('Вы действительно хотите очистить историю сообщений в этом чате?')) {
      clearChat(activeContact.id);
    }
  };

  const handleDelete = () => {
    if (window.confirm(`Удалить чат с ${activeContact.displayName}?`)) {
      deleteChat(activeContact.id);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-950 overflow-hidden">
      <ChatHeader
        contact={activeContact}
        onBack={onBack}
        onClearChat={handleClear}
        onDeleteChat={handleDelete}
      />

      <MessageList
        messages={currentMessages}
        onRetry={(msgId) => {
          const msg = currentMessages.find((m) => m.id === msgId);
          if (msg) {
            sendMessageText(msg.text);
          }
        }}
      />

      <MessageInput
        onSendMessage={sendMessageText}
        disabled={isSending}
        placeholder={`Сообщение для ${activeContact.displayName}...`}
      />
    </div>
  );
};
