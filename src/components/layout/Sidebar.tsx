import React, { useState } from 'react';
import {
  Settings,
  LogOut,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  Radio,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { ChatList } from '../chat/ChatList';
import { Badge } from '../common/Badge';
import { CredentialsModal } from '../auth/CredentialsModal';
import { NewChatModal } from '../modals/NewChatModal';

export const Sidebar: React.FC = () => {
  const { credentials, instanceState, logout } = useAuth();
  const {
    contacts,
    activeChatId,
    selectChat,
    createChat,
    isPolling,
    pollingError,
    soundEnabled,
    toggleSound,
    theme,
    toggleTheme,
  } = useChat();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);

  const getStatusBadge = () => {
    if (pollingError) {
      return <Badge status="error" label="Ошибка связи" />;
    }
    if (isPolling) {
      return <Badge status="polling" label="Опрос HTTP API" />;
    }
    if (instanceState === 'authorized') {
      return <Badge status="connected" label="Авторизован" />;
    }
    return <Badge status="disconnected" label="Не подключен" />;
  };

  return (
    <aside className="w-full md:w-80 lg:w-96 h-full flex flex-col bg-zinc-900 border-r border-zinc-800 select-none">
      {/* Sidebar Header */}
      <div className="p-3.5 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white font-bold text-base shadow-sm">
            M
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm tracking-tight text-zinc-100">
                MAX Chat
              </span>
              <span className="text-[10px] font-semibold uppercase px-1.5 py-0.2 bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 rounded">
                GREEN-API
              </span>
            </div>
            <div className="text-[11px] text-zinc-400 font-mono">
              id: {credentials?.idInstance || '—'}
            </div>
          </div>
        </div>

        {/* Quick action buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={toggleSound}
            className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors"
            title={soundEnabled ? 'Выключить звук' : 'Включить звук'}
            aria-label="Звук уведомлений"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-zinc-500" />
            )}
          </button>

          <button
            onClick={toggleTheme}
            className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors"
            title={theme === 'dark' ? 'Светлая тема' : 'Темная тема'}
            aria-label="Переключить тему"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-zinc-400" />
            )}
          </button>

          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors"
            title="Настройки GREEN-API"
            aria-label="Настройки"
          >
            <Settings className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              if (window.confirm('Выйти из учетной записи GREEN-API?')) {
                logout();
              }
            }}
            className="p-1.5 text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 rounded-lg transition-colors"
            title="Выйти"
            aria-label="Выход"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Instance connectivity & HTTP API polling state */}
      <div className="px-3.5 py-2 bg-zinc-950/60 border-b border-zinc-800/80 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
          <span className="text-zinc-400 font-medium">Статус шлюза:</span>
        </div>
        <div>{getStatusBadge()}</div>
      </div>

      {/* Chat List */}
      <ChatList
        contacts={contacts}
        activeChatId={activeChatId}
        onSelectChat={selectChat}
        onOpenNewChatModal={() => setIsNewChatOpen(true)}
      />

      {/* Modals */}
      <CredentialsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        canClose={true}
      />

      <NewChatModal
        isOpen={isNewChatOpen}
        onClose={() => setIsNewChatOpen(false)}
        onCreateChat={createChat}
      />
    </aside>
  );
};
