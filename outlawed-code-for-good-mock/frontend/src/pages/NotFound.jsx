import React from 'react';
import { HelpCircle, ArrowLeft } from 'lucide-react';
import Button from '../components/Button';

/**
 * Reusable 404 Page View
 * @param {Object} props
 * @param {function} props.onGoHome - Callback to redirect back to Dashboard
 */
export default function NotFound({ onGoHome }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md text-center space-y-6 bg-white p-8 rounded-lg border border-gray-200 shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 border border-amber-200 text-amber-500 shadow-sm">
          <HelpCircle className="h-8 w-8" />
        </div>
        
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">404</h1>
          <p className="mt-2 text-lg font-bold text-gray-700">Page Not Found</p>
          <p className="mt-1.5 text-sm text-gray-500 max-w-xs mx-auto">
            The page view you are looking for does not exist or has been relocated.
          </p>
        </div>

        <div className="pt-2">
          <Button
            onClick={onGoHome}
            className="flex items-center justify-center gap-2 mx-auto"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
