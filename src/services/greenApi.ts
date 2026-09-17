import {
  GreenApiCredentials,
  SendMessagePayload,
  SendMessageResponse,
  ReceiveNotificationResponse,
  DeleteNotificationResponse,
  StateInstanceResponse,
} from '../types/greenApi';

export const DEFAULT_API_URL = 'https://api.green-api.com';

export class GreenApiError extends Error {
  public statusCode?: number;
  public details?: unknown;

  constructor(message: string, statusCode?: number, details?: unknown) {
    super(message);
    this.name = 'GreenApiError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

/**
 * Normalizes the base API URL (removes trailing slash)
 */
export function getNormalizedApiUrl(apiUrl?: string): string {
  if (!apiUrl || !apiUrl.trim()) {
    return DEFAULT_API_URL;
  }
  return apiUrl.trim().replace(/\/+$/, '');
}

/**
 * Checks connection and authorization state of the instance
 */
export async function getStateInstance(
  credentials: GreenApiCredentials
): Promise<StateInstanceResponse> {
  const { idInstance, apiTokenInstance, apiUrl } = credentials;
  if (!idInstance || !apiTokenInstance) {
    throw new GreenApiError('Не указаны idInstance или apiTokenInstance');
  }

  const baseUrl = getNormalizedApiUrl(apiUrl);
  const url = `${baseUrl}/waInstance${idInstance.trim()}/getStateInstance/${apiTokenInstance.trim()}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      let errorText = `Ошибка сервера (${response.status} ${response.statusText})`;
      try {
        const errorJson = await response.json();
        if (errorJson.message) errorText = errorJson.message;
      } catch {
        // use default errorText
      }
      throw new GreenApiError(errorText, response.status);
    }

    const data = (await response.json()) as StateInstanceResponse;
    return data;
  } catch (err: unknown) {
    if (err instanceof GreenApiError) throw err;
    throw new GreenApiError(
      err instanceof Error ? err.message : 'Не удалось подключиться к GREEN-API'
    );
  }
}

/**
 * Sends a text message to the specified recipient (chatId)
 * Method: https://green-api.com/v3/docs/api/sending/SendMessage/
 */
export async function sendMessage(
  credentials: GreenApiCredentials,
  payload: SendMessagePayload
): Promise<SendMessageResponse> {
  const { idInstance, apiTokenInstance, apiUrl } = credentials;
  if (!idInstance || !apiTokenInstance) {
    throw new GreenApiError('Не заданы учетные данные GREEN-API');
  }
  if (!payload.chatId || !payload.message) {
    throw new GreenApiError('chatId и текст сообщения обязательны');
  }

  const baseUrl = getNormalizedApiUrl(apiUrl);
  const url = `${baseUrl}/waInstance${idInstance.trim()}/sendMessage/${apiTokenInstance.trim()}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        chatId: payload.chatId,
        message: payload.message,
        quotedMessageId: payload.quotedMessageId,
      }),
    });

    if (!response.ok) {
      let errorMsg = `Ошибка отправки сообщения (${response.status})`;
      try {
        const errData = await response.json();
        if (errData.message) errorMsg = errData.message;
      } catch {
        // use fallback errorMsg
      }
      throw new GreenApiError(errorMsg, response.status);
    }

    const data = (await response.json()) as SendMessageResponse;
    return data;
  } catch (err: unknown) {
    if (err instanceof GreenApiError) throw err;
    throw new GreenApiError(
      err instanceof Error ? err.message : 'Неизвестная ошибка при отправке'
    );
  }
}

/**
 * Receives an incoming notification from the HTTP API queue
 * Method: https://green-api.com/v3/docs/api/receiving/technology-http-api/
 */
export async function receiveNotification(
  credentials: GreenApiCredentials,
  receiveTimeoutSec = 5,
  signal?: AbortSignal
): Promise<ReceiveNotificationResponse | null> {
  const { idInstance, apiTokenInstance, apiUrl } = credentials;
  if (!idInstance || !apiTokenInstance) {
    throw new GreenApiError('Не заданы учетные данные GREEN-API');
  }

  const baseUrl = getNormalizedApiUrl(apiUrl);
  const timeoutParam = Math.max(1, Math.min(receiveTimeoutSec, 60));
  const url = `${baseUrl}/waInstance${idInstance.trim()}/receiveNotification/${apiTokenInstance.trim()}?receiveTimeout=${timeoutParam}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal,
    });

    if (!response.ok) {
      let errorMsg = `Ошибка получения уведомлений (${response.status})`;
      try {
        const errData = await response.json();
        if (errData.message) errorMsg = errData.message;
      } catch {
        // fallback
      }
      throw new GreenApiError(errorMsg, response.status);
    }

    // If queue is empty, server returns null or empty response
    const text = await response.text();
    if (!text || text.trim() === 'null' || text.trim() === '') {
      return null;
    }

    const data = JSON.parse(text) as ReceiveNotificationResponse;
    return data;
  } catch (err: unknown) {
    if (signal?.aborted) {
      return null;
    }
    if (err instanceof GreenApiError) throw err;
    throw new GreenApiError(
      err instanceof Error ? err.message : 'Сбой получения входящего уведомления'
    );
  }
}

/**
 * Deletes a processed notification from the HTTP API queue
 * Method: https://green-api.com/v3/docs/api/receiving/technology-http-api/
 */
export async function deleteNotification(
  credentials: GreenApiCredentials,
  receiptId: number
): Promise<DeleteNotificationResponse> {
  const { idInstance, apiTokenInstance, apiUrl } = credentials;
  if (!idInstance || !apiTokenInstance) {
    throw new GreenApiError('Не заданы учетные данные GREEN-API');
  }
  if (!receiptId) {
    throw new GreenApiError('Не указан receiptId для удаления уведомления');
  }

  const baseUrl = getNormalizedApiUrl(apiUrl);
  const url = `${baseUrl}/waInstance${idInstance.trim()}/deleteNotification/${apiTokenInstance.trim()}/${receiptId}`;

  try {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      let errorMsg = `Ошибка удаления уведомления (${response.status})`;
      try {
        const errData = await response.json();
        if (errData.message) errorMsg = errData.message;
      } catch {
        // fallback
      }
      throw new GreenApiError(errorMsg, response.status);
    }

    const data = (await response.json()) as DeleteNotificationResponse;
    return data;
  } catch (err: unknown) {
    if (err instanceof GreenApiError) throw err;
    throw new GreenApiError(
      err instanceof Error ? err.message : 'Сбой удаления уведомления'
    );
  }
}
