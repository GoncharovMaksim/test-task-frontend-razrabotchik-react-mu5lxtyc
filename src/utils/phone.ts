/**
 * Cleans phone number removing formatting symbols and spaces
 */
export function cleanPhoneNumber(phone: string): string {
  if (!phone) return '';
  // Remove all non-digit characters
  let digits = phone.replace(/\D/g, '');

  // Normalize Russian numbers starting with 8 (11 digits) to 7
  if (digits.length === 11 && digits.startsWith('8')) {
    digits = '7' + digits.slice(1);
  }

  return digits;
}

/**
 * Formats a phone number or raw ID into a GREEN-API chatId (e.g. 79991234567@c.us)
 */
export function formatChatId(input: string): string {
  if (!input) return '';
  const trimmed = input.trim();

  if (trimmed.includes('@c.us') || trimmed.includes('@g.us')) {
    return trimmed;
  }

  const cleaned = cleanPhoneNumber(trimmed);
  return `${cleaned}@c.us`;
}

/**
 * Extracts raw phone number from a chatId (e.g. 79991234567@c.us -> 79991234567)
 */
export function extractPhoneFromChatId(chatId: string): string {
  if (!chatId) return '';
  return chatId.split('@')[0];
}

/**
 * Validates whether the input is a valid phone number (10 to 15 digits)
 */
export function isValidPhoneNumber(input: string): boolean {
  if (!input) return false;
  const digits = cleanPhoneNumber(input);
  return digits.length >= 10 && digits.length <= 15;
}

/**
 * Formats phone number into a readable human format
 * e.g. 79991234567 -> +7 (999) 123-45-67
 */
export function formatPhoneNumberDisplay(phoneOrChatId: string): string {
  if (!phoneOrChatId) return '';
  const digits = cleanPhoneNumber(extractPhoneFromChatId(phoneOrChatId));

  if (!digits) return phoneOrChatId;

  // Russian / Kazakh numbers (11 digits, starts with 7)
  if (digits.length === 11 && digits.startsWith('7')) {
    const p1 = digits.slice(1, 4);
    const p2 = digits.slice(4, 7);
    const p3 = digits.slice(7, 9);
    const p4 = digits.slice(9, 11);
    return `+7 (${p1}) ${p2}-${p3}-${p4}`;
  }

  // 10-digit standard numbers
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  // General international format: +XXX XXXXX...
  return `+${digits}`;
}
