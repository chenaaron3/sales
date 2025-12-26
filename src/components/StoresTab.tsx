import { useState } from 'react';

import { StorePerformanceChart } from './StorePerformance';
import { StoreTrendsChart } from './StoreTrendsChart';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group';

import type { PerformanceWithStoreBreakdown, StoreTrend } from '../types';
import type { Granularity } from '../utils/dataAnalysis';
interface StoresTabProps {
    storePerformanceWithProducts: PerformanceWithStoreBreakdown[];
    storeTrendsWeekly: StoreTrend[];
    storeTrendsMonthly: StoreTrend[];
}

export function StoresTab({
    storePerformanceWithProducts,
    storeTrendsWeekly,
    storeTrendsMonthly,
}: StoresTabProps) {
    const [granularity, setGranularity] = useState<Granularity>('monthly');

    const storeTrends = granularity === 'weekly'
        ? storeTrendsWeekly
        : storeTrendsMonthly;

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>
                        Top 25 Stores Performance by Product
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <StorePerformanceChart data={storePerformanceWithProducts} />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>
                            Top Stores Trends Over Time
                        </CardTitle>
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Time:</span>
                            <ToggleGroup
                                type="single"
                                value={granularity}
                                onValueChange={(value) => value && setGranularity(value as Granularity)}
                            >
                                {(['weekly', 'monthly'] as Granularity[]).map((g) => (
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
                    <StoreTrendsChart data={storeTrends} granularity={granularity} />
                </CardContent>
            </Card>
        </div>
    );
}

