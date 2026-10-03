import type { Key, ReactNode } from 'react';
import { EmptyState } from './EmptyState';

export interface TableColumn<T> {
  header: string;
  cell: (row: T) => ReactNode;
  className?: string;
}
export function DataTable<T>({ rows, columns, rowKey, caption, emptyState }: {
  rows: readonly T[]; columns: readonly TableColumn<T>[]; rowKey: (row: T) => Key;
  caption: string; emptyState?: ReactNode;
}) {
  if (!rows.length) return emptyState ?? <EmptyState />;
  return <div className="overflow-x-auto" role="region" aria-label={caption} tabIndex={0}>
    <table className="w-full text-left text-sm text-slate-700">
      <caption className="sr-only">{caption}</caption>
      <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-200">
        <tr>{columns.map((column) => <th key={column.header} scope="col" className={`py-3 px-4 font-semibold ${column.className ?? ''}`}>{column.header}</th>)}</tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {rows.map((row) => <tr key={rowKey(row)} className="hover:bg-slate-50/80 transition">
          {columns.map((column) => <td key={column.header} className={`py-3.5 px-4 ${column.className ?? ''}`}>{column.cell(row)}</td>)}
        </tr>)}
      </tbody>
    </table>
  </div>;
}
