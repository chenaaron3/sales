import { useState } from 'react';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
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
    <div className="bg-card rounded-lg shadow-sm p-6 border border-border mb-8">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-semibold text-card-foreground">{t('filters.title')}</h2>
        {(startDate || endDate) && (
          <button
            type="button"
            onClick={handleClearFilters}
            className="text-sm font-medium text-[var(--color-primary)] hover:underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
          >
            {t('filters.clearFilters')}
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium text-card-foreground mb-2">
            {t('filters.startDate')}
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => handleDateChange('startDate', e.target.value)}
            className="w-full px-4 py-2.5 border border-input rounded-lg bg-background text-card-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-card-foreground mb-2">
            {t('filters.endDate')}
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => handleDateChange('endDate', e.target.value)}
            className="w-full px-4 py-2.5 border border-input rounded-lg bg-background text-card-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
          />
        </div>
      </div>
      <div className="mt-5">
        <p className="text-sm text-muted-foreground">
          {t('filters.categoryStoreComingSoon')}
        </p>
      </div>
    </div>
  );
}
