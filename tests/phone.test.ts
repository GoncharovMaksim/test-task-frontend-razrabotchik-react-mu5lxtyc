import {
  cleanPhoneNumber,
  formatChatId,
  extractPhoneFromChatId,
  isValidPhoneNumber,
  formatPhoneNumberDisplay,
} from '../src/utils/phone';

describe('Phone Utilities', () => {
  describe('cleanPhoneNumber', () => {
    it('should strip spaces, dashes, and parentheses', () => {
      expect(cleanPhoneNumber('+7 (999) 123-45-67')).toBe('79991234567');
      expect(cleanPhoneNumber('+7-999-123-45-67')).toBe('79991234567');
      expect(cleanPhoneNumber(' 7 999 123 45 67 ')).toBe('79991234567');
    });

    it('should normalize Russian 8-prefix numbers to 7', () => {
      expect(cleanPhoneNumber('89991234567')).toBe('79991234567');
      expect(cleanPhoneNumber('8 (999) 123-45-67')).toBe('79991234567');
    });

    it('should preserve international numbers', () => {
      expect(cleanPhoneNumber('+1 (555) 234-5678')).toBe('15552345678');
      expect(cleanPhoneNumber('+380 (50) 123-45-67')).toBe('380501234567');
    });
  });

  describe('formatChatId', () => {
    it('should append @c.us if missing', () => {
      expect(formatChatId('79991234567')).toBe('79991234567@c.us');
      expect(formatChatId('+7 (999) 123-45-67')).toBe('79991234567@c.us');
    });

    it('should leave existing @c.us or @g.us untouched', () => {
      expect(formatChatId('79991234567@c.us')).toBe('79991234567@c.us');
      expect(formatChatId('123456789-group@g.us')).toBe('123456789-group@g.us');
    });
  });

  describe('extractPhoneFromChatId', () => {
    it('should extract digits before @', () => {
      expect(extractPhoneFromChatId('79991234567@c.us')).toBe('79991234567');
      expect(extractPhoneFromChatId('15552345678@c.us')).toBe('15552345678');
    });
  });

  describe('isValidPhoneNumber', () => {
    it('should validate valid phone lengths (10-15 digits)', () => {
      expect(isValidPhoneNumber('79991234567')).toBe(true);
      expect(isValidPhoneNumber('+7 (999) 123-45-67')).toBe(true);
      expect(isValidPhoneNumber('15552345678')).toBe(true);
      expect(isValidPhoneNumber('1234567890')).toBe(true);
    });

    it('should reject invalid or short strings', () => {
      expect(isValidPhoneNumber('')).toBe(false);
      expect(isValidPhoneNumber('123')).toBe(false);
      expect(isValidPhoneNumber('abcdef')).toBe(false);
      expect(isValidPhoneNumber('1234567890123456789')).toBe(false);
    });
  });

  describe('formatPhoneNumberDisplay', () => {
    it('should format 11-digit Russian numbers with nice spacing', () => {
      expect(formatPhoneNumberDisplay('79991234567')).toBe('+7 (999) 123-45-67');
      expect(formatPhoneNumberDisplay('79991234567@c.us')).toBe('+7 (999) 123-45-67');
    });

    it('should format 10-digit numbers', () => {
      expect(formatPhoneNumberDisplay('9991234567')).toBe('(999) 123-4567');
    });
  });
});
