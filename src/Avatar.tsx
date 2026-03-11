import React from 'react';
import { User } from '../types';

interface AvatarProps {
  user?: Partial<User>;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ user, size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-20 h-20',
    xl: 'w-32 h-32',
  };

  const iconSizes = {
    sm: 16,
    md: 24,
    lg: 40,
    xl: 64,
  };

  const moodIcons: Record<string, string> = {
    peaceful: '🐑',
    thoughtful: '🦊',
    dreamy: '🦄',
    optimistic: '🐥',
    melancholy: '🐨',
    determined: '🐯',
    warm: '🐼',
    confused: '🐸',
    courageous: '🦁',
    zen: '🐢',
    lonely: '🐰',
    creative: '🦋',
    relaxed: '🦥',
    pensive: '🦉',
    kind: '🐶',
  };

  const emoji = moodIcons[user?.avatar_mood || 'zen'] || '✨';

  return (
    <div 
      className={`relative rounded-[2rem] flex items-center justify-center overflow-hidden border-2 border-white/10 shadow-inner ${sizes[size]} ${className}`}
      style={{ 
        backgroundColor: user?.avatar_outfit || '#242645',
      }}
    >
      <div 
        className="absolute inset-0 opacity-30 bg-gradient-to-br from-white/20 to-transparent"
      />
      
      <div 
        className="absolute inset-2 rounded-[1.5rem] opacity-20"
        style={{ backgroundColor: user?.avatar_skin || '#FFDBAC' }}
      />
      
      <div className="relative z-10 flex items-center justify-center select-none">
        <span style={{ fontSize: `${iconSizes[size] * 1.2}px` }} className="drop-shadow-md">
          {emoji}
        </span>
      </div>

      {/* Subtle glow effect */}
      <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-white/5 blur-xl rounded-full" />
    </div>
  );
};
