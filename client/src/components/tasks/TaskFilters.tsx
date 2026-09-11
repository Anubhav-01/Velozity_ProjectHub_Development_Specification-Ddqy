import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, X } from 'lucide-react';
import { TaskStatus, TaskPriority } from '../../types';

export function TaskFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const currentStatus = searchParams.get('status') || '';
  const currentPriority = searchParams.get('priority') || '';
  const currentFrom = searchParams.get('from') || '';
  const currentTo = searchParams.get('to') || '';

  const updateParam = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  const hasFilters = Boolean(currentStatus || currentPriority || currentFrom || currentTo);

  return (
    <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-sm mb-6">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <Filter className="h-4 w-4 text-indigo-600" />
          <span>Filters:</span>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1.5">
          <label className="text-xs text-gray-500 font-medium">Status:</label>
          <select
            value={currentStatus}
            onChange={(e) => updateParam('status', e.target.value)}
            className="text-xs border border-gray-300 rounded-lg px-2.5 py-1.5 bg-white text-gray-700 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
          >
            <option value="">All Statuses</option>
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="IN_REVIEW">In Review</option>
            <option value="DONE">Done</option>
          </select>
        </div>

        {/* Priority Filter */}
        <div className="flex items-center gap-1.5">
          <label className="text-xs text-gray-500 font-medium">Priority:</label>
          <select
            value={currentPriority}
            onChange={(e) => updateParam('priority', e.target.value)}
            className="text-xs border border-gray-300 rounded-lg px-2.5 py-1.5 bg-white text-gray-700 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
          >
            <option value="">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>
        </div>

        {/* Due Date Range: From */}
        <div className="flex items-center gap-1.5">
          <label className="text-xs text-gray-500 font-medium">From:</label>
          <input
            type="date"
            value={currentFrom}
            onChange={(e) => updateParam('from', e.target.value)}
            className="text-xs border border-gray-300 rounded-lg px-2.5 py-1 bg-white text-gray-700 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
          />
        </div>

        {/* Due Date Range: To */}
        <div className="flex items-center gap-1.5">
          <label className="text-xs text-gray-500 font-medium">To:</label>
          <input
            type="date"
            value={currentTo}
            onChange={(e) => updateParam('to', e.target.value)}
            className="text-xs border border-gray-300 rounded-lg px-2.5 py-1 bg-white text-gray-700 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
          />
        </div>

        {/* Clear Filters Button */}
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="text-xs text-rose-600 hover:text-rose-800 font-medium flex items-center gap-1 ml-auto transition-colors"
          >
            <X className="h-3.5 w-3.5" />
            Clear Filters
          </button>
        )}
      </div>
    </div>
  );
}
