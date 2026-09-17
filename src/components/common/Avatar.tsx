import React from 'react';
import { getInitials } from '../../utils/formatters';

interface AvatarProps {
  name: string;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  isOnline?: boolean;
}

export const Avatar: React.FC<AvatarProps> = ({
  name,
  color = 'bg-emerald-600',
  size = 'md',
  isOnline,
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-11 h-11 text-sm font-medium',
    lg: 'w-14 h-14 text-base font-semibold',
  };

  const initials = getInitials(name);

  return (
    <div className="relative inline-flex flex-shrink-0">
      <div
        className={`${sizeClasses[size]} ${color} text-white rounded-full flex items-center justify-center select-none shadow-sm`}
      >
        {initials}
      </div>
      {isOnline && (
        <span className="absolute bottom-0 right-0 block w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-zinc-900" />
      )}
    </div>
  );
};
