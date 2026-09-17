import {
  formatTime,
  formatDateGroup,
  truncateText,
  getAvatarColor,
  getInitials,
} from '../src/utils/formatters';

describe('Formatters Utilities', () => {
  describe('formatTime', () => {
    it('should format timestamp into HH:MM', () => {
      const date = new Date(2026, 8, 17, 14, 30, 0);
      const formatted = formatTime(date.getTime());
      expect(formatted).toBe('14:30');
    });

    it('should return empty string for falsy timestamp', () => {
      expect(formatTime(0)).toBe('');
    });
  });

  describe('formatDateGroup', () => {
    it('should return "Сегодня" for today', () => {
      const now = Date.now();
      expect(formatDateGroup(now)).toBe('Сегодня');
    });

    it('should return "Вчера" for yesterday', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(formatDateGroup(yesterday.getTime())).toBe('Вчера');
    });
  });

  describe('truncateText', () => {
    it('should truncate long strings and add ellipsis', () => {
      const longStr = 'This is a very long message that should be truncated';
      expect(truncateText(longStr, 20)).toBe('This is a very long…');
    });

    it('should not truncate strings shorter than maxLength', () => {
      expect(truncateText('Short text', 20)).toBe('Short text');
    });
  });

  describe('getInitials', () => {
    it('should return 2 letters for valid names', () => {
      expect(getInitials('Иван Иванов')).toBe('ИВ');
      expect(getInitials('John Doe')).toBe('JO');
      expect(getInitials('79991234567')).toBe('79');
    });

    it('should return ? for empty strings', () => {
      expect(getInitials('')).toBe('?');
    });
  });

  describe('getAvatarColor', () => {
    it('should return deterministic color for same input', () => {
      const c1 = getAvatarColor('79991234567@c.us');
      const c2 = getAvatarColor('79991234567@c.us');
      expect(c1).toBe(c2);
    });
  });
});
