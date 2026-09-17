import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { ChatContact, ChatMessage } from '../types/chat';
import { ReceiveNotificationResponse } from '../types/greenApi';
import { useAuth } from './AuthContext';
import { sendMessage as apiSendMessage } from '../services/greenApi';
import { storage } from '../services/storage';
import { formatChatId, formatPhoneNumberDisplay, cleanPhoneNumber, extractPhoneFromChatId } from '../utils/phone';
import { getAvatarColor } from '../utils/formatters';
import { playNotificationSound } from '../utils/sound';
import { useGreenApiPolling } from '../hooks/useGreenApiPolling';

interface ChatContextType {
  contacts: ChatContact[];
  messages: Record<string, ChatMessage[]>;
  activeChatId: string | null;
  activeContact: ChatContact | null;
  currentMessages: ChatMessage[];
  createChat: (phoneNumber: string) => string;
  selectChat: (chatId: string) => void;
  sendMessageText: (text: string) => Promise<boolean>;
  deleteChat: (chatId: string) => void;
  clearChat: (chatId: string) => void;
  isSending: boolean;
  isPolling: boolean;
  pollingError: string | null;
  soundEnabled: boolean;
  toggleSound: () => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { credentials, isConfigured } = useAuth();

  const [contacts, setContacts] = useState<ChatContact[]>(() => storage.getContacts());
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>(() => storage.getMessages());
  const [activeChatId, setActiveChatId] = useState<string | null>(() => storage.getActiveChatId());
  const [isSending, setIsSending] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => storage.isSoundEnabled());
  const [theme, setTheme] = useState<'dark' | 'light'>(() => storage.getTheme());

  // Apply theme class to document
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    storage.setTheme(theme);
  }, [theme]);

  // Persist contacts and messages
  useEffect(() => {
    storage.saveContacts(contacts);
  }, [contacts]);

  useEffect(() => {
    storage.saveMessages(messages);
  }, [messages]);

  useEffect(() => {
    storage.saveActiveChatId(activeChatId);
  }, [activeChatId]);

  const toggleSound = () => {
    setSoundEnabled((prev) => {
      const next = !prev;
      storage.setSoundEnabled(next);
      return next;
    });
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Find active contact
  const activeContact = useMemo(() => {
    if (!activeChatId) return null;
    return contacts.find((c) => c.id === activeChatId) || null;
  }, [contacts, activeChatId]);

  // Find messages for active chat
  const currentMessages = useMemo(() => {
    if (!activeChatId) return [];
    return messages[activeChatId] || [];
  }, [messages, activeChatId]);

  // Create or select chat
  const createChat = useCallback((phoneOrChatId: string): string => {
    const formattedId = formatChatId(phoneOrChatId);
    const rawPhone = extractPhoneFromChatId(formattedId);
    const display = formatPhoneNumberDisplay(formattedId);

    setContacts((prev) => {
      const existing = prev.find((c) => c.id === formattedId);
      if (existing) {
        return prev;
      }
      const newContact: ChatContact = {
        id: formattedId,
        phoneNumber: rawPhone,
        displayName: display,
        unreadCount: 0,
        avatarColor: getAvatarColor(formattedId),
      };
      return [newContact, ...prev];
    });

    setActiveChatId(formattedId);
    return formattedId;
  }, []);

  const selectChat = useCallback((chatId: string) => {
    setActiveChatId(chatId);
    // Mark messages as read for this chat
    setContacts((prev) =>
      prev.map((c) => (c.id === chatId ? { ...c, unreadCount: 0 } : c))
    );
  }, []);

  const deleteChat = useCallback((chatId: string) => {
    setContacts((prev) => prev.filter((c) => c.id !== chatId));
    setMessages((prev) => {
      const copy = { ...prev };
      delete copy[chatId];
      return copy;
    });
    setActiveChatId((current) => (current === chatId ? null : current));
  }, []);

  const clearChat = useCallback((chatId: string) => {
    setMessages((prev) => ({
      ...prev,
      [chatId]: [],
    }));
    setContacts((prev) =>
      prev.map((c) =>
        c.id === chatId
          ? { ...c, lastMessage: undefined, lastMessageTime: undefined }
          : c
      )
    );
  }, []);

  // Send message
  const sendMessageText = useCallback(
    async (text: string): Promise<boolean> => {
      if (!text.trim() || !activeChatId || !credentials) {
        return false;
      }

      const tempId = 'temp_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
      const timestamp = Date.now();
      const trimmedText = text.trim();

      const optimisticMessage: ChatMessage = {
        id: tempId,
        chatId: activeChatId,
        text: trimmedText,
        sender: 'user',
        timestamp,
        status: 'sending',
      };

      // Add optimistic message
      setMessages((prev) => ({
        ...prev,
        [activeChatId]: [...(prev[activeChatId] || []), optimisticMessage],
      }));

      // Update contact preview
      setContacts((prev) =>
        prev.map((c) =>
          c.id === activeChatId
            ? { ...c, lastMessage: trimmedText, lastMessageTime: timestamp }
            : c
        )
      );

      setIsSending(true);

      try {
        const response = await apiSendMessage(credentials, {
          chatId: activeChatId,
          message: trimmedText,
        });

        // Update message status to sent
        setMessages((prev) => ({
          ...prev,
          [activeChatId]: (prev[activeChatId] || []).map((m) =>
            m.id === tempId ? { ...m, id: response.idMessage || tempId, status: 'sent' } : m
          ),
        }));

        return true;
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : 'Ошибка отправки';
        setMessages((prev) => ({
          ...prev,
          [activeChatId]: (prev[activeChatId] || []).map((m) =>
            m.id === tempId ? { ...m, status: 'failed', error: errorMsg } : m
          ),
        }));
        return false;
      } finally {
        setIsSending(false);
      }
    },
    [activeChatId, credentials]
  );

  // Handle incoming notification from polling
  const handleIncomingNotification = useCallback(
    async (notification: ReceiveNotificationResponse) => {
      const { body } = notification;
      if (!body) return;

      // Check if this is an incoming message
      if (body.typeWebhook === 'incomingMessageReceived') {
        const senderChatId = body.senderData?.chatId;
        if (!senderChatId) return;

        // Extract message text from textMessageData or extendedTextMessageData
        let text = '';
        if (body.messageData?.typeMessage === 'textMessage') {
          text = body.messageData.textMessageData?.textMessage || '';
        } else if (body.messageData?.typeMessage === 'extendedTextMessage') {
          text = body.messageData.extendedTextMessageData?.text || '';
        } else if (body.messageData?.textMessageData?.textMessage) {
          text = body.messageData.textMessageData.textMessage;
        }

        if (!text) return;

        const messageTimestamp = body.timestamp ? body.timestamp * 1000 : Date.now();
        const incomingId = body.idMessage || `inc_${Date.now()}`;
        const senderName = body.senderData?.senderContactName || body.senderData?.senderName;

        // Ensure contact exists
        setContacts((prev) => {
          const index = prev.findIndex((c) => c.id === senderChatId);
          const isCurrentlyActive = activeChatId === senderChatId;
          const display = senderName || formatPhoneNumberDisplay(senderChatId);

          if (index >= 0) {
            const updated = [...prev];
            const contact = updated[index];
            updated[index] = {
              ...contact,
              displayName: senderName || contact.displayName,
              lastMessage: text,
              lastMessageTime: messageTimestamp,
              unreadCount: isCurrentlyActive ? 0 : contact.unreadCount + 1,
            };
            // Move contact to top of list
            const [moved] = updated.splice(index, 1);
            return [moved, ...updated];
          } else {
            const rawPhone = cleanPhoneNumber(extractPhoneFromChatId(senderChatId));
            const newContact: ChatContact = {
              id: senderChatId,
              phoneNumber: rawPhone,
              displayName: display,
              lastMessage: text,
              lastMessageTime: messageTimestamp,
              unreadCount: isCurrentlyActive ? 0 : 1,
              avatarColor: getAvatarColor(senderChatId),
            };
            return [newContact, ...prev];
          }
        });

        // Add message to chat history
        setMessages((prev) => {
          const chatHistory = prev[senderChatId] || [];
          // Avoid duplicate messages
          if (chatHistory.some((m) => m.id === incomingId)) {
            return prev;
          }

          const newMsg: ChatMessage = {
            id: incomingId,
            chatId: senderChatId,
            text,
            sender: 'contact',
            senderName,
            timestamp: messageTimestamp,
            status: 'read',
          };

          return {
            ...prev,
            [senderChatId]: [...chatHistory, newMsg],
          };
        });

        // Sound chime if enabled
        if (soundEnabled) {
          playNotificationSound();
        }
      } else if (
        body.typeWebhook === 'outgoingMessageStatus' ||
        body.typeWebhook === 'outgoingAPIMessageReceived'
      ) {
        // Status update for outgoing message
        const messageId = body.idMessage;
        const status = body.status; // e.g. delivered, read, sent

        if (messageId && status) {
          setMessages((prev) => {
            let updated = false;
            const newDict = { ...prev };

            for (const [cId, msgList] of Object.entries(newDict)) {
              const msgIndex = msgList.findIndex((m) => m.id === messageId);
              if (msgIndex !== -1) {
                const targetMsg = msgList[msgIndex];
                const nextStatus =
                  status === 'read' ? 'read' : status === 'delivered' ? 'delivered' : 'sent';
                const updatedList = [...msgList];
                updatedList[msgIndex] = { ...targetMsg, status: nextStatus };
                newDict[cId] = updatedList;
                updated = true;
                break;
              }
            }

            return updated ? newDict : prev;
          });
        }
      }
    },
    [activeChatId, soundEnabled]
  );

  // Hook for HTTP API polling
  const { isPolling, pollingError } = useGreenApiPolling({
    credentials,
    enabled: isConfigured,
    onIncomingNotification: handleIncomingNotification,
  });

  return (
    <ChatContext.Provider
      value={{
        contacts,
        messages,
        activeChatId,
        activeContact,
        currentMessages,
        createChat,
        selectChat,
        sendMessageText,
        deleteChat,
        clearChat,
        isSending,
        isPolling,
        pollingError,
        soundEnabled,
        toggleSound,
        theme,
        toggleTheme,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export function useChat(): ChatContextType {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
