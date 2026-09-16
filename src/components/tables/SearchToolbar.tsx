import React from 'react';
import { Search, RefreshCw } from 'lucide-react';

interface SearchToolbarProps {
  search: string;
  onSearchChange: (val: string) => void;
  placeholder?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  extraActions?: React.ReactNode;
}

export const SearchToolbar: React.FC<SearchToolbarProps> = ({
  search,
  onSearchChange,
  placeholder = 'Search records...',
  onRefresh,
  isRefreshing = false,
  extraActions,
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 bg-surface rounded-[10px] border border-border shadow-xs">
      <div className="relative w-full sm:w-80">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-fg/70" strokeWidth={1.8} />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-9 pr-3.5 py-1.5 text-xs bg-background border border-border rounded-md text-foreground placeholder-[#889397] focus:outline-none focus:border-accent focus:bg-surface transition-colors"
        />
      </div>
      <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
        {onRefresh && (
          <button
            onClick={onRefresh}
            type="button"
            disabled={isRefreshing}
            className="p-1.5 text-muted-fg hover:text-foreground hover:bg-surface-alt rounded-md transition-colors border border-border"
            title="Refresh table data"
            aria-label="Refresh table data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} strokeWidth={1.8} />
          </button>
        )}
        {extraActions}
      </div>
    </div>
  );
};

