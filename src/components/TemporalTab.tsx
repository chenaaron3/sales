import { useState } from 'react';
import { useTranslation } from 'react-i18next';

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
    const { t } = useTranslation();
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
                            {t('temporal.salesTrends')}
                        </CardTitle>
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-600 dark:text-gray-400">{t('common.time')}:</span>
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
                                        {t(`temporal.granularity.${g}`)}
                                    </ToggleGroupItem>
                                ))}
                            </ToggleGroup>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="overflow-visible">
                    <TrendChart data={trendData} granularity={granularity} />
                </CardContent>
            </Card>
        </div>
    );
}

