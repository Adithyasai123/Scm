import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingStateProps {
  message?: string;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading data...',
  className,
}) => {
  return (
    <div className={cn('flex flex-col items-center justify-center p-12 text-slate-500 space-y-3', className)}>
      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      <p className="text-sm font-medium animate-pulse">{message}</p>
    </div>
  );
};

