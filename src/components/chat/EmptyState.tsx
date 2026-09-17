import React from 'react';
import { MessageSquarePlus, ShieldCheck, ArrowLeftRight } from 'lucide-react';
import { Button } from '../common/Button';

interface EmptyStateProps {
  onOpenNewChat: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onOpenNewChat }) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-zinc-950">
      <div className="max-w-md space-y-6">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-emerald-500 shadow-md">
          <MessageSquarePlus className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-zinc-100">
            Мессенджер MAX (GREEN-API)
          </h2>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Отправляйте и получайте текстовые сообщения в MAX через официальный шлюз GREEN-API.
            Выберите диалог из списка слева или начните новый.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
          <div className="p-3.5 rounded-xl bg-zinc-900/90 border border-zinc-800/80">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 mb-1">
              <ArrowLeftRight className="w-4 h-4" />
              <span>HTTP API технологии</span>
            </div>
            <p className="text-xs text-zinc-400">
              Отправка через SendMessage, непрерывное получение через ReceiveNotification и подтверждение через DeleteNotification.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-900/90 border border-zinc-800/80">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Безопасный клиент</span>
            </div>
            <p className="text-xs text-zinc-400">
              Ваши учетные данные хранятся локально в вашем браузере и не передаются на сторонние серверы.
            </p>
          </div>
        </div>

        <div>
          <Button
            onClick={onOpenNewChat}
            variant="primary"
            size="md"
            leftIcon={<MessageSquarePlus className="w-4 h-4" />}
          >
            Начать новый диалог
          </Button>
        </div>
      </div>
    </div>
  );
};
