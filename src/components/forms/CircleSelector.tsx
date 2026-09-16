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
      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Circle</label>
      <select
        value={selectedCircleId || ''}
        onChange={(e) => onSelect(e.target.value ? Number(e.target.value) : null)}
        disabled={disabled || isLoading}
        className="w-full px-3.5 py-2.5 bg-surface border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:bg-slate-100 disabled:text-slate-400"
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

