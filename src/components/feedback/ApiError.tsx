import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ApiErrorProps {
  message?: string;
  code?: string;
  onRetry?: () => void;
  className?: string;
}

export const ApiError: React.FC<ApiErrorProps> = ({
  message = 'An unexpected error occurred while communicating with the server.',
  code,
  onRetry,
  className,
}) => {
  return (
    <div className={cn('rounded-xl border border-rose-200 bg-rose-50/70 p-6 text-rose-900', className)}>
      <div className="flex items-start space-x-3">
        <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-rose-900">API Error {code ? `(${code})` : ''}</h4>
          <p className="text-sm text-rose-700 mt-1">{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              type="button"
              className="inline-flex items-center space-x-1.5 mt-3 px-3 py-1.5 text-xs font-semibold text-rose-800 bg-rose-100 hover:bg-rose-200 rounded-lg transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry Request</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

