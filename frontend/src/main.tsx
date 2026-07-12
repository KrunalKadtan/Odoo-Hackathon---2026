import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { router } from './router.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
    <Toaster 
      position="top-right" 
      toastOptions={{
        className: 'bg-zinc-900 text-zinc-100 border border-zinc-800',
        style: {
          background: '#18181b',
          color: '#f4f4f5',
          border: '1px solid #27272a',
        },
      }}
    />
  </StrictMode>,
);
