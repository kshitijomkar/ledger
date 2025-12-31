'use client';

import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { Toaster } from 'sonner';
import { AppProvider } from '@/contexts/AppContext';
import { OfflineProvider } from '@/contexts/OfflineContext';

export function Providers({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Register service worker for PWA support
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => {
        console.log('Service Worker registration available when deployed');
      });
    }
  }, []);

  return (
    <OfflineProvider>
      <AppProvider>
        {children}
        <Toaster position="bottom-right" richColors />
      </AppProvider>
    </OfflineProvider>
  );
}
