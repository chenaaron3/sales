import { useState } from 'react';

import type { SalesRecord } from '../types';

interface FiltersProps {
  salesData?: SalesRecord[]; // Not used yet, but kept for future enhancements
  onFilterChange: (filters: {
    startDate: string;
    endDate: string;
    categories: string[];
    stores: string[];
  }) => void;
}

export function Filters({ onFilterChange }: FiltersProps) {
  const [startDate, setStartDate] = useState('2024-07-01'); // Default to Q3 2024
  const [endDate, setEndDate] = useState('');

  const handleDateChange = (field: 'startDate' | 'endDate', value: string) => {
    if (field === 'startDate') {
      setStartDate(value);
    } else {
      setEndDate(value);
    }

    // Update filters with current state
    onFilterChange({
      startDate: field === 'startDate' ? value : startDate,
      endDate: field === 'endDate' ? value : endDate,
      categories: [],
      stores: [],
    });
  };

  const handleClearFilters = () => {
    setStartDate('2024-07-01'); // Reset to Q3 2024 default
    setEndDate('');
    onFilterChange({
      startDate: '2024-07-01',
      endDate: '',
      categories: [],
      stores: [],
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Filters</h2>
        {(startDate || endDate) && (
          <button
            onClick={handleClearFilters}
            className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Clear Filters
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Start Date
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => handleDateChange('startDate', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            End Date
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => handleDateChange('endDate', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
      </div>
      <div className="mt-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Category and store filters coming soon
        </p>
      </div>
    </div>
  );
}
