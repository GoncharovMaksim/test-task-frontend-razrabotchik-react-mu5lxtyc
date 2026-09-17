import React, { useState, useEffect, useRef } from 'react';
import { X, Phone, MessageSquarePlus } from 'lucide-react';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { isValidPhoneNumber, formatPhoneNumberDisplay, cleanPhoneNumber } from '../../utils/phone';

interface NewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateChat: (phone: string) => void;
}

export const NewChatModal: React.FC<NewChatModalProps> = ({
  isOpen,
  onClose,
  onCreateChat,
}) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setPhoneNumber('');
      setError(null);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const digits = cleanPhoneNumber(phoneNumber);

    if (!digits) {
      setError('Введите номер телефона');
      return;
    }

    if (!isValidPhoneNumber(digits)) {
      setError('Некорректный формат (должно быть от 10 до 15 цифр)');
      return;
    }

    onCreateChat(digits);
    onClose();
  };

  const previewDisplay = phoneNumber ? formatPhoneNumberDisplay(phoneNumber) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-600/10 text-emerald-500 border border-emerald-500/20">
              <MessageSquarePlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-100">
                Новый чат в MAX
              </h3>
              <p className="text-xs text-zinc-400">
                Введите номер телефона получателя
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors"
            aria-label="Закрыть"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <Input
              ref={inputRef}
              label="Номер телефона получателя"
              placeholder="+7 (999) 000-00-00 или 79991234567"
              value={phoneNumber}
              onChange={(e) => {
                setPhoneNumber(e.target.value);
                if (error) setError(null);
              }}
              error={error || undefined}
              leftIcon={<Phone className="w-4 h-4" />}
              helperText="Поддерживаются номера РФ (+7/8), СНГ и международные форматы"
            />

            {previewDisplay && !error && (
              <div className="mt-2 px-3 py-1.5 rounded-lg bg-zinc-800/60 border border-zinc-700/50 flex items-center justify-between text-xs">
                <span className="text-zinc-400">Формат отображения:</span>
                <span className="font-mono text-emerald-400 font-medium">
                  {previewDisplay}
                </span>
              </div>
            )}
          </div>

          <div className="pt-2 flex justify-end gap-2.5">
            <Button type="button" variant="ghost" onClick={onClose}>
              Отмена
            </Button>
            <Button type="submit" variant="primary">
              Создать чат
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
