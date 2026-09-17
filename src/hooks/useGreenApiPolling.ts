import { useEffect, useRef, useState, useCallback } from 'react';
import { GreenApiCredentials, ReceiveNotificationResponse } from '../types/greenApi';
import { receiveNotification, deleteNotification } from '../services/greenApi';

interface UseGreenApiPollingOptions {
  credentials: GreenApiCredentials | null;
  enabled: boolean;
  onIncomingNotification: (notification: ReceiveNotificationResponse) => void | Promise<void>;
  onError?: (error: Error) => void;
}

export function useGreenApiPolling({
  credentials,
  enabled,
  onIncomingNotification,
  onError,
}: UseGreenApiPollingOptions) {
  const [isPolling, setIsPolling] = useState(false);
  const [pollingError, setPollingError] = useState<string | null>(null);
  const isPollingRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Keep latest callbacks in refs to avoid restarting polling loop when handlers re-render
  const onIncomingNotificationRef = useRef(onIncomingNotification);
  onIncomingNotificationRef.current = onIncomingNotification;

  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  const credentialsRef = useRef(credentials);
  credentialsRef.current = credentials;

  const stopPolling = useCallback(() => {
    isPollingRef.current = false;
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsPolling(false);
  }, []);

  const startPolling = useCallback(async () => {
    if (isPollingRef.current) return;
    if (!credentialsRef.current?.idInstance || !credentialsRef.current?.apiTokenInstance) {
      return;
    }

    isPollingRef.current = true;
    setIsPolling(true);
    setPollingError(null);

    let consecutiveErrors = 0;

    while (isPollingRef.current) {
      const creds = credentialsRef.current;
      if (!creds?.idInstance || !creds?.apiTokenInstance) {
        break;
      }

      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;

      try {
        // Receive notification from GREEN-API queue (HTTP API technology)
        const notification = await receiveNotification(creds, 5, signal);
        consecutiveErrors = 0;
        setPollingError(null);

        if (notification && notification.receiptId) {
          try {
            // Process notification
            await onIncomingNotificationRef.current(notification);
          } catch (processingErr) {
            console.error('Error processing notification:', processingErr);
          } finally {
            // Crucial HTTP API step: delete notification from queue after handling
            try {
              await deleteNotification(creds, notification.receiptId);
            } catch (deleteErr) {
              console.error('Error deleting notification receipt:', deleteErr);
            }
          }
        }
      } catch (err: unknown) {
        if (signal.aborted || !isPollingRef.current) {
          break;
        }

        consecutiveErrors++;
        const errorMessage = err instanceof Error ? err.message : 'Сбой опроса очереди уведомлений';
        setPollingError(errorMessage);

        if (onErrorRef.current && err instanceof Error) {
          onErrorRef.current(err);
        }

        // Exponential backoff with jitter: 2s, 4s, up to 10s
        const backoffDelay = Math.min(1000 * Math.pow(2, Math.min(consecutiveErrors, 4)), 10000);
        await new Promise((resolve) => setTimeout(resolve, backoffDelay));
      } finally {
        abortControllerRef.current = null;
      }
    }

    setIsPolling(false);
  }, []);

  useEffect(() => {
    if (enabled && credentials?.idInstance && credentials?.apiTokenInstance) {
      startPolling();
    } else {
      stopPolling();
    }

    return () => {
      stopPolling();
    };
  }, [enabled, credentials?.idInstance, credentials?.apiTokenInstance, startPolling, stopPolling]);

  return {
    isPolling,
    pollingError,
    restartPolling: startPolling,
    stopPolling,
  };
}
