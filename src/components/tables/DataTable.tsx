import React, { useState, useEffect } from 'react';
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
  pageSize = 5,
  emptyMessage = 'No records found matching criteria.',
  keyExtractor,
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil((data?.length || 0) / pageSize);

  // Reset to first page whenever dataset changes (e.g. search / filtering)
  useEffect(() => {
    setCurrentPage(1);
  }, [data?.length]);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  if (isLoading) {
    return <LoadingState message="Loading records from telecom registry..." />;
  }

  if (isError) {
    return <ApiError message={errorMessage} onRetry={onRetry} />;
  }

  if (!data || data.length === 0) {
    return (
      <div
        style={{ minHeight: '402px' }}
        className="flex flex-col items-center justify-center py-16 px-6 bg-surface rounded-[8px] border border-border text-center shadow-xs"
      >
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

  const startIndex = (currentPage - 1) * pageSize;
  const currentItems = data.slice(startIndex, startIndex + pageSize);

  return (
    <div
      style={{ minHeight: '402px' }}
      className="bg-surface rounded-[10px] border border-border border-t-2 border-t-sky-500 shadow-xs overflow-hidden flex flex-col justify-between"
    >
      <div
        style={{ minHeight: '354px' }}
        className="overflow-x-auto relative flex-1"
      >
        <table className="w-full text-left border-collapse">
          <thead>
            <tr
              style={{ height: '44px' }}
              className="bg-sky-500 dark:bg-sky-600 text-white sticky top-0 z-10 border-b border-sky-600/30"
            >
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-[11px] font-bold text-white uppercase tracking-wider select-none ${
                    col.className || ''
                  }`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-[13px] text-foreground">
            {currentItems.map((item, index) => (
              <tr
                key={`${keyExtractor(item)}-${startIndex + index}`}
                style={{ height: '62px' }}
                className="hover:bg-background transition-colors duration-100 group"
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    style={{ height: '62px' }}
                    className={`px-4 py-2 font-normal align-middle ${col.className || ''}`}
                  >
                    {col.render ? col.render(item) : (item as any)[col.key]}
                  </td>
                ))}
              </tr>
            ))}
            {/* Stable spacing placeholder rows so pagination footer never jumps */}
            {Array.from({ length: Math.max(0, pageSize - currentItems.length) }).map((_, idx) => (
              <tr
                key={`placeholder-${idx}`}
                style={{ height: '62px' }}
                className="border-transparent pointer-events-none select-none"
                aria-hidden="true"
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    style={{ height: '62px' }}
                    className={`px-4 py-2 text-transparent select-none ${col.className || ''}`}
                  >
                    &nbsp;
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer (5 records per page) */}
      <div
        style={{ minHeight: '48px' }}
        className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 bg-background border-t border-border text-[12px] text-muted-fg"
      >
        <span className="tabular-nums">
          Showing <strong className="text-foreground font-semibold font-mono">{data.length > 0 ? startIndex + 1 : 0}</strong> to{' '}
          <strong className="text-foreground font-semibold font-mono">{Math.min(startIndex + pageSize, data.length)}</strong> of{' '}
          <strong className="text-foreground font-semibold font-mono">{data.length}</strong> records
        </span>
        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-border bg-surface hover:bg-surface-alt disabled:opacity-30 disabled:hover:bg-surface text-[11px] font-medium text-foreground transition-colors cursor-pointer disabled:cursor-not-allowed"
            aria-label="Previous Page"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Prev</span>
          </button>

          {/* Page Number Pills */}
          <div className="flex items-center space-x-1">
            {Array.from({ length: totalPages || 1 }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`min-w-[28px] h-7 px-2 rounded-md text-[11px] font-mono font-bold transition-all cursor-pointer ${
                  currentPage === pageNum
                    ? 'bg-sky-500 text-white shadow-xs'
                    : 'border border-border bg-surface hover:bg-surface-alt text-foreground'
                }`}
                aria-label={`Page ${pageNum}`}
                aria-current={currentPage === pageNum ? 'page' : undefined}
              >
                {pageNum}
              </button>
            ))}
          </div>

          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage >= totalPages}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-border bg-surface hover:bg-surface-alt disabled:opacity-30 disabled:hover:bg-surface text-[11px] font-medium text-foreground transition-colors cursor-pointer disabled:cursor-not-allowed"
            aria-label="Next Page"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

