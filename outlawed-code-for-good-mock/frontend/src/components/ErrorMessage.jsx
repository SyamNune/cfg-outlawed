import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import Button from './Button';

/**
 * Reusable Error Message Component
 * @param {Object} props
 * @param {string} [props.title='Something went wrong']
 * @param {string} [props.message='Please check your connection and try again.']
 * @param {function} [props.onRetry]
 */
export default function ErrorMessage({
  title = 'Something went wrong',
  message = 'Please check your connection and try again.',
  onRetry,
}) {
  return (
    <div className="rounded-md bg-red-50 p-4 border border-red-200">
      <div className="flex">
        <div className="flex-shrink-0">
          <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
        </div>
        <div className="ml-3 flex-1 md:flex md:justify-between items-start">
          <div>
            <h3 className="text-sm font-semibold text-red-800">{title}</h3>
            <p className="mt-1 text-xs text-red-700">{message}</p>
          </div>
          {onRetry && (
            <div className="mt-4 md:mt-0 md:ml-6">
              <Button
                variant="outline"
                onClick={onRetry}
                className="!py-1 !px-2 bg-red-100 hover:bg-red-200 text-red-800 border-red-300 flex items-center gap-1.5"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Retry
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
