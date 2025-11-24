/**
 * Standardized Filter Bar Component
 * Consistent search and filter UI for all list pages
 */

import { Search } from 'lucide-react';
import { Input } from './ui/input';
import { ReactNode } from 'react';

interface FilterBarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filters?: ReactNode;
  actions?: ReactNode;
  compact?: boolean;
}

export default function FilterBar({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search...',
  filters,
  actions,
  compact = false,
}: FilterBarProps) {
  return (
    <div className={`bg-muted/30 border-b border-border ${compact ? 'py-3 px-6' : 'py-4 px-6'}`}>
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            type="search"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 bg-background border-border"
          />
        </div>

        {/* Filters */}
        {filters && <div className="flex items-center gap-2 flex-shrink-0">{filters}</div>}

        {/* Actions */}
        {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
      </div>
    </div>
  );
}
