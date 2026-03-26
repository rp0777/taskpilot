'use client';

import { Search, X, Filter } from 'lucide-react';

export interface FilterState {
  search: string;
  priority: string;
  label: string;
}

interface BoardFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  labels: string[];
  totalTasks: number;
  matchingTasks: number;
}

export default function BoardFilters({
  filters,
  onFiltersChange,
  labels,
  totalTasks,
  matchingTasks,
}: BoardFiltersProps) {
  const hasActiveFilters = filters.search || filters.priority || filters.label;

  const clearFilters = () => {
    onFiltersChange({ search: '', priority: '', label: '' });
  };

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          value={filters.search}
          onChange={(e) =>
            onFiltersChange({ ...filters, search: e.target.value })
          }
          placeholder="Search tasks..."
          className="rounded-lg border border-gray-300 bg-white pl-9 pr-3 py-1.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-56"
        />
      </div>

      {/* Priority filter */}
      <div className="flex items-center gap-1.5">
        <Filter className="h-4 w-4 text-gray-400" />
        <select
          value={filters.priority}
          onChange={(e) =>
            onFiltersChange({ ...filters, priority: e.target.value })
          }
          className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        >
          <option value="">All Priorities</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
          <option value="URGENT">Urgent</option>
        </select>
      </div>

      {/* Label filter */}
      {labels.length > 0 && (
        <select
          value={filters.label}
          onChange={(e) =>
            onFiltersChange({ ...filters, label: e.target.value })
          }
          className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        >
          <option value="">All Labels</option>
          {labels.map((label) => (
            <option key={label} value={label}>
              {label}
            </option>
          ))}
        </select>
      )}

      {/* Task count & clear */}
      {hasActiveFilters && (
        <>
          <span className="text-xs text-gray-500">
            {matchingTasks} of {totalTasks} tasks
          </span>
          <button
            onClick={clearFilters}
            className="inline-flex items-center gap-1 rounded-lg bg-gray-100 px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-200 transition-colors"
          >
            <X className="h-3 w-3" />
            Clear filters
          </button>
        </>
      )}
    </div>
  );
}
