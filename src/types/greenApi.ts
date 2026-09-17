export interface GreenApiCredentials {
  idInstance: string;
  apiTokenInstance: string;
  apiUrl?: string;
}

export type InstanceState =
  | 'authorized'
  | 'notAuthorized'
  | 'blocked'
  | 'sleepMode'
  | 'starting'
  | 'yellow'
  | 'unknown';

export interface StateInstanceResponse {
  stateInstance: InstanceState;
}

export interface SendMessagePayload {
  chatId: string;
  message: string;
  quotedMessageId?: string;
}

export interface SendMessageResponse {
  idMessage: string;
}

export interface IncomingSenderData {
  chatId: string;
  sender: string;
  senderName?: string;
  senderContactName?: string;
}

export interface IncomingMessageData {
  typeMessage: string;
  textMessageData?: {
    textMessage: string;
  };
  extendedTextMessageData?: {
    text: string;
    description?: string;
    title?: string;
  };
}

export interface NotificationBody {
  typeWebhook: string;
  timestamp: number;
  idMessage: string;
  senderData?: IncomingSenderData;
  messageData?: IncomingMessageData;
  status?: string;
}

export interface ReceiveNotificationResponse {
  receiptId: number;
  body: NotificationBody;
}

export interface DeleteNotificationResponse {
  result: boolean;
}
