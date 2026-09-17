import React, { useState } from 'react';
import { Search, Plus, MessageCircle } from 'lucide-react';
import { ChatContact } from '../../types/chat';
import { ChatListItem } from './ChatListItem';

interface ChatListProps {
  contacts: ChatContact[];
  activeChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onOpenNewChatModal: () => void;
}

export const ChatList: React.FC<ChatListProps> = ({
  contacts,
  activeChatId,
  onSelectChat,
  onOpenNewChatModal,
}) => {
  const [search, setSearch] = useState('');

  const filteredContacts = contacts.filter((c) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      c.displayName.toLowerCase().includes(q) ||
      c.phoneNumber.toLowerCase().includes(q) ||
      (c.lastMessage && c.lastMessage.toLowerCase().includes(q))
    );
  });

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-zinc-900">
      {/* Search and New Chat button */}
      <div className="p-3 border-b border-zinc-800 space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск по чатам или номеру..."
            className="w-full bg-zinc-800/80 border border-zinc-700/60 rounded-xl pl-9 pr-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
          />
        </div>

        <button
          onClick={onOpenNewChatModal}
          className="w-full py-2 px-3 rounded-xl bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 hover:text-emerald-300 text-xs font-medium flex items-center justify-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Новый чат в MAX</span>
        </button>
      </div>

      {/* Contacts scroll area */}
      <div className="flex-1 overflow-y-auto divide-y divide-zinc-800/50">
        {filteredContacts.length > 0 ? (
          filteredContacts.map((contact) => (
            <ChatListItem
              key={contact.id}
              contact={contact}
              isActive={contact.id === activeChatId}
              onSelect={onSelectChat}
            />
          ))
        ) : (
          <div className="p-6 text-center text-zinc-500">
            <MessageCircle className="w-8 h-8 mx-auto mb-2 text-zinc-600 opacity-60" />
            <p className="text-xs font-medium text-zinc-400">
              {search ? 'Ничего не найдено' : 'Список чатов пуст'}
            </p>
            <p className="text-[11px] text-zinc-500 mt-1">
              {search
                ? 'Попробуйте изменить поисковый запрос'
                : 'Нажмите "Новый чат в MAX", чтобы начать диалог'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
