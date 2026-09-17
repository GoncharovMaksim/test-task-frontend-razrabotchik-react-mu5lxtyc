import { render, screen } from '@testing-library/react';
import { MessageBubble } from '../src/components/chat/MessageBubble';
import { ChatMessage } from '../src/types/chat';

describe('MessageBubble Component', () => {
  it('renders outgoing message correctly with checkmark', () => {
    const outgoingMsg: ChatMessage = {
      id: 'msg-1',
      chatId: '79991234567@c.us',
      text: 'Привет от пользователя!',
      sender: 'user',
      timestamp: new Date(2026, 8, 17, 12, 0, 0).getTime(),
      status: 'sent',
    };

    render(<MessageBubble message={outgoingMsg} />);

    expect(screen.getByText('Привет от пользователя!')).toBeInTheDocument();
    expect(screen.getByText('12:00')).toBeInTheDocument();
  });

  it('renders incoming message with sender name', () => {
    const incomingMsg: ChatMessage = {
      id: 'msg-2',
      chatId: '79991234567@c.us',
      text: 'Ответ от собеседника в MAX',
      sender: 'contact',
      senderName: 'Иван MAX',
      timestamp: new Date(2026, 8, 17, 12, 5, 0).getTime(),
      status: 'read',
    };

    render(<MessageBubble message={incomingMsg} />);

    expect(screen.getByText('Ответ от собеседника в MAX')).toBeInTheDocument();
    expect(screen.getByText('Иван MAX')).toBeInTheDocument();
    expect(screen.getByText('12:05')).toBeInTheDocument();
  });
});
