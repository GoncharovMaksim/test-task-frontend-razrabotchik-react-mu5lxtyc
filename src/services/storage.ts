import { GreenApiCredentials } from '../types/greenApi';
import { ChatContact, ChatMessage } from '../types/chat';

const STORAGE_KEYS = {
  CREDENTIALS: 'max_green_api_credentials',
  CONTACTS: 'max_green_api_contacts',
  MESSAGES: 'max_green_api_messages',
  ACTIVE_CHAT: 'max_green_api_active_chat',
  SOUND_ENABLED: 'max_green_api_sound_enabled',
  THEME: 'max_green_api_theme',
};

export const storage = {
  getCredentials(): GreenApiCredentials | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CREDENTIALS);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  saveCredentials(credentials: GreenApiCredentials): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CREDENTIALS, JSON.stringify(credentials));
    } catch {
      // ignore
    }
  },

  clearCredentials(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.CREDENTIALS);
    } catch {
      // ignore
    }
  },

  getContacts(): ChatContact[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CONTACTS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveContacts(contacts: ChatContact[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(contacts));
    } catch {
      // ignore
    }
  },

  getMessages(): Record<string, ChatMessage[]> {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MESSAGES);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  },

  saveMessages(messages: Record<string, ChatMessage[]>): void {
    try {
      localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
    } catch {
      // ignore
    }
  },

  getActiveChatId(): string | null {
    try {
      return localStorage.getItem(STORAGE_KEYS.ACTIVE_CHAT);
    } catch {
      return null;
    }
  },

  saveActiveChatId(chatId: string | null): void {
    try {
      if (chatId) {
        localStorage.setItem(STORAGE_KEYS.ACTIVE_CHAT, chatId);
      } else {
        localStorage.removeItem(STORAGE_KEYS.ACTIVE_CHAT);
      }
    } catch {
      // ignore
    }
  },

  isSoundEnabled(): boolean {
    try {
      const val = localStorage.getItem(STORAGE_KEYS.SOUND_ENABLED);
      return val !== 'false';
    } catch {
      return true;
    }
  },

  setSoundEnabled(enabled: boolean): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SOUND_ENABLED, String(enabled));
    } catch {
      // ignore
    }
  },

  getTheme(): 'dark' | 'light' {
    try {
      const val = localStorage.getItem(STORAGE_KEYS.THEME);
      return val === 'light' ? 'light' : 'dark';
    } catch {
      return 'dark';
    }
  },

  setTheme(theme: 'dark' | 'light'): void {
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, theme);
    } catch {
      // ignore
    }
  },

  clearAll(): void {
    try {
      Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
    } catch {
      // ignore
    }
  },
};
