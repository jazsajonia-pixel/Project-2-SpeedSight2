import type { ReactNode } from 'react';

export function EmptyState({ title = 'No records found', description = 'Try adjusting your filters.', action }: {
  title?: string; description?: string; action?: ReactNode;
}) {
  return <div className="py-10 px-4 text-center" role="status">
    <p className="font-semibold text-slate-900">{title}</p>
    <p className="mt-1 text-sm text-slate-500">{description}</p>
    {action && <div className="mt-4">{action}</div>}
  </div>;
}
