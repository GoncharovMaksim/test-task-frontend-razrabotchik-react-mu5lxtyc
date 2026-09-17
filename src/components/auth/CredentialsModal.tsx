import React, { useState, useEffect } from 'react';
import { KeyRound, ShieldCheck, ExternalLink, X, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { DEFAULT_API_URL } from '../../services/greenApi';

interface CredentialsModalProps {
  isOpen: boolean;
  onClose?: () => void;
  canClose?: boolean;
}

export const CredentialsModal: React.FC<CredentialsModalProps> = ({
  isOpen,
  onClose,
  canClose = true,
}) => {
  const { credentials, login, isLoading, error, setError, isConfigured } = useAuth();

  const [idInstance, setIdInstance] = useState(credentials?.idInstance || '');
  const [apiTokenInstance, setApiTokenInstance] = useState(
    credentials?.apiTokenInstance || ''
  );
  const [apiUrl, setApiUrl] = useState(credentials?.apiUrl || DEFAULT_API_URL);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (credentials) {
      setIdInstance(credentials.idInstance);
      setApiTokenInstance(credentials.apiTokenInstance);
      setApiUrl(credentials.apiUrl || DEFAULT_API_URL);
    }
  }, [credentials]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    setError(null);

    const trimmedId = idInstance.trim();
    const trimmedToken = apiTokenInstance.trim();
    const trimmedUrl = apiUrl.trim() || DEFAULT_API_URL;

    if (!trimmedId) {
      setValidationError('Укажите idInstance');
      return;
    }

    if (!trimmedToken) {
      setValidationError('Укажите apiTokenInstance');
      return;
    }

    const success = await login({
      idInstance: trimmedId,
      apiTokenInstance: trimmedToken,
      apiUrl: trimmedUrl,
    });

    if (success && onClose) {
      onClose();
    }
  };

  const handleClose = () => {
    if (canClose && onClose) {
      setError(null);
      setValidationError(null);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-600/10 text-emerald-400 border border-emerald-500/20">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-zinc-100">
                Подключение к GREEN-API
              </h2>
              <p className="text-xs text-zinc-400">
                Введите данные инстанса для работы с MAX
              </p>
            </div>
          </div>

          {canClose && isConfigured && (
            <button
              onClick={handleClose}
              className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors"
              aria-label="Закрыть"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3.5 rounded-xl bg-zinc-800/60 border border-zinc-700/60 text-xs text-zinc-300 leading-relaxed space-y-1">
            <div className="flex items-center gap-1.5 font-medium text-zinc-200">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Данные из личного кабинета GREEN-API</span>
            </div>
            <p className="text-zinc-400">
              Получите <code className="text-emerald-300">idInstance</code> и{' '}
              <code className="text-emerald-300">apiTokenInstance</code> в консоли управления.
            </p>
            <a
              href="https://console.green-api.com"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-emerald-400 hover:underline pt-0.5"
            >
              <span>Открыть console.green-api.com</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {(validationError || error) && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 flex items-start gap-2.5 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-400" />
              <span>{validationError || error}</span>
            </div>
          )}

          <div className="space-y-3">
            <Input
              label="idInstance"
              placeholder="Например: 1101820982"
              value={idInstance}
              onChange={(e) => {
                setIdInstance(e.target.value);
                setValidationError(null);
              }}
              required
            />

            <Input
              label="apiTokenInstance"
              type="password"
              placeholder="Например: d75b3b890a414920..."
              value={apiTokenInstance}
              onChange={(e) => {
                setApiTokenInstance(e.target.value);
                setValidationError(null);
              }}
              required
            />

            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowAdvanced((prev) => !prev)}
                className="text-xs text-zinc-400 hover:text-zinc-200 underline"
              >
                {showAdvanced ? 'Скрыть дополнительные настройки' : 'Дополнительно: apiUrl'}
              </button>

              {showAdvanced && (
                <div className="mt-2 pt-2 border-t border-zinc-800">
                  <Input
                    label="Базовый API URL"
                    placeholder={DEFAULT_API_URL}
                    value={apiUrl}
                    onChange={(e) => setApiUrl(e.target.value)}
                    helperText="По умолчанию https://api.green-api.com"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end gap-2.5">
            {canClose && isConfigured && (
              <Button type="button" variant="ghost" onClick={handleClose}>
                Отмена
              </Button>
            )}
            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              className="w-full sm:w-auto"
            >
              {isConfigured ? 'Сохранить и проверить' : 'Подключиться к MAX'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
