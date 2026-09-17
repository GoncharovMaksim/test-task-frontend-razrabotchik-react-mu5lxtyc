import React, { useState } from 'react';
import { ArrowLeft, MoreVertical, Trash2, Eraser } from 'lucide-react';
import { ChatContact } from '../../types/chat';
import { Avatar } from '../common/Avatar';

interface ChatHeaderProps {
  contact: ChatContact;
  onBack?: () => void;
  onClearChat: () => void;
  onDeleteChat: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  contact,
  onBack,
  onClearChat,
  onDeleteChat,
}) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="h-16 px-4 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between z-10">
      <div className="flex items-center gap-3 min-w-0">
        {onBack && (
          <button
            onClick={onBack}
            className="md:hidden p-1.5 -ml-1 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg"
            aria-label="Назад к чатам"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}

        <Avatar
          name={contact.displayName || contact.phoneNumber}
          color={contact.avatarColor}
          size="md"
        />

        <div className="min-w-0">
          <div className="text-sm font-semibold text-zinc-100 truncate">
            {contact.displayName}
          </div>
          <div className="text-xs text-emerald-400 font-medium flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>MAX Мессенджер ({contact.phoneNumber})</span>
          </div>
        </div>
      </div>

      {/* Menu actions */}
      <div className="relative">
        <button
          onClick={() => setShowMenu((prev) => !prev)}
          className="p-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors"
          aria-label="Опции чата"
        >
          <MoreVertical className="w-5 h-5" />
        </button>

        {showMenu && (
          <>
            <div
              className="fixed inset-0 z-20"
              onClick={() => setShowMenu(false)}
            />
            <div className="absolute right-0 top-full mt-1 w-48 bg-zinc-800 border border-zinc-700/80 rounded-xl shadow-xl py-1 z-30">
              <button
                onClick={() => {
                  setShowMenu(false);
                  onClearChat();
                }}
                className="w-full px-3 py-2 text-left text-xs text-zinc-300 hover:bg-zinc-700/60 flex items-center gap-2"
              >
                <Eraser className="w-4 h-4 text-zinc-400" />
                <span>Очистить историю</span>
              </button>
              <button
                onClick={() => {
                  setShowMenu(false);
                  onDeleteChat();
                }}
                className="w-full px-3 py-2 text-left text-xs text-rose-400 hover:bg-rose-950/40 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4 text-rose-400" />
                <span>Удалить чат</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
