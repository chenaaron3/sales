import { useState } from 'react';

import { BirthdayHeatMap } from './BirthdayHeatMap';
import { DayOfWeekAnalysisChart } from './DayOfWeekAnalysis';
import { TrendChart } from './TrendChart';

import type { BirthdaySalesData, DayOfWeekData, TimeSeriesData } from '../types';
import type { BirthdayType } from '../utils/dataAnalysis';
interface TemporalTabProps {
    birthdayData: BirthdaySalesData[];
    dayOfWeekData: DayOfWeekData[];
    trendData: TimeSeriesData[];
}

export function TemporalTab({
    birthdayData,
    dayOfWeekData,
    trendData,
}: TemporalTabProps) {
    const [birthdayMetric, setBirthdayMetric] = useState<'salesCount' | 'revenue' | 'transactions'>('revenue');
    const [birthdayType, setBirthdayType] = useState<BirthdayType>('importantPerson');
    const [dayOfWeekMetric, setDayOfWeekMetric] = useState<'revenue' | 'transactions' | 'customers'>('revenue');

    return (
        <div className="space-y-8">
            <BirthdayHeatMap
                data={birthdayData}
                metric={birthdayMetric}
                birthdayType={birthdayType}
                onMetricChange={setBirthdayMetric}
                onBirthdayTypeChange={setBirthdayType}
            />

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Day of Week Metric
                </label>
                <div className="flex gap-2">
                    {(['revenue', 'transactions', 'customers'] as const).map((m) => (
                        <button
                            key={m}
                            onClick={() => setDayOfWeekMetric(m)}
                            className={`px-4 py-2 rounded-md text-sm ${dayOfWeekMetric === m
                                ? 'bg-indigo-600 text-white'
                                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
                                }`}
                        >
                            {m.charAt(0).toUpperCase() + m.slice(1)}
                        </button>
                    ))}
                </div>
            </div>
            <DayOfWeekAnalysisChart data={dayOfWeekData} metric={dayOfWeekMetric} />

            <TrendChart data={trendData} granularity="monthly" />
        </div>
    );
}

