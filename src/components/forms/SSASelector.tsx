import React from 'react';
import { SSA } from '@/types/api';

interface SSASelectorProps {
  ssas: SSA[];
  selectedSsaId: number | null;
  onSelect: (ssaId: number | null) => void;
  disabled?: boolean;
  isLoading?: boolean;
}

export const SSASelector: React.FC<SSASelectorProps> = ({
  ssas,
  selectedSsaId,
  onSelect,
  disabled = false,
  isLoading = false,
}) => {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">SSA (Secondary Switching Area)</label>
      <select
        value={selectedSsaId || ''}
        onChange={(e) => onSelect(e.target.value ? Number(e.target.value) : null)}
        disabled={disabled || isLoading}
        className="w-full px-3.5 py-2 bg-surface-alt border border-border rounded-xl text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-50"
      >
        <option value="">{disabled ? 'Select Circle first' : 'Select SSA...'}</option>
        {ssas.map((ssa) => (
          <option key={ssa.id} value={ssa.id}>
            {ssa.name}
          </option>
        ))}
      </select>
    </div>
  );
};

