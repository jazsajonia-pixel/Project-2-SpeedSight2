import React from 'react';

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (row: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  emptyMessage?: string;
}

/**
 * Renders rows using custom cell renderers or column accessor keys.
 *
 * @param props - Columns, row data, a stable row key extractor, and optional empty message.
 * @returns A table, or the empty message when there are no rows.
 */
export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  emptyMessage = 'No records found',
}: DataTableProps<T>) {
  if (data.length === 0) {
    return <div className="text-center py-8 text-xs text-slate-500">{emptyMessage}</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm text-slate-700">
        <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-200">
          <tr>
            {columns.map((col, i) => (
              <th key={i} className={`py-3 px-4 font-semibold ${col.className || ''}`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.map((row) => (
            <tr key={keyExtractor(row)} className="hover:bg-slate-50/80 transition">
              {columns.map((col, i) => (
                <td key={i} className={`py-3 px-4 ${col.className || ''}`}>
                  {col.cell ? col.cell(row) : col.accessorKey ? (row[col.accessorKey] as any) : null}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
