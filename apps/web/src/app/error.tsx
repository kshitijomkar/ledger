'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service here
    console.error('Application Error:', error);
    // TODO: Send to error logging service (Sentry, LogRocket, etc)
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
          <AlertCircle className="w-6 h-6 text-red-600" />
        </div>
        
        <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">
          Something went wrong!
        </h1>
        
        <p className="text-center text-gray-600 mb-6">
          We encountered an unexpected error. Please try again.
        </p>

        {process.env.NODE_ENV === 'development' && (
          <div className="bg-red-50 border border-red-200 rounded p-4 mb-6">
            <p className="text-sm font-mono text-red-800 break-words">
              {error.message}
            </p>
          </div>
        )}

        <div className="flex gap-3">
          <Button
            onClick={() => reset()}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
            aria-label="Try again"
          >
            Try again
          </Button>
          <Button
            onClick={() => window.location.href = '/'}
            variant="outline"
            className="flex-1"
            aria-label="Go to home page"
          >
            Home
          </Button>
        </div>

        {error.digest && (
          <p className="text-xs text-gray-400 text-center mt-4">
            Error ID: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
