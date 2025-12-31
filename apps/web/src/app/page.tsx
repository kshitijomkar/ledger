'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/contexts/AppContext';

export default function Home() {
  const router = useRouter();
  const { token, loading } = useApp();

  useEffect(() => {
    if (!loading) {
      if (token) {
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    }
  }, [token, loading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-primary mb-4">
          Khatabook Pro
        </h1>
        <p className="text-muted-foreground">
          Loading...
        </p>
      </div>
    </div>
  );
}
