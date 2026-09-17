import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { Sidebar } from './Sidebar';
import { ChatArea } from '../chat/ChatArea';
import { CredentialsModal } from '../auth/CredentialsModal';
import { NewChatModal } from '../modals/NewChatModal';

export const MainLayout: React.FC = () => {
  const { isConfigured } = useAuth();
  const { activeChatId, selectChat, createChat } = useChat();
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-zinc-950 font-sans text-zinc-100 antialiased">
      {/* If credentials not set, display mandatory setup modal */}
      <CredentialsModal isOpen={!isConfigured} canClose={false} />

      {/* New chat modal (can be opened from empty state) */}
      <NewChatModal
        isOpen={isNewChatOpen}
        onClose={() => setIsNewChatOpen(false)}
        onCreateChat={createChat}
      />

      {/* Sidebar: hidden on mobile if activeChatId is open */}
      <div
        className={`${
          activeChatId ? 'hidden md:flex' : 'flex'
        } w-full md:w-80 lg:w-96 h-full flex-shrink-0`}
      >
        <Sidebar />
      </div>

      {/* Main chat area: full width on mobile when active, always visible on md+ */}
      <main
        className={`${
          !activeChatId ? 'hidden md:flex' : 'flex'
        } flex-1 h-full min-w-0 flex-col`}
      >
        <ChatArea
          onBack={() => selectChat('')}
          onOpenNewChat={() => setIsNewChatOpen(true)}
        />
      </main>
    </div>
  );
};
