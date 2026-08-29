import React from 'react';
import { Inbox } from 'lucide-react';

/**
 * Reusable Empty State Component
 * @param {Object} props
 * @param {string} [props.title='No data available']
 * @param {string} [props.message='There are no records to display at this time.']
 */
export default function EmptyState({
  title = 'No data available',
  message = 'There are no records to display at this time.',
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center px-4 py-12 bg-white">
      <div className="p-3 bg-gray-50 rounded-full border border-gray-100 mb-4">
        <Inbox className="h-8 w-8 text-gray-400" aria-hidden="true" />
      </div>
      <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      <p className="mt-1 text-xs text-gray-500 max-w-sm">{message}</p>
    </div>
  );
}
