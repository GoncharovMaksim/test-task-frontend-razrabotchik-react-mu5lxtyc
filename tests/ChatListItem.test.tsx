import { jest } from '@jest/globals';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChatListItem } from '../src/components/chat/ChatListItem';
import { ChatContact } from '../src/types/chat';

describe('ChatListItem Component', () => {
  const mockContact: ChatContact = {
    id: '79991234567@c.us',
    phoneNumber: '79991234567',
    displayName: '+7 (999) 123-45-67',
    lastMessage: 'Последнее входящее сообщение',
    lastMessageTime: new Date(2026, 8, 17, 10, 15, 0).getTime(),
    unreadCount: 3,
    avatarColor: 'bg-emerald-600',
  };

  it('renders contact details and unread badge', () => {
    const onSelect = jest.fn();
    render(
      <ChatListItem
        contact={mockContact}
        isActive={false}
        onSelect={onSelect}
      />
    );

    expect(screen.getByText('+7 (999) 123-45-67')).toBeInTheDocument();
    expect(screen.getByText('Последнее входящее сообщение')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button'));
    expect(onSelect).toHaveBeenCalledWith('79991234567@c.us');
  });
});
