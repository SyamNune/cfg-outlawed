import React from 'react';
import Loading from './Loading';
import EmptyState from './EmptyState';

/**
 * Reusable Data Table Component
 * @param {Object} props
 * @param {Array<{key: string, label: string, render?: (val: any, row: any) => React.ReactNode}>} props.columns
 * @param {Array<Object>} props.data
 * @param {boolean} [props.isLoading=false]
 * @param {string} [props.emptyTitle]
 * @param {string} [props.emptyMessage]
 */
export default function Table({
  columns = [],
  data = [],
  isLoading = false,
  emptyTitle,
  emptyMessage,
}) {
  if (isLoading) {
    return (
      <div className="min-w-full bg-white rounded-lg border border-gray-200 p-8 flex justify-center items-center">
        <Loading message="Loading table data..." />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="min-w-full bg-white rounded-lg border border-gray-200 overflow-hidden">
        <EmptyState title={emptyTitle} message={emptyMessage} />
      </div>
    );
  }

  return (
    <div className="flow-root">
      <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-300 bg-white">
              <thead className="bg-gray-50">
                <tr>
                  {columns.map((col, idx) => (
                    <th
                      key={col.key || idx}
                      type="col"
                      className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {data.map((row, rowIdx) => (
                  <tr key={row.id || rowIdx} className="hover:bg-gray-50 transition-colors">
                    {columns.map((col, colIdx) => {
                      const cellValue = row[col.key];
                      return (
                        <td key={col.key || colIdx} className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                          {col.render ? col.render(cellValue, row) : cellValue ?? '-'}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
