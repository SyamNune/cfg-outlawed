import React from 'react';

/**
 * Reusable Status & Priority Badge Component
 * @param {Object} props
 * @param {string} props.status - Status or Priority string
 * @param {string} [props.label] - Optional display label
 * @param {'status'|'priority'} [props.type='status']
 * @param {string} [props.className]
 */
export default function StatusBadge({ status, label, type = 'status', className = '' }) {
  const normalized = status?.toLowerCase() || 'submitted';

  // Priority Styles
  if (type === 'priority' || ['high', 'medium', 'low', 'critical', 'urgent', 'standard'].includes(normalized)) {
    const priorityMap = {
      critical: 'bg-stone-900 text-sand-50 border-stone-950 font-bold',
      high: 'bg-sand-200 text-charcoal-950 border-sand-400 font-bold',
      urgent: 'bg-taupe-100 text-taupe-900 border-taupe-300 font-semibold',
      medium: 'bg-sand-100 text-charcoal-800 border-sand-300',
      standard: 'bg-slate-100 text-slate-800 border-slate-200',
      low: 'bg-charcoal-50 text-charcoal-600 border-charcoal-200',
    };

    const styleClass = priorityMap[normalized] || 'bg-sand-50 text-charcoal-700 border-sand-200';
    const displayLabel = label || (normalized === 'high' ? 'High Priority' : normalized === 'medium' ? 'Medium Priority' : normalized === 'low' ? 'Low Priority' : normalized.toUpperCase());

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold border ${styleClass} ${className} tracking-tight`}
      >
        {normalized === 'high' || normalized === 'critical' ? (
          <span className="h-1.5 w-1.5 rounded-full bg-charcoal-900 animate-pulse" />
        ) : null}
        {displayLabel}
      </span>
    );
  }

  // Case Status Styles
  const statusMap = {
    submitted: 'bg-sand-100 text-taupe-900 border-sand-300',
    under_review: 'bg-sand-200/70 text-charcoal-800 border-sand-300',
    field_visit_scheduled: 'bg-slate-100 text-slate-800 border-slate-300',
    field_visit_completed: 'bg-taupe-100 text-taupe-900 border-taupe-300',
    assigned_expert: 'bg-charcoal-100 text-charcoal-900 border-charcoal-300 font-semibold',
    hearing_scheduled: 'bg-sand-200 text-taupe-900 border-sand-400',
    resolved: 'bg-sand-200 text-charcoal-950 border-sand-400 font-semibold',
    closed: 'bg-charcoal-50 text-charcoal-500 border-charcoal-200',
    pending_review: 'bg-taupe-50 text-taupe-800 border-taupe-200',
    approved_assigned: 'bg-charcoal-900 text-sand-50 border-charcoal-950',
    active: 'bg-sand-100 text-charcoal-900 border-sand-300 font-semibold',
    inactive: 'bg-charcoal-50 text-charcoal-400 border-charcoal-200',
  };

  const styleClass = statusMap[normalized] || 'bg-gray-50 text-gray-700 border-gray-200';

  const formatLabel = (str) => {
    if (!str) return 'Submitted';
    return str
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const displayLabel = label || formatLabel(normalized);

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styleClass} ${className}`}
    >
      {displayLabel}
    </span>
  );
}
