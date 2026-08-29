import React from 'react';

/**
 * Reusable Select Dropdown Component
 * @param {Object} props
 * @param {string} props.label
 * @param {Array<{value: string|number, label: string}>|Array<string>} props.options
 * @param {string} [props.error]
 * @param {string} [props.placeholder]
 * @param {string} [props.id]
 */
export default function Select({
  label,
  options = [],
  error,
  placeholder,
  id,
  className = '',
  ...props
}) {
  const selectId = id || `select-${label?.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`block w-full rounded-md shadow-sm text-sm transition-colors
          focus:ring-primary-500 focus:border-primary-500
          ${error 
            ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500' 
            : 'border-gray-300 text-gray-900 focus:ring-primary-500 focus:border-primary-500'
          }
        `}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt, idx) => {
          const val = typeof opt === 'object' ? opt.value : opt;
          const lbl = typeof opt === 'object' ? opt.label : opt;
          return (
            <option key={idx} value={val}>
              {lbl}
            </option>
          );
        })}
      </select>
      {error && (
        <p className="mt-1 text-sm text-red-600" id={`${selectId}-error`}>
          {error}
        </p>
      )}
    </div>
  );
}
