import { jest } from '@jest/globals';
import {
  getNormalizedApiUrl,
  getStateInstance,
  sendMessage,
  receiveNotification,
  deleteNotification,
  DEFAULT_API_URL,
  GreenApiError,
} from '../src/services/greenApi';

describe('GreenApi Service Client', () => {
  const credentials = {
    idInstance: '1101820',
    apiTokenInstance: 'test_token_12345',
    apiUrl: 'https://api.green-api.com',
  };

  beforeEach(() => {
    jest.resetAllMocks();
    global.fetch = jest.fn();
  });

  describe('getNormalizedApiUrl', () => {
    it('should return default URL when empty', () => {
      expect(getNormalizedApiUrl('')).toBe(DEFAULT_API_URL);
      expect(getNormalizedApiUrl(undefined)).toBe(DEFAULT_API_URL);
    });

    it('should strip trailing slashes', () => {
      expect(getNormalizedApiUrl('https://custom.api.com///')).toBe('https://custom.api.com');
    });
  });

  describe('getStateInstance', () => {
    it('should query stateInstance endpoint and return state', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ stateInstance: 'authorized' }),
      });

      const res = await getStateInstance(credentials);
      expect(res.stateInstance).toBe('authorized');
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.green-api.com/waInstance1101820/getStateInstance/test_token_12345',
        expect.objectContaining({ method: 'GET' })
      );
    });

    it('should throw GreenApiError on 401 or 400', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: async () => ({ message: 'Invalid credentials' }),
      });

      await expect(getStateInstance(credentials)).rejects.toThrow(GreenApiError);
    });
  });

  describe('sendMessage', () => {
    it('should send POST request with chatId and message', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ idMessage: 'msg_123456' }),
      });

      const res = await sendMessage(credentials, {
        chatId: '79991234567@c.us',
        message: 'Тестовое сообщение',
      });

      expect(res.idMessage).toBe('msg_123456');
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.green-api.com/waInstance1101820/sendMessage/test_token_12345',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            chatId: '79991234567@c.us',
            message: 'Тестовое сообщение',
          }),
        })
      );
    });
  });

  describe('receiveNotification', () => {
    it('should retrieve notification from queue via GET', async () => {
      const mockPayload = {
        receiptId: 998877,
        body: {
          typeWebhook: 'incomingMessageReceived',
          timestamp: 1680000000,
          idMessage: 'in_msg_999',
          senderData: {
            chatId: '79991234567@c.us',
            sender: '79991234567@c.us',
            senderName: 'Тест',
          },
          messageData: {
            typeMessage: 'textMessage',
            textMessageData: {
              textMessage: 'Привет из MAX!',
            },
          },
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        text: async () => JSON.stringify(mockPayload),
      });

      const res = await receiveNotification(credentials, 5);
      expect(res?.receiptId).toBe(998877);
      expect(res?.body.idMessage).toBe('in_msg_999');
    });

    it('should return null when queue is empty', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        text: async () => 'null',
      });

      const res = await receiveNotification(credentials, 5);
      expect(res).toBeNull();
    });
  });

  describe('deleteNotification', () => {
    it('should send DELETE request with receiptId', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ result: true }),
      });

      const res = await deleteNotification(credentials, 998877);
      expect(res.result).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.green-api.com/waInstance1101820/deleteNotification/test_token_12345/998877',
        expect.objectContaining({ method: 'DELETE' })
      );
    });
  });
});
