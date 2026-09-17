export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

export interface ChatMessage {
  id: string;
  chatId: string;
  text: string;
  sender: 'user' | 'contact';
  senderName?: string;
  timestamp: number;
  status: MessageStatus;
  error?: string;
}

export interface ChatContact {
  id: string; // chatId formatted (e.g. 79991234567@c.us)
  phoneNumber: string; // raw digits (e.g. 79991234567)
  displayName: string; // formatted phone or custom name
  lastMessage?: string;
  lastMessageTime?: number;
  unreadCount: number;
  avatarColor: string;
}

export interface PollingStats {
  isRunning: boolean;
  lastPollTime: number | null;
  totalReceived: number;
  lastError: string | null;
}
