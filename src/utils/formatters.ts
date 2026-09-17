/**
 * Formats timestamp into HH:MM (e.g. 14:05)
 */
export function formatTime(timestamp: number): string {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Formats timestamp into human-readable date (Сегодня, Вчера, DD.MM.YYYY)
 */
export function formatDateGroup(timestamp: number): string {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  const now = new Date();

  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (isToday) return 'Сегодня';

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  if (isYesterday) return 'Вчера';

  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * Truncates text with ellipsis if it exceeds maxLength
 */
export function truncateText(text: string, maxLength = 36): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '…';
}

/**
 * Deterministically generates an avatar background color from a string
 */
const AVATAR_COLORS = [
  'bg-emerald-600',
  'bg-teal-600',
  'bg-blue-600',
  'bg-indigo-600',
  'bg-sky-600',
  'bg-cyan-600',
  'bg-amber-600',
  'bg-emerald-700',
];

export function getAvatarColor(identifier: string): string {
  if (!identifier) return AVATAR_COLORS[0];
  let hash = 0;
  for (let i = 0; i < identifier.length; i++) {
    hash = identifier.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

/**
 * Extracts initials or first 2 letters from a name or phone number
 */
export function getInitials(text: string): string {
  if (!text) return '?';
  const clean = text.replace(/[^a-zA-Zа-яА-Я0-9]/g, '');
  if (!clean) return '?';
  return clean.slice(0, 2).toUpperCase();
}
