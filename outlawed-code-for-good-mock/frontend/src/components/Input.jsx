import React from 'react';

/**
 * Reusable Input Component
 * @param {Object} props
 * @param {string} props.label
 * @param {string} [props.error]
 * @param {string} [props.helperText]
 * @param {string} [props.id]
 */
export default function Input({
  label,
  error,
  helperText,
  id,
  type = 'text',
  className = '',
  ...props
}) {
  const inputId = id || `input-${label?.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={inputId}
          type={type}
          className={`block w-full rounded-md shadow-sm text-sm transition-colors
            focus:ring-primary-500 focus:border-primary-500
            ${error 
              ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' 
              : 'border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-primary-500 focus:border-primary-500'
            }
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600" id={`${inputId}-error`}>
          {error}
        </p>
      )}
      {!error && helperText && (
        <p className="mt-1 text-xs text-gray-500" id={`${inputId}-description`}>
          {helperText}
        </p>
      )}
    </div>
  );
}
