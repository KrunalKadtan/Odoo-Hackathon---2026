import { useEffect } from 'react';
import { X } from 'lucide-react';

interface SlideOverProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
}

export const SlideOver = ({ isOpen, onClose, title, description, children }: SlideOverProps) => {
  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
        <div className="w-screen max-w-md transform transition-transform ease-in-out duration-300">
          <div className="flex h-full flex-col divide-y divide-zinc-800 bg-zinc-900 shadow-xl border-l border-zinc-800">
            <div className="px-4 py-6 sm:px-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">{title}</h2>
                <div className="ml-3 flex h-7 items-center">
                  <button
                    type="button"
                    className="rounded-md bg-zinc-900 text-zinc-400 hover:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close panel</span>
                    <X className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
              </div>
              {description && (
                <div className="mt-1">
                  <p className="text-sm text-zinc-400">{description}</p>
                </div>
              )}
            </div>
            
            <div className="relative flex-1 px-4 py-6 sm:px-6 overflow-y-auto">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
