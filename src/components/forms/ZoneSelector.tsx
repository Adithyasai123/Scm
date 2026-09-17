import React from 'react';
import { Zone } from '@/types/api';

interface ZoneSelectorProps {
  zones: Zone[];
  selectedZoneId: number | null;
  onSelect: (zoneId: number | null) => void;
  isLoading?: boolean;
}

export const ZoneSelector: React.FC<ZoneSelectorProps> = ({
  zones,
  selectedZoneId,
  onSelect,
  isLoading = false,
}) => {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">Zone</label>
      <select
        value={selectedZoneId || ''}
        onChange={(e) => onSelect(e.target.value ? Number(e.target.value) : null)}
        disabled={isLoading}
        className="w-full px-3.5 py-2 bg-surface-alt border border-border rounded-xl text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-50"
      >
        <option value="">Select Zone...</option>
        {zones.map((zone) => (
          <option key={zone.id} value={zone.id}>
            {zone.name}
          </option>
        ))}
      </select>
    </div>
  );
};

