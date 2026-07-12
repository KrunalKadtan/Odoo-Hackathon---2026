import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', id, ...props }, ref) => {
    const inputId = id || Math.random().toString(36).substring(7);

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-zinc-300 mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <input
            id={inputId}
            ref={ref}
            className={`
              block w-full rounded-md bg-zinc-900 border 
              px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500
              focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500
              transition-colors duration-200
              [color-scheme:dark]
              ${
                error
                  ? 'border-red-500/50 focus:ring-red-500/50 focus:border-red-500'
                  : 'border-zinc-800'
              }
              ${className}
            `}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1.5 text-xs text-red-400 animate-in fade-in slide-in-from-top-1">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
