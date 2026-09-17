import React from 'react';

interface BadgeProps {
  status: 'connected' | 'polling' | 'error' | 'disconnected';
  label?: string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ status, label, size = 'sm' }) => {
  const configs = {
    connected: {
      dot: 'bg-emerald-500',
      text: 'text-emerald-400',
      bg: 'bg-emerald-950/40 border-emerald-800/50',
      defaultLabel: 'Онлайн',
    },
    polling: {
      dot: 'bg-teal-400 animate-pulse',
      text: 'text-teal-400',
      bg: 'bg-teal-950/40 border-teal-800/50',
      defaultLabel: 'HTTP API опрос',
    },
    error: {
      dot: 'bg-rose-500',
      text: 'text-rose-400',
      bg: 'bg-rose-950/40 border-rose-800/50',
      defaultLabel: 'Ошибка',
    },
    disconnected: {
      dot: 'bg-zinc-500',
      text: 'text-zinc-400',
      bg: 'bg-zinc-800/60 border-zinc-700/50',
      defaultLabel: 'Отключено',
    },
  };

  const config = configs[status];
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${config.bg} ${config.text} ${sizeClasses} font-medium`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      <span>{label || config.defaultLabel}</span>
    </span>
  );
};
