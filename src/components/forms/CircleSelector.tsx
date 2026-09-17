import React from 'react';
import { Circle } from '@/types/api';

interface CircleSelectorProps {
  circles: Circle[];
  selectedCircleId: number | null;
  onSelect: (circleId: number | null) => void;
  disabled?: boolean;
  isLoading?: boolean;
}

export const CircleSelector: React.FC<CircleSelectorProps> = ({
  circles,
  selectedCircleId,
  onSelect,
  disabled = false,
  isLoading = false,
}) => {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">Circle</label>
      <select
        value={selectedCircleId || ''}
        onChange={(e) => onSelect(e.target.value ? Number(e.target.value) : null)}
        disabled={disabled || isLoading}
        className="w-full px-3.5 py-2 bg-surface-alt border border-border rounded-xl text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-50"
      >
        <option value="">{disabled ? 'Select Zone first' : 'Select Circle...'}</option>
        {circles.map((circle) => (
          <option key={circle.id} value={circle.id}>
            {circle.name}
          </option>
        ))}
      </select>
    </div>
  );
};

