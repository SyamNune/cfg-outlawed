import React from 'react';

/**
 * Reusable Button Component with high-contrast visible text and robust styling
 * @param {Object} props
 * @param {'primary'|'secondary'|'danger'|'outline'|'taupe'|'dark'|'ghost'} [props.variant='primary']
 * @param {boolean} [props.isLoading=false]
 * @param {boolean} [props.disabled=false]
 * @param {React.ReactNode} props.children
 */
export default function Button({
  children,
  variant = 'primary',
  isLoading = false,
  disabled = false,
  type = 'button',
  className = '',
  ...props
}) {
  const baseStyle = 'inline-flex items-center justify-center font-bold rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed px-3.5 py-2 tracking-tight cursor-pointer';
  
  const variants = {
    primary: 'bg-charcoal-900 hover:bg-charcoal-800 !text-white border border-charcoal-950 shadow-corporate focus:ring-charcoal-600',
    secondary: 'bg-sand-100 hover:bg-sand-200 !text-black border border-sand-400 shadow-corporate focus:ring-taupe-500 font-bold',
    taupe: 'bg-taupe-700 hover:bg-taupe-800 !text-white border border-taupe-800 shadow-corporate focus:ring-taupe-500',
    danger: 'bg-red-700 hover:bg-red-800 !text-white border border-red-900 shadow-corporate focus:ring-red-500',
    outline: 'border border-sand-400 !text-black bg-white hover:bg-sand-100 shadow-corporate focus:ring-charcoal-500 font-bold',
    dark: 'bg-charcoal-950 !text-white border border-charcoal-700 hover:bg-charcoal-800 focus:ring-taupe-500',
    ghost: 'bg-transparent !text-black hover:bg-sand-200/60 font-bold',
  };

  const variantStyle = variants[variant] || variants.primary;

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={`${baseStyle} ${variantStyle} ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Loading...
        </>
      ) : (
        children
      )}
    </button>
  );
}
