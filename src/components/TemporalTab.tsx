import { useState } from 'react';

import { BirthdayHeatMap } from './BirthdayHeatMap';
import { DayOfWeekAnalysisChart } from './DayOfWeekAnalysis';
import { TrendChart } from './TrendChart';

import type { BirthdaySalesData, DayOfWeekData, TimeSeriesData } from '../types';
import type { BirthdayType, Granularity } from '../utils/dataAnalysis';

interface TemporalTabProps {
    birthdayDataCustomer: BirthdaySalesData[];
    birthdayDataImportantPerson: BirthdaySalesData[];
    dayOfWeekData: DayOfWeekData[];
    trendDataDaily: TimeSeriesData[];
    trendDataWeekly: TimeSeriesData[];
    trendDataMonthly: TimeSeriesData[];
}

export function TemporalTab({
    birthdayDataCustomer,
    birthdayDataImportantPerson,
    dayOfWeekData,
    trendDataDaily,
    trendDataWeekly,
    trendDataMonthly,
}: TemporalTabProps) {
    const [birthdayType, setBirthdayType] = useState<BirthdayType>('importantPerson');
    const [granularity, setGranularity] = useState<Granularity>('monthly');

    const birthdayData = birthdayType === 'customer'
        ? birthdayDataCustomer
        : birthdayDataImportantPerson;

    const trendData = granularity === 'daily'
        ? trendDataDaily
        : granularity === 'weekly'
            ? trendDataWeekly
            : trendDataMonthly;

    return (
        <div className="space-y-8">
            <BirthdayHeatMap
                data={birthdayData}
                metric="revenue"
                birthdayType={birthdayType}
                onBirthdayTypeChange={setBirthdayType}
            />

            <DayOfWeekAnalysisChart data={dayOfWeekData} metric="revenue" />

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Time Granularity
                </label>
                <div className="flex gap-2">
                    {(['daily', 'weekly', 'monthly'] as Granularity[]).map((g) => (
                        <button
                            key={g}
                            onClick={() => setGranularity(g)}
                            className={`px-4 py-2 rounded-md text-sm ${granularity === g
                                ? 'bg-indigo-600 text-white'
                                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
                                }`}
                        >
                            {g.charAt(0).toUpperCase() + g.slice(1)}
                        </button>
                    ))}
                </div>
            </div>
            <TrendChart data={trendData} granularity={granularity} />
        </div>
    );
}

