import { useState } from 'react';

import { DayOfWeekAnalysisChart } from './DayOfWeekAnalysis';
import { SpecialDayHeatMap } from './SpecialDayHeatMap';
import { TrendChart } from './TrendChart';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group';

import type { BirthdaySalesData, DayOfWeekData, TimeSeriesData } from '../types';
import type { Granularity } from '../utils/dataAnalysis';

interface TemporalTabProps {
    birthdayDataCustomer: BirthdaySalesData[];
    birthdayDataImportantPerson: BirthdaySalesData[];
    anniversaryData: BirthdaySalesData[];
    dayOfWeekData: DayOfWeekData[];
    trendDataDaily: TimeSeriesData[];
    trendDataWeekly: TimeSeriesData[];
    trendDataMonthly: TimeSeriesData[];
}

export function TemporalTab({
    birthdayDataCustomer,
    birthdayDataImportantPerson,
    anniversaryData,
    dayOfWeekData,
    trendDataDaily,
    trendDataWeekly,
    trendDataMonthly,
}: TemporalTabProps) {
    const [granularity, setGranularity] = useState<Granularity>('monthly');

    const trendData = granularity === 'daily'
        ? trendDataDaily
        : granularity === 'weekly'
            ? trendDataWeekly
            : trendDataMonthly;

    return (
        <div className="space-y-8">
            <SpecialDayHeatMap
                birthdayDataCustomer={birthdayDataCustomer}
                birthdayDataImportantPerson={birthdayDataImportantPerson}
                anniversaryData={anniversaryData}
                metric="revenue"
            />

            <DayOfWeekAnalysisChart data={dayOfWeekData} metric="revenue" />

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>
                            Sales Trends
                        </CardTitle>
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Time:</span>
                            <ToggleGroup
                                type="single"
                                value={granularity}
                                onValueChange={(value) => value && setGranularity(value as Granularity)}
                            >
                                {(['daily', 'weekly', 'monthly'] as Granularity[]).map((g) => (
                                    <ToggleGroupItem
                                        key={g}
                                        value={g}
                                        aria-label={`${g} granularity`}
                                    >
                                        {g.charAt(0).toUpperCase() + g.slice(1)}
                                    </ToggleGroupItem>
                                ))}
                            </ToggleGroup>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <TrendChart data={trendData} granularity={granularity} />
                </CardContent>
            </Card>
        </div>
    );
}

