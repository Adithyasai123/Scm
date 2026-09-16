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
      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">SSA (Secondary Switching Area)</label>
      <select
        value={selectedSsaId || ''}
        onChange={(e) => onSelect(e.target.value ? Number(e.target.value) : null)}
        disabled={disabled || isLoading}
        className="w-full px-3.5 py-2.5 bg-surface border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:bg-slate-100 disabled:text-slate-400"
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

