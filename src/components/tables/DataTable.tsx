import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Inbox, Plus, ArrowRight } from 'lucide-react';
import { LoadingState } from '@/components/feedback/LoadingState';
import { ApiError } from '@/components/feedback/ApiError';

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
  pageSize?: number;
  emptyMessage?: string;
  keyExtractor: (item: T) => string | number;
}

export function DataTable<T>({
  columns,
  data,
  isLoading = false,
  isError = false,
  errorMessage,
  onRetry,
  pageSize = 10,
  emptyMessage = 'No records found matching criteria.',
  keyExtractor,
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);

  if (isLoading) {
    return <LoadingState message="Loading records from telecom registry..." />;
  }

  if (isError) {
    return <ApiError message={errorMessage} onRetry={onRetry} />;
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 bg-surface rounded-[8px] border border-border text-center shadow-xs">
        {/* Centered outlined icon with circular + badge in corner */}
        <div className="relative mb-4">
          <div className="w-14 h-14 rounded-full bg-surface-alt border border-border flex items-center justify-center text-muted-fg">
            <Inbox className="w-7 h-7" strokeWidth={1.5} />
          </div>
          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-accent text-white flex items-center justify-center border-2 border-white shadow-2xs">
            <Plus className="w-3 h-3" strokeWidth={3} />
          </div>
        </div>

        {/* Serif heading */}
        <h3 className="font-serif text-[18px] font-normal leading-6 text-heading mb-1.5">No records found</h3>

        {/* Muted description text (14px) */}
        <p className="text-[14px] text-muted-fg max-w-sm leading-relaxed mb-6">
          {emptyMessage}
        </p>

        {/* Primary CTA button (brand sky blue #0284C7) */}
        {onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            className="btn btn-primary text-xs px-4 py-2 mb-3 shadow-xs"
          >
            Refresh Registry
          </button>
        ) : (
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="btn btn-primary text-xs px-4 py-2 mb-3 shadow-xs"
          >
            Reload Records
          </button>
        )}

        {/* Secondary text link below (#016BF8) */}
        <a
          href="#"
          onClick={(e) => e.preventDefault()}
          className="text-xs font-semibold text-[#016BF8] hover:underline inline-flex items-center gap-1 transition-colors"
        >
          <span>Learn more about SCM registry requirements</span>
          <ArrowRight className="w-3 h-3" />
        </a>
      </div>
    );
  }

  const totalPages = Math.ceil(data.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const currentItems = data.slice(startIndex, startIndex + pageSize);

  return (
    <div className="bg-surface rounded-[10px] border border-border border-t-2 border-t-sky-500 shadow-xs overflow-hidden flex flex-col">
      <div className="overflow-x-auto max-h-[600px] relative">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-sky-100 dark:border-slate-800 bg-gradient-to-r from-sky-50/80 via-slate-50 to-sky-50/40 dark:from-slate-850 dark:via-sky-950/40 dark:to-slate-850 sticky top-0 z-10">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-[11px] font-bold text-muted-fg uppercase tracking-wider select-none ${
                    col.className || ''
                  }`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E8EDEB] text-[13px] text-foreground">
            {currentItems.map((item) => (
              <tr
                key={keyExtractor(item)}
                className="hover:bg-background transition-colors duration-100 group"
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-4 py-3 font-normal align-middle ${col.className || ''}`}
                  >
                    {col.render ? col.render(item) : (item as any)[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-2.5 bg-background border-t border-border text-[12px] text-muted-fg">
          <span className="tabular-nums">
            Showing <strong className="text-foreground font-semibold font-mono">{startIndex + 1}</strong> to{' '}
            <strong className="text-foreground font-semibold font-mono">{Math.min(startIndex + pageSize, data.length)}</strong> of{' '}
            <strong className="text-foreground font-semibold font-mono">{data.length}</strong> items
          </span>
          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-md border border-border bg-surface hover:bg-surface-alt disabled:opacity-30 disabled:hover:bg-surface transition-colors duration-100"
              aria-label="Previous Page"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 font-semibold text-foreground tabular-nums font-mono text-[11px]">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-md border border-border bg-surface hover:bg-surface-alt disabled:opacity-30 disabled:hover:bg-surface transition-colors duration-100"
              aria-label="Next Page"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

