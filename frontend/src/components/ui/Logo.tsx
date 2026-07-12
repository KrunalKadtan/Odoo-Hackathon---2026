import React from 'react';
import { PackageOpen } from 'lucide-react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10',
  };

  const textClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`${sizeClasses[size]} bg-indigo-500 rounded-lg flex items-center justify-center text-white shadow-sm shadow-indigo-500/20`}>
        <PackageOpen size={size === 'sm' ? 14 : size === 'md' ? 18 : 24} />
      </div>
      <span className={`font-semibold tracking-tight text-zinc-100 ${textClasses[size]}`}>
        Asset<span className="text-indigo-400">Flow</span>
      </span>
    </div>
  );
};
