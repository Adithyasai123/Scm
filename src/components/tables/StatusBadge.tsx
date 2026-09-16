import React from 'react';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string | number;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const normalized = String(status).toUpperCase();
  const isActive = normalized === 'ACTIVE' || normalized === '1' || normalized === 'APPROVED' || normalized === 'SUCCESS';
  const isPending = normalized === 'PENDING' || normalized === 'IN_PROGRESS';
  const isInactive = normalized === 'INACTIVE' || normalized === '0' || normalized === 'REJECTED' || normalized === 'DELETED';

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border transition-colors',
        isActive && 'bg-accent/10 text-sky-700 dark:text-sky-400 border-[#0284C7]/25',
        isPending && 'bg-[#FFFBEB] text-amber-700 border-[#FFC010]/35',
        isInactive && 'bg-[#FDF2F2] text-rose-700 border-[#DB3030]/25',
        !isActive && !isPending && !isInactive && 'bg-surface-alt text-slate-700 border-border',
        className
      )}
    >
      <span
        className={cn(
          'w-1.5 h-1.5 rounded-full mr-1.5 shrink-0',
          isActive && 'bg-[#38BDF8]',
          isPending && 'bg-[#FFC010] animate-pulse',
          isInactive && 'bg-[#DB3030]',
          !isActive && !isPending && !isInactive && 'bg-[#889397]'
        )}
      />
      {normalized === '1' ? 'ACTIVE' : normalized === '0' ? 'INACTIVE' : normalized}
    </span>
  );
};

