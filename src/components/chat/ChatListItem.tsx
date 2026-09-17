import React from 'react';
import { ChatContact } from '../../types/chat';
import { Avatar } from '../common/Avatar';
import { formatTime, truncateText } from '../../utils/formatters';

interface ChatListItemProps {
  contact: ChatContact;
  isActive: boolean;
  onSelect: (chatId: string) => void;
}

export const ChatListItem: React.FC<ChatListItemProps> = ({
  contact,
  isActive,
  onSelect,
}) => {
  return (
    <button
      onClick={() => onSelect(contact.id)}
      className={`w-full px-3 py-2.5 flex items-center gap-3 transition-colors text-left select-none relative ${
        isActive
          ? 'bg-zinc-800/90 border-l-2 border-emerald-500'
          : 'hover:bg-zinc-800/40 border-l-2 border-transparent'
      }`}
    >
      <Avatar
        name={contact.displayName || contact.phoneNumber}
        color={contact.avatarColor}
        size="md"
      />

      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline mb-0.5">
          <span className="text-sm font-medium text-zinc-100 truncate">
            {contact.displayName}
          </span>
          {contact.lastMessageTime && (
            <span className="text-[11px] text-zinc-500 ml-2 flex-shrink-0">
              {formatTime(contact.lastMessageTime)}
            </span>
          )}
        </div>

        <div className="flex justify-between items-center text-xs text-zinc-400">
          <span className="truncate">
            {contact.lastMessage ? (
              truncateText(contact.lastMessage, 34)
            ) : (
              <span className="italic text-zinc-500">Нет сообщений</span>
            )}
          </span>

          {contact.unreadCount > 0 && (
            <span className="ml-2 flex-shrink-0 px-1.5 py-0.5 text-[10px] font-bold bg-emerald-600 text-white rounded-full min-w-[18px] text-center">
              {contact.unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
};
