import React from 'react';

/**
 * Reusable Card Component
 * @param {Object} props
 * @param {string} [props.title]
 * @param {string} [props.subtitle]
 * @param {React.ReactNode} [props.footer]
 * @param {React.ReactNode} props.children
 * @param {string} [props.className]
 */
export default function Card({
  title,
  subtitle,
  children,
  footer,
  className = '',
  ...props
}) {
  return (
    <div className={`bg-white rounded-xl border border-sand-200/90 shadow-corporate overflow-hidden transition-all hover:border-taupe-300 ${className}`} {...props}>
      {(title || subtitle) && (
        <div className="px-6 py-4 border-b border-sand-200/80 bg-sand-50/40">
          {title && <h3 className="text-sm font-bold text-charcoal-900 tracking-tight">{title}</h3>}
          {subtitle && <p className="mt-0.5 text-xs text-charcoal-500">{subtitle}</p>}
        </div>
      )}
      
      <div className="px-6 py-5">
        {children}
      </div>

      {footer && (
        <div className="px-6 py-3.5 border-t border-sand-200/80 bg-sand-50/60 flex justify-end gap-3">
          {footer}
        </div>
      )}
    </div>
  );
}
